# Plan.md — CRM-lite для агентства выставочных стендов

## 1. Легенда продукта

Агентство проектирует и строит выставочные стенды, выставочные пространства и
бренд-зоны для клиентов, которые участвуют в отраслевых выставках. Входящие
обращения (Leads) приходят с сайта, по email, по телефону, по рекомендации или
вносятся менеджером вручную. Менеджер квалифицирует лид (бюджет, площадка,
сроки, формат работ), конвертирует его в компанию (Account) и контактное лицо
(Contact), при необходимости сразу создаёт сделку (Opportunity), ведёт её по
стадиям пайплайна, фиксирует заметки и задачи (Activity) и закрывает сделку как
выигранную (won) или проигранную (lost).

## 2. MVP-сущности и relations

```
Lead ──(convert)──▶ Account ──┬── Contact
                               └── Opportunity ── Stage
                                        └── Activity (note/task)
Contact ── Opportunity
```

- **Lead** — входящее обращение. После конвертации хранит `convertedAccountId`,
  `convertedContactId`, `convertedOpportunityId` (опциональная Opportunity).
- **Account** — компания-клиент. `1—N` Contacts, `1—N` Opportunities.
- **Contact** — контактное лицо, принадлежит ровно одному Account. `1—N`
  Opportunities.
- **Stage** — стадия пайплайна сделки (`order`, `name`). Финальные исходы
  (won/lost) **не** дублируются как стадии — они живут в `Opportunity.status`.
- **Opportunity** — сделка: `Account` (обязателен), `Contact` (опционален,
  становится обязательным для won), `Stage`, `amount`, `status`,
  `lostReason`, `expectedCloseDate`.
- **Activity** — заметка или задача, привязана к Opportunity (`opportunityId`
  обязателен, `onDelete: Cascade`). Task имеет `dueDate` и `done`.

Все связи реализованы как настоящие Prisma-relations с внешними ключами в
PostgreSQL — никаких связей "по строке" или через frontend-state.

## 3. Справочники (зафиксировано, используется последовательно)

**LeadSource**: `SITE`, `EMAIL`, `PHONE`, `REFERRAL`, `MANUAL`

**LeadStatus**: `NEW → CONTACTED → QUALIFIED → CONVERTED`, либо `→ LOST` в
любой момент до конвертации. `CONVERTED` выставляется только через Convert
Lead и не редактируется вручную.

**OpportunityStatus**: `OPEN`, `WON`, `LOST` (независимо от Stage).

**Stage (pipeline, order 1→4)**: `Квалификация → Предложение → Переговоры →
Контракт`. Стадия сделки не меняется автоматически при закрытии — сделка
остаётся на последней стадии, где была закрыта.

**ActivityType**: `NOTE`, `TASK`.

## 4. Бизнес-правила

- **Convert Lead** (`src/actions/leads.ts convertLeadAction`, обёрнут в
  `prisma.$transaction`): создаёт Account → Contact → (опционально)
  Opportunity → обновляет Lead (`status=CONVERTED` + 3 FK). Любая ошибка
  откатывает всю транзакцию — частично сконвертированного состояния быть не
  может. Запрещено: лид уже `CONVERTED`; отсутствуют обязательные поля
  (название компании, имя/фамилия контакта, email или телефон контакта).
- **Opportunity → WON**: запрещено без `amount > 0` и без `contactId`.
  Проверяется на сервере (`markOpportunityWonAction`), независимо от UI.
- **Opportunity → LOST**: запрещено без непустого `lostReason`.
- **Stage change**: доступен только для `status = OPEN` сделок.
- **Удаление**: Lead — всегда безопасно (на Lead никто не ссылается). Account/
  Contact — блокируется, если есть связанные записи (проверка в коде +
  backstop через `onDelete: Restrict`/FK, с понятным сообщением об ошибке).
  Opportunity — удаление каскадно чистит Activities, у исходного Lead
  (`convertedOpportunityId`) проставляется `NULL` (`onDelete: SetNull`).

## 5. Dashboard — KPI и агрегации

Все агрегации выполняются в Postgres через Prisma (`count`, `aggregate`,
`groupBy`) в `src/server/dashboard.ts`, без выгрузки всех строк в браузер:

- `totalLeads` — `lead.count()`
- `openOpportunities` — `opportunity.count({status: OPEN})`
- `openPipelineValue` — `opportunity.aggregate({_sum: amount, status: OPEN})`
- `overdueTasksCount` — `activity.count(TASK, done=false, dueDate < сегодня)`
- `opportunitiesByStage` — `groupBy(stageId)` **среди открытых сделок** (это
  классическая "воронка" текущего пайплайна; закрытые сделки в funnel не
  показываются, но остаются на дашборде через KPI/списки)
- `leadsByStatus`, `leadsBySource` — `groupBy`, домёрджено до полного списка
  enum-значений, чтобы источник с 0 лидов тоже отображался
- `recentLeads` — последние 5 по `createdAt`
- `overdueTasks` — список просроченных задач (до 10) с контекстом сделки
- `stuckDeals` (опционально) — открытые сделки без обновлений 14+ дней

Страница `/dashboard` объявлена `export const dynamic = "force-dynamic"`, все
мутации вызывают `revalidatePath("/dashboard")` — свежесть без WebSockets и
polling: DB изменилась → dashboard запрошен снова → новые значения.

## 6. Frontend structure

```
src/app/
  dashboard/            KPI + 2 Chart.js графика + сводки
  leads/                list (search+filters), [id] (detail+convert), new, [id]/edit
  accounts/              list (search), [id] (detail: contacts+opportunities), new, [id]/edit
  contacts/              list (search), [id] (detail: opportunities), new, [id]/edit
  opportunities/          list (search+filters), [id] (detail: stage/won/lost/activities), new, [id]/edit
src/components/          UI-примитивы, формы, чарты (Chart.js обёрнут в client components,
                          получает уже готовые данные через props — сам в БД не ходит)
src/actions/              server actions: Zod-валидация → бизнес-правила → Prisma → revalidatePath
src/server/                read-модели (список/detail/дашборд queries)
src/lib/                   prisma client, zod-схемы, форматирование, enum-labels, error handling
prisma/                    schema.prisma, migrations/, seed.ts
```

Каждая мутация идёт по цепочке `UI → Server Action → Zod → бизнес-правила →
Prisma → PostgreSQL`; сложная логика (convert, opportunity transitions,
dashboard aggregation) не живёт в React-компонентах.

## 7. Тестирование

- **Автоматические тесты** (Vitest, `src/**/*.test.ts`) покрывают Zod-схемы и
  чистую бизнес-логику: convert lead validation, won/lost preconditions,
  overdue/today date helpers.
- **Ручной demo-сценарий** (см. README «Demo scenario») — основной acceptance
  test, проходится через реальный UI на реальном PostgreSQL.

## 8. Demo scenario (кратко, подробно в README)

reset → seed → Leads → создать Lead → открыть → Convert Lead → проверить
Account/Contact/Opportunity → сменить Stage → добавить Note/Task → выполнить
Task → проверить search/filters → Dashboard → проверить KPI/графики →
изменить Lead/Opportunity → повторно открыть Dashboard → значения обновились.

## 9. Acceptance matrix

| ID | Критерий | Способ проверки | Статус |
|----|----------|------------------|--------|
| AC-001 | Prisma 6.19.3 / @prisma/client 6.19.3 | `package.json`, `npx prisma version` | PASS |
| AC-002 | `datasource db { url = env("DATABASE_URL") }`, без adapter-pg/PrismaPg/prisma.config.ts | `prisma/schema.prisma`, поиск по репозиторию | PASS |
| AC-003 | PostgreSQL подключается | `docker compose up -d`, `prisma migrate dev` прошёл | PASS |
| AC-004 | Migrations воспроизводимы | `prisma/migrations/20260817124811_init` | PASS |
| AC-005 | Chart.js 4.5.1 / react-chartjs-2 5.3.1 | `package.json` | PASS |
| AC-006 | `.env.example` с `DATABASE_URL` | файл в корне | PASS |
| AC-007 | Lead CRUD (list/detail/create/edit/delete) | `/leads`, actions/leads.ts | PASS |
| AC-008 | Account CRUD | `/accounts`, actions/accounts.ts | PASS |
| AC-009 | Contact CRUD | `/contacts`, actions/contacts.ts | PASS |
| AC-010 | Opportunity CRUD | `/opportunities`, actions/opportunities.ts | PASS |
| AC-011 | Zod-валидация клиент+сервер | `src/lib/validation.ts`, все actions | PASS |
| AC-012 | Account → Contacts/Opportunities relations | `/accounts/[id]`, schema.prisma | PASS |
| AC-013 | Contact → Account/Opportunities relations | `/contacts/[id]` | PASS |
| AC-014 | Opportunity → Account/Contact/Stage/Activities relations | `/opportunities/[id]` | PASS |
| AC-015 | Search: Contact/Account/Opportunity name | `getContacts/getAccounts/getOpportunities` (`contains`, DB) | PASS |
| AC-016 | Filters: Lead source/status, Opportunity stage/status | `ListFilters` + server queries | PASS |
| AC-017 | Convert Lead создаёт Account+Contact(+Opportunity) в транзакции | `convertLeadAction`, ручной прогон | PASS |
| AC-018 | Повторная конвертация запрещена | проверка `status === CONVERTED` в транзакции | PASS |
| AC-019 | Convert запрещён при неполных данных | Zod + required-поля формы | PASS |
| AC-020 | WON требует amount и contact | `markOpportunityWonAction` | PASS |
| AC-021 | LOST требует lostReason | `markOpportunityLostAction` + Zod | PASS |
| AC-022 | Stage change сохраняется в БД и виден везде | `changeStageAction`, revalidatePath | PASS |
| AC-023 | Activities: note/task/dueDate/done/complete | `activity-forms.tsx`, `completeTaskAction` | PASS |
| AC-024 | Dashboard KPI считаются в Postgres (count/aggregate/groupBy) | `src/server/dashboard.ts` | PASS |
| AC-025 | Dashboard обновляется без перезапуска (DB→запрос→новые значения) | `force-dynamic` + `revalidatePath` | PASS |
| AC-026 | 2 Chart.js графика (funnel by stage, leads by status) | `/dashboard`, `charts/*` | PASS |
| AC-027 | Chart-компонент не ходит в БД сам, получает props | `LeadStatusChart`/`OpportunityFunnelChart` сигнатуры | PASS |
| AC-028 | Seed: 6 Lead / 4 Account / 5 Contact / 6 Opportunity / 8 Activity | `prisma/seed.ts`, проверено запросом к БД | PASS |
| AC-029 | Seed: ≥2 overdue, ≥2 due-today задач | проверено запросом к БД (2/2) | PASS |
| AC-030 | Reset → Seed воспроизводим | `npm run db:reset` (`migrate reset --force` + auto-seed) | PASS |
| AC-031 | Lint/typecheck/build без ошибок | `npm run lint`, `npx tsc --noEmit`, `npm run build` | PASS |
| AC-032 | README покрывает установку/БД/demo/known limitations | `README.md` | PASS |

## 10. Известные компромиссы

- `package.json#prisma.seed` помечен Prisma как deprecated в пользу
  `prisma.config.ts` — но `prisma.config.ts` явно запрещён требованиями
  проекта, поэтому используется поддерживаемый (хоть и deprecated) путь;
  он полностью работает на закреплённой версии 6.19.3.
- `amount` хранится как целое число (рубли, без копеек) — осознанное
  упрощение для "lite"-CRM, а не потеря точности в реальном сценарии продаж
  выставочных стендов.
- `Opportunity.stage` не меняется автоматически при закрытии сделки — стадия
  отражает, где сделка находилась в момент закрытия (осознанное решение,
  чтобы не дублировать финальные состояния как псевдо-стадии).
