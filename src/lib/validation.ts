import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);

const optionalEmail = z.preprocess(
  emptyToUndef,
  z.string().email("Некорректный email").optional()
);
const optionalString = z.preprocess(emptyToUndef, z.string().optional());
const optionalDate = z.preprocess(
  emptyToUndef,
  z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Некорректная дата")
    .optional()
);
const optionalInt = z.preprocess(
  emptyToUndef,
  z.coerce.number().int("Целое число").min(0, "Не может быть отрицательным").optional()
);

export const leadSchema = z
  .object({
    title: z.string().trim().min(1, "Укажите тему обращения"),
    name: z.string().trim().min(1, "Укажите имя контактного лица"),
    company: optionalString,
    email: optionalEmail,
    phone: optionalString,
    source: z.enum(["SITE", "EMAIL", "PHONE", "REFERRAL", "MANUAL"], {
      error: "Выберите источник",
    }),
    status: z
      .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"])
      .optional(),
    budget: optionalInt,
    venue: optionalString,
    description: optionalString,
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Укажите email или телефон",
    path: ["email"],
  });

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Укажите название компании"),
  email: optionalEmail,
  phone: optionalString,
  website: optionalString,
  description: optionalString,
});

export const contactSchema = z
  .object({
    firstName: z.string().trim().min(1, "Укажите имя"),
    lastName: z.string().trim().min(1, "Укажите фамилию"),
    email: optionalEmail,
    phone: optionalString,
    position: optionalString,
    accountId: z.string().trim().min(1, "Выберите компанию"),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Укажите email или телефон",
    path: ["email"],
  });

export const opportunitySchema = z.object({
  name: z.string().trim().min(1, "Укажите название сделки"),
  amount: optionalInt,
  stageId: z.string().trim().min(1, "Выберите стадию"),
  accountId: z.string().trim().min(1, "Выберите компанию"),
  contactId: optionalString,
  description: optionalString,
  expectedCloseDate: optionalDate,
});

export const opportunityStageChangeSchema = z.object({
  stageId: z.string().trim().min(1, "Выберите стадию"),
});

export const opportunityWonSchema = z.object({
  amount: z.coerce.number().int("Целое число").positive("Укажите сумму сделки"),
  contactId: z.string().trim().min(1, "У сделки должен быть указан контакт"),
});

export const opportunityLostSchema = z.object({
  lostReason: z.string().trim().min(1, "Укажите причину отказа"),
});

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Укажите текст заметки"),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Укажите задачу"),
  dueDate: optionalDate,
});

export const convertLeadSchema = z
  .object({
    accountName: z.string().trim().min(1, "Укажите название компании"),
    accountWebsite: optionalString,
    contactFirstName: z.string().trim().min(1, "Укажите имя контакта"),
    contactLastName: z.string().trim().min(1, "Укажите фамилию контакта"),
    contactEmail: optionalEmail,
    contactPhone: optionalString,
    contactPosition: optionalString,
    createOpportunity: z.preprocess(
      (v) => v === "on" || v === "true" || v === true,
      z.boolean()
    ),
    opportunityName: optionalString,
    opportunityAmount: optionalInt,
    opportunityStageId: optionalString,
  })
  .refine((data) => Boolean(data.contactEmail) || Boolean(data.contactPhone), {
    message: "Укажите email или телефон контакта",
    path: ["contactEmail"],
  });

export type LeadInput = z.infer<typeof leadSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
