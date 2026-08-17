import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// revalidatePath() throws "static generation store missing" outside a real
// Next.js request — stub it so the actions under test run the same
// Prisma/business-rule logic they run in the app, minus the framework glue.
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
  unstable_cache: (fn: unknown) => fn,
}));

import { prisma } from "@/lib/prisma";
import { convertLeadAction } from "@/actions/leads";
import { markOpportunityLostAction, markOpportunityWonAction } from "@/actions/opportunities";
import { completeTaskAction } from "@/actions/activities";
import { getDashboardData } from "@/server/dashboard";

function formData(obj: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) fd.set(k, v);
  return fd;
}

// These tests exercise the real business-rule server actions against the
// project's actual PostgreSQL database (DATABASE_URL from .env), the same
// database used by `npm run dev`. Every fixture it creates is tracked and
// removed in afterAll so the seeded demo dataset is left untouched.
describe("business rules (integration, real Postgres)", () => {
  let stageId: string;
  const createdLeadIds: string[] = [];
  const createdAccountIds: string[] = [];
  const createdOpportunityIds: string[] = [];

  beforeAll(async () => {
    const stage = await prisma.stage.findFirst({ orderBy: { order: "asc" } });
    if (!stage) throw new Error("No stage found — run `npm run db:seed` before the test suite.");
    stageId = stage.id;
  });

  afterAll(async () => {
    await prisma.activity.deleteMany({ where: { opportunityId: { in: createdOpportunityIds } } });
    await prisma.opportunity.deleteMany({ where: { id: { in: createdOpportunityIds } } });
    await prisma.lead.deleteMany({ where: { id: { in: createdLeadIds } } });
    await prisma.contact.deleteMany({ where: { accountId: { in: createdAccountIds } } });
    await prisma.account.deleteMany({ where: { id: { in: createdAccountIds } } });
    await prisma.$disconnect();
  });

  it("converts a lead into account+contact+opportunity and blocks duplicate conversion", async () => {
    const lead = await prisma.lead.create({
      data: {
        title: "[test] Convert candidate",
        name: "Test Person",
        email: "test-convert@example.com",
        source: "SITE",
      },
    });
    createdLeadIds.push(lead.id);

    const fd = formData({
      accountName: "[test] Convert Account",
      contactFirstName: "Test",
      contactLastName: "Person",
      contactEmail: "test-convert@example.com",
      createOpportunity: "on",
      opportunityName: "[test] Converted Opportunity",
      opportunityAmount: "100000",
      opportunityStageId: stageId,
    });

    let redirectDigest: string | undefined;
    try {
      await convertLeadAction(lead.id, null, fd);
    } catch (e) {
      redirectDigest = (e as { digest?: string })?.digest;
    }
    expect(redirectDigest).toMatch(/^NEXT_REDIRECT/);

    const updated = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(updated.status).toBe("CONVERTED");
    expect(updated.convertedAccountId).toBeTruthy();
    expect(updated.convertedContactId).toBeTruthy();
    expect(updated.convertedOpportunityId).toBeTruthy();

    createdAccountIds.push(updated.convertedAccountId as string);
    createdOpportunityIds.push(updated.convertedOpportunityId as string);

    const account = await prisma.account.findUniqueOrThrow({ where: { id: updated.convertedAccountId! } });
    expect(account.name).toBe("[test] Convert Account");

    // A second conversion attempt on the same (now-converted) lead must be rejected.
    const duplicateResult = await convertLeadAction(lead.id, null, fd);
    expect(duplicateResult?.error).toMatch(/уже конвертирован/i);
  });

  it("blocks WON without an amount, blocks WON without a contact, allows WON with both", async () => {
    const account = await prisma.account.create({ data: { name: "[test] Won Account" } });
    createdAccountIds.push(account.id);
    const contact = await prisma.contact.create({
      data: { firstName: "A", lastName: "B", email: "wontest@example.com", accountId: account.id },
    });

    const oppNoAmount = await prisma.opportunity.create({
      data: { name: "[test] No amount", stageId, accountId: account.id, contactId: contact.id, amount: null },
    });
    createdOpportunityIds.push(oppNoAmount.id);
    const r1 = await markOpportunityWonAction(oppNoAmount.id, null, new FormData());
    expect(r1?.error).toMatch(/сумма/i);
    expect((await prisma.opportunity.findUniqueOrThrow({ where: { id: oppNoAmount.id } })).status).toBe("OPEN");

    const oppNoContact = await prisma.opportunity.create({
      data: { name: "[test] No contact", stageId, accountId: account.id, amount: 5000, contactId: null },
    });
    createdOpportunityIds.push(oppNoContact.id);
    const r2 = await markOpportunityWonAction(oppNoContact.id, null, new FormData());
    expect(r2?.error).toMatch(/контакт/i);
    expect((await prisma.opportunity.findUniqueOrThrow({ where: { id: oppNoContact.id } })).status).toBe("OPEN");

    const oppValid = await prisma.opportunity.create({
      data: { name: "[test] Valid won", stageId, accountId: account.id, contactId: contact.id, amount: 5000 },
    });
    createdOpportunityIds.push(oppValid.id);
    const r3 = await markOpportunityWonAction(oppValid.id, null, new FormData());
    expect(r3).toBeNull();
    expect((await prisma.opportunity.findUniqueOrThrow({ where: { id: oppValid.id } })).status).toBe("WON");
  });

  it("blocks LOST without a reason, allows LOST with a reason", async () => {
    const account = await prisma.account.create({ data: { name: "[test] Lost Account" } });
    createdAccountIds.push(account.id);
    const opp = await prisma.opportunity.create({
      data: { name: "[test] Lost candidate", stageId, accountId: account.id },
    });
    createdOpportunityIds.push(opp.id);

    const r1 = await markOpportunityLostAction(opp.id, null, formData({ lostReason: "" }));
    expect(r1?.fieldErrors?.lostReason).toBeTruthy();
    expect((await prisma.opportunity.findUniqueOrThrow({ where: { id: opp.id } })).status).toBe("OPEN");

    const r2 = await markOpportunityLostAction(opp.id, null, formData({ lostReason: "Слишком дорого" }));
    expect(r2).toBeNull();
    const updated = await prisma.opportunity.findUniqueOrThrow({ where: { id: opp.id } });
    expect(updated.status).toBe("LOST");
    expect(updated.lostReason).toBe("Слишком дорого");
  });

  it("completes a task", async () => {
    const account = await prisma.account.create({ data: { name: "[test] Task Account" } });
    createdAccountIds.push(account.id);
    const opp = await prisma.opportunity.create({
      data: { name: "[test] Task opportunity", stageId, accountId: account.id },
    });
    createdOpportunityIds.push(opp.id);
    const task = await prisma.activity.create({
      data: { type: "TASK", title: "[test] Do the thing", opportunityId: opp.id, done: false },
    });

    const result = await completeTaskAction(task.id, null, new FormData());
    expect(result).toBeNull();
    const updated = await prisma.activity.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated.done).toBe(true);
  });

  it("dashboard aggregation matches direct database counts", async () => {
    const data = await getDashboardData();
    const [totalLeads, openOpportunities] = await Promise.all([
      prisma.lead.count(),
      prisma.opportunity.count({ where: { status: "OPEN" } }),
    ]);
    expect(data.totalLeads).toBe(totalLeads);
    expect(data.openOpportunities).toBe(openOpportunities);

    const sumByStatus = data.leadsByStatus.reduce((sum, row) => sum + row.count, 0);
    expect(sumByStatus).toBe(totalLeads);

    const sumBySource = data.leadsBySource.reduce((sum, row) => sum + row.count, 0);
    expect(sumBySource).toBe(totalLeads);
  });
});
