import { describe, expect, it } from "vitest";
import {
  convertLeadSchema,
  leadSchema,
  opportunityLostSchema,
  opportunityWonSchema,
} from "@/lib/validation";

describe("leadSchema", () => {
  it("accepts a lead with only a phone (no email)", () => {
    const result = leadSchema.safeParse({
      title: "Стенд для выставки",
      name: "Иван Петров",
      email: "",
      phone: "+79991234567",
      source: "SITE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a lead with neither email nor phone", () => {
    const result = leadSchema.safeParse({
      title: "Стенд для выставки",
      name: "Иван Петров",
      email: "",
      phone: "",
      source: "SITE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid source", () => {
    const result = leadSchema.safeParse({
      title: "Стенд",
      name: "Иван",
      email: "a@b.com",
      source: "CARRIER_PIGEON",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const result = leadSchema.safeParse({
      title: "",
      name: "Иван",
      email: "a@b.com",
      source: "SITE",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toBeTruthy();
  });
});

describe("opportunityWonSchema", () => {
  it("rejects a zero amount", () => {
    const result = opportunityWonSchema.safeParse({ amount: "0", contactId: "c1" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing contact", () => {
    const result = opportunityWonSchema.safeParse({ amount: "1000", contactId: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a positive amount with a contact", () => {
    const result = opportunityWonSchema.safeParse({ amount: "1000", contactId: "c1" });
    expect(result.success).toBe(true);
  });
});

describe("opportunityLostSchema", () => {
  it("rejects an empty reason", () => {
    const result = opportunityLostSchema.safeParse({ lostReason: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a non-empty reason", () => {
    const result = opportunityLostSchema.safeParse({ lostReason: "Клиент выбрал конкурента" });
    expect(result.success).toBe(true);
  });
});

describe("convertLeadSchema", () => {
  const base = {
    accountName: "ООО Ромашка",
    contactFirstName: "Иван",
    contactLastName: "Петров",
    contactEmail: "ivan@example.com",
    createOpportunity: "on",
  };

  it("accepts a valid convert payload", () => {
    const result = convertLeadSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects when the contact has neither email nor phone", () => {
    const result = convertLeadSchema.safeParse({ ...base, contactEmail: "", contactPhone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing account name", () => {
    const result = convertLeadSchema.safeParse({ ...base, accountName: "" });
    expect(result.success).toBe(false);
  });
});
