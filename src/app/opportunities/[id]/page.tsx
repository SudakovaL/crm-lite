import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunityById } from "@/server/opportunities";
import { getStages } from "@/server/stages";
import { Card, CardHeader, PageHeader, Badge, LinkButton } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { QuickActionButton } from "@/components/quick-action-button";
import { StageChangeForm } from "@/components/stage-change-form";
import { MarkLostForm } from "@/components/mark-lost-form";
import { AddNoteForm, AddTaskForm } from "@/components/activity-forms";
import { ActivityList } from "@/components/activity-list";
import {
  deleteOpportunityAction,
  markOpportunityWonAction,
  markOpportunityLostAction,
  changeStageAction,
} from "@/actions/opportunities";
import { addNoteAction, addTaskAction } from "@/actions/activities";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_COLOR = { OPEN: "blue", WON: "green", LOST: "red" } as const;

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, stages] = await Promise.all([getOpportunityById(id), getStages()]);
  if (!opportunity) notFound();

  const isOpen = opportunity.status === "OPEN";
  const canMarkWon = Boolean(opportunity.amount && opportunity.amount > 0 && opportunity.contactId);

  return (
    <div>
      <PageHeader
        title={opportunity.name}
        subtitle={
          <Badge color={STATUS_COLOR[opportunity.status]}>
            {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
          </Badge>
        }
        actions={
          <>
            <LinkButton href={`/opportunities/${opportunity.id}/edit`} variant="secondary">
              Редактировать
            </LinkButton>
            <DeleteButton
              action={deleteOpportunityAction.bind(null, opportunity.id)}
              confirmMessage={`Удалить сделку «${opportunity.name}»? Все связанные заметки и задачи тоже будут удалены.`}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>Данные сделки</CardHeader>
            <dl className="p-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted text-xs uppercase">Компания</dt>
                <dd>
                  <Link href={`/accounts/${opportunity.account.id}`} className="hover:underline">
                    {opportunity.account.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Контакт</dt>
                <dd>
                  {opportunity.contact ? (
                    <Link href={`/contacts/${opportunity.contact.id}`} className="hover:underline">
                      {opportunity.contact.firstName} {opportunity.contact.lastName}
                    </Link>
                  ) : (
                    <span className="text-muted">Не указан</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Стадия</dt>
                <dd>{opportunity.stage.name}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs uppercase">Сумма</dt>
                <dd>{formatCurrency(opportunity.amount)}</dd>
              </div>
              {opportunity.expectedCloseDate && (
                <div>
                  <dt className="text-muted text-xs uppercase">Ожидаемое закрытие</dt>
                  <dd>{formatDate(opportunity.expectedCloseDate)}</dd>
                </div>
              )}
              {opportunity.description && (
                <div>
                  <dt className="text-muted text-xs uppercase">Описание</dt>
                  <dd className="whitespace-pre-wrap">{opportunity.description}</dd>
                </div>
              )}
              {opportunity.status === "LOST" && opportunity.lostReason && (
                <div>
                  <dt className="text-muted text-xs uppercase">Причина отказа</dt>
                  <dd className="text-danger">{opportunity.lostReason}</dd>
                </div>
              )}
              {opportunity.convertedFromLead && (
                <div>
                  <dt className="text-muted text-xs uppercase">Источник</dt>
                  <dd>
                    Конвертирована из лида{" "}
                    <Link href={`/leads/${opportunity.convertedFromLead.id}`} className="hover:underline">
                      {opportunity.convertedFromLead.title}
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted text-xs uppercase">Обновлена</dt>
                <dd>{formatDateTime(opportunity.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          {isOpen && (
            <Card>
              <CardHeader>Быстрые действия</CardHeader>
              <div className="p-4 space-y-4">
                <StageChangeForm
                  action={changeStageAction.bind(null, opportunity.id)}
                  stages={stages}
                  currentStageId={opportunity.stageId}
                />
                <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                  <QuickActionButton
                    action={markOpportunityWonAction.bind(null, opportunity.id)}
                    label="Отметить как выигранную"
                    pendingText="Сохранение…"
                    variant="primary"
                    confirmMessage="Отметить сделку как выигранную?"
                  />
                  <MarkLostForm action={markOpportunityLostAction.bind(null, opportunity.id)} />
                </div>
                {!canMarkWon && (
                  <p className="text-xs text-muted">
                    Чтобы отметить сделку как выигранную, укажите сумму и контакт (в редактировании).
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>Добавить заметку / задачу</CardHeader>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddNoteForm action={addNoteAction.bind(null, opportunity.id)} />
              <AddTaskForm action={addTaskAction.bind(null, opportunity.id)} />
            </div>
          </Card>

          <Card>
            <CardHeader>Активность ({opportunity.activities.length})</CardHeader>
            <ActivityList activities={opportunity.activities} />
          </Card>
        </div>
      </div>
    </div>
  );
}
