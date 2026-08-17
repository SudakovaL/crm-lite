import { PrismaClient } from "@prisma/client";
import { STAGE_SEED_ORDER } from "../src/lib/constants";

const prisma = new PrismaClient();

function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.activity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.stage.deleteMany();

  console.log("Seeding stages…");
  const stages = await Promise.all(
    STAGE_SEED_ORDER.map((s) => prisma.stage.create({ data: s }))
  );
  const [qualification, proposal, negotiation, contract] = stages;

  console.log("Seeding accounts…");
  const technoprom = await prisma.account.create({
    data: {
      name: "ООО «ТехноПром Инжиниринг»",
      email: "info@technoprom-eng.ru",
      phone: "+7 343 200-11-22",
      website: "technoprom-eng.ru",
      description: "Производитель промышленного оборудования, регулярный участник отраслевых выставок.",
    },
  });

  const medovayaArtel = await prisma.account.create({
    data: {
      name: "ООО «Медовая Артель»",
      email: "brand@medartel.ru",
      phone: "+7 495 700-33-44",
      website: "medartel.ru",
      description: "Производитель продуктов питания, развивает розничный бренд на продуктовых выставках.",
    },
  });

  const stroykomplekt = await prisma.account.create({
    data: {
      name: "АО «СтройКомплект»",
      email: "office@stroykomplekt.ru",
      phone: "+7 812 555-66-77",
      website: "stroykomplekt.ru",
      description: "Поставщик строительных материалов, ежегодно арендует выставочные пространства.",
    },
  });

  const floraCosmetics = await prisma.account.create({
    data: {
      name: "ООО «Флора Косметикс»",
      email: "pr@flora-cosmetics.ru",
      phone: "+7 495 900-12-34",
      website: "flora-cosmetics.ru",
      description: "Бренд натуральной косметики, продвигается через бренд-зоны на профильных выставках.",
    },
  });

  console.log("Seeding contacts…");
  const irina = await prisma.contact.create({
    data: {
      firstName: "Ирина",
      lastName: "Соколова",
      email: "sokolova@technoprom-eng.ru",
      phone: "+7 912 001-02-03",
      position: "Директор по маркетингу",
      accountId: technoprom.id,
    },
  });

  const dmitry = await prisma.contact.create({
    data: {
      firstName: "Дмитрий",
      lastName: "Волков",
      email: "volkov@technoprom-eng.ru",
      phone: "+7 912 001-02-04",
      position: "Менеджер по выставочной деятельности",
      accountId: technoprom.id,
    },
  });

  const anna = await prisma.contact.create({
    data: {
      firstName: "Анна",
      lastName: "Кузнецова",
      email: "kuznetsova@medartel.ru",
      phone: "+7 916 200-30-40",
      position: "Бренд-менеджер",
      accountId: medovayaArtel.id,
    },
  });

  const pavel = await prisma.contact.create({
    data: {
      firstName: "Павел",
      lastName: "Орлов",
      email: "orlov@stroykomplekt.ru",
      phone: "+7 921 400-50-60",
      position: "Коммерческий директор",
      accountId: stroykomplekt.id,
    },
  });

  const ekaterina = await prisma.contact.create({
    data: {
      firstName: "Екатерина",
      lastName: "Лебедева",
      email: "lebedeva@flora-cosmetics.ru",
      phone: "+7 903 700-80-90",
      position: "PR-менеджер",
      accountId: floraCosmetics.id,
    },
  });

  console.log("Seeding opportunities…");
  const oppInnoprom = await prisma.opportunity.create({
    data: {
      name: "Стенд 72 м² для ИННОПРОМ-2026",
      amount: 3_200_000,
      status: "WON",
      stageId: contract.id,
      accountId: technoprom.id,
      contactId: irina.id,
      description: "Двухэтажный стенд с зоной переговоров и демонстрацией оборудования.",
      expectedCloseDate: daysFromToday(-10),
    },
  });

  const oppMobile = await prisma.opportunity.create({
    data: {
      name: "Мобильный стенд для регионального тура",
      amount: 850_000,
      status: "OPEN",
      stageId: negotiation.id,
      accountId: technoprom.id,
      contactId: dmitry.id,
      description: "Сборно-разборная конструкция для серии региональных отраслевых выставок.",
      expectedCloseDate: daysFromToday(21),
    },
  });

  const oppProdExpo = await prisma.opportunity.create({
    data: {
      name: "Бренд-зона на «Продэкспо-2026»",
      amount: 640_000,
      status: "OPEN",
      stageId: proposal.id,
      accountId: medovayaArtel.id,
      contactId: anna.id,
      description: "Дегустационная бренд-зона 24 м² с фирменной графикой.",
      expectedCloseDate: daysFromToday(35),
    },
  });

  await prisma.opportunity.create({
    data: {
      name: "Выставочное пространство 120 м² на «СтройМастер»",
      amount: null,
      status: "OPEN",
      stageId: qualification.id,
      accountId: stroykomplekt.id,
      contactId: null,
      description: "Клиент запросил концепцию, бюджет ещё не согласован.",
    },
  });

  const oppFlora = await prisma.opportunity.create({
    data: {
      name: "Дегустационная зона для запуска линейки",
      amount: 410_000,
      status: "LOST",
      lostReason: "Клиент выбрал другого подрядчика из-за более сжатых сроков поставки.",
      stageId: negotiation.id,
      accountId: floraCosmetics.id,
      contactId: ekaterina.id,
      description: "Компактная бренд-зона для запуска новой линейки косметики.",
    },
  });

  const oppStroyMaster2027 = await prisma.opportunity.create({
    data: {
      name: "Стенд для выставки «СтройМастер-2027»",
      amount: 1_100_000,
      status: "OPEN",
      stageId: qualification.id,
      accountId: stroykomplekt.id,
      contactId: pavel.id,
      description: "Предварительный запрос на следующий выставочный сезон.",
      expectedCloseDate: daysFromToday(90),
    },
  });

  console.log("Seeding activities…");
  await prisma.activity.create({
    data: {
      type: "NOTE",
      title: "Стенд сдан клиенту, получены положительные отзывы.",
      opportunityId: oppInnoprom.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "TASK",
      title: "Отправить итоговый акт выполненных работ",
      dueDate: daysFromToday(0),
      done: false,
      opportunityId: oppInnoprom.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "NOTE",
      title: "Обсудили размеры интерактивной зоны для демонстрации оборудования.",
      opportunityId: oppMobile.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "TASK",
      title: "Согласовать 3D-визуализацию стенда с клиентом",
      dueDate: daysFromToday(-3),
      done: false,
      opportunityId: oppMobile.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "TASK",
      title: "Подготовить коммерческое предложение с 3 вариантами дизайна",
      dueDate: daysFromToday(0),
      done: false,
      opportunityId: oppProdExpo.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "TASK",
      title: "Уточнить бюджет у клиента",
      dueDate: daysFromToday(-5),
      done: false,
      opportunityId: oppProdExpo.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "NOTE",
      title: "Клиент сообщил о выборе другого подрядчика из-за сроков поставки.",
      opportunityId: oppFlora.id,
    },
  });
  await prisma.activity.create({
    data: {
      type: "TASK",
      title: "Провести звонок для уточнения технического задания",
      dueDate: daysFromToday(-4),
      done: true,
      opportunityId: oppStroyMaster2027.id,
    },
  });

  console.log("Seeding leads…");
  await prisma.lead.create({
    data: {
      title: "Запрос стенда для конференции HR-Tech 2026",
      name: "Мария Петрова",
      company: "ООО «Персонал Плюс»",
      email: "petrova@personal-plus.ru",
      phone: "+7 903 111-22-33",
      source: "SITE",
      status: "NEW",
      budget: 500_000,
      venue: "HR-Tech 2026",
      description: "Заявка с сайта агентства, интересует компактный стенд для IT-конференции.",
    },
  });

  await prisma.lead.create({
    data: {
      title: "Оформление бренд-зоны на фестивале «Вкус России»",
      name: "Сергей Никитин",
      company: "Фермерский союз «Вкус России»",
      email: "nikitin@vkusrossii.ru",
      phone: "+7 916 222-33-44",
      source: "EMAIL",
      status: "CONTACTED",
      venue: "Вкус России",
      description: "Запрос по email, менеджер уже связался и уточняет детали.",
    },
  });

  await prisma.lead.create({
    data: {
      title: "Мобильный стенд для тура по регионам",
      name: "Ольга Захарова",
      company: "ООО «Агроресурс»",
      email: "zaharova@agroresurs.ru",
      phone: "+7 927 333-44-55",
      source: "REFERRAL",
      status: "QUALIFIED",
      budget: 900_000,
      venue: "Региональный тур выставок",
      description: "Пришли по рекомендации, бюджет и площадка уже согласованы, готовим предложение.",
    },
  });

  await prisma.lead.create({
    data: {
      title: "Стенд для выставки «Мебель-2026»",
      name: "Виктор Громов",
      company: "ООО «Мебель Сити»",
      phone: "+7 495 444-55-66",
      source: "PHONE",
      status: "LOST",
      venue: "Мебель-2026",
      description: "Звонок в офис, клиент в итоге выбрал другое агентство по цене.",
    },
  });

  await prisma.lead.create({
    data: {
      title: "Индивидуальный дизайн-проект стенда",
      name: "Наталья Крылова",
      company: "ИП Крылова Н.В.",
      email: "krylova.design@yandex.ru",
      source: "MANUAL",
      status: "NEW",
      description: "Заявка внесена менеджером вручную после разговора на отраслевом мероприятии.",
    },
  });

  await prisma.lead.create({
    data: {
      title: "Стенд для ИННОПРОМ-2026",
      name: "Ирина Соколова",
      company: "ООО «ТехноПром Инжиниринг»",
      email: "sokolova@technoprom-eng.ru",
      phone: "+7 912 001-02-03",
      source: "SITE",
      status: "CONVERTED",
      budget: 3_200_000,
      venue: "ИННОПРОМ-2026",
      description: "Исходная заявка, впоследствии конвертирована в сделку, которая была выиграна.",
      convertedAccountId: technoprom.id,
      convertedContactId: irina.id,
      convertedOpportunityId: oppInnoprom.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
