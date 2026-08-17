import type { ActivityType, LeadSource, LeadStatus, OpportunityStatus } from "@prisma/client";

export const LEAD_SOURCES: LeadSource[] = ["SITE", "EMAIL", "PHONE", "REFERRAL", "MANUAL"];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  SITE: "Сайт",
  EMAIL: "Email",
  PHONE: "Телефон",
  REFERRAL: "Рекомендация",
  MANUAL: "Вручную",
};

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новый",
  CONTACTED: "На связи",
  QUALIFIED: "Квалифицирован",
  CONVERTED: "Конвертирован",
  LOST: "Потерян",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "#2563eb",
  CONTACTED: "#0891b2",
  QUALIFIED: "#7c3aed",
  CONVERTED: "#16a34a",
  LOST: "#dc2626",
};

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = ["OPEN", "WON", "LOST"];

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  OPEN: "Открыта",
  WON: "Выиграна",
  LOST: "Проиграна",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  NOTE: "Заметка",
  TASK: "Задача",
};

export const STAGE_SEED_ORDER = [
  { name: "Квалификация", order: 1 },
  { name: "Предложение", order: 2 },
  { name: "Переговоры", order: 3 },
  { name: "Контракт", order: 4 },
];
