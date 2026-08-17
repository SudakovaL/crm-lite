import type { Activity } from "@prisma/client";
import { Badge } from "./ui";
import { QuickActionButton } from "./quick-action-button";
import { completeTaskAction } from "@/actions/activities";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, isDueToday, isOverdue } from "@/lib/format";

export function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted px-4 py-6 text-center">Пока нет заметок и задач.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {activities.map((activity) => {
        const overdue = activity.type === "TASK" && isOverdue(activity.dueDate, activity.done);
        const dueToday = activity.type === "TASK" && isDueToday(activity.dueDate) && !activity.done;

        return (
          <li key={activity.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge color={activity.type === "TASK" ? "purple" : "gray"}>
                    {ACTIVITY_TYPE_LABELS[activity.type]}
                  </Badge>
                  {activity.type === "TASK" && activity.done && <Badge color="green">Выполнена</Badge>}
                  {overdue && <Badge color="red">Просрочена</Badge>}
                  {dueToday && !overdue && <Badge color="amber">Сегодня</Badge>}
                </div>
                <p className={`text-sm ${activity.done ? "line-through text-muted" : ""}`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {activity.type === "TASK" && activity.dueDate
                    ? `Срок: ${formatDate(activity.dueDate)} · `
                    : ""}
                  Создано {formatDateTime(activity.createdAt)}
                </p>
              </div>
              {activity.type === "TASK" && !activity.done && (
                <QuickActionButton
                  action={completeTaskAction.bind(null, activity.id)}
                  label="Выполнить"
                  pendingText="…"
                  variant="secondary"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
