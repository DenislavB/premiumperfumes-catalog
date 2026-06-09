// Company / merchant data — "ОМАЯ 2025" ЕООД
export const COMPANY = {
  name: "„ОМАЯ 2025“ ЕООД",
  nameEn: "OMAYA 2025 EOOD",
  eik: "208065500",
  seat: "с. Коняво, ул. „Кирил и Методий“ 18, общ. Кюстендил",
  seatEn: "Konyavo, 18 Kiril i Metodiy St., Kyustendil municipality, Bulgaria",
  store: "гр. Кюстендил, бул. „Цар Освободител“ 91",
  storeEn: "Kyustendil, 91 Tsar Osvoboditel Blvd., Bulgaria",
  email: "info@premiumperfumes.bg",
  site: "premiumperfumes.bg",
};

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

const UPDATED_BG = "Последна актуализация: юни 2026 г.";
const UPDATED_EN = "Last updated: June 2026";

// ───────────────────────── PRIVACY (Политика за поверителност) ─────────────────────────
const privacyBg: LegalDoc = {
  title: "Политика за поверителност",
  updated: UPDATED_BG,
  sections: [
    {
      heading: "1. Администратор на лични данни",
      body: [
        `Администратор на Вашите лични данни е ${COMPANY.name}, ЕИК ${COMPANY.eik}, със седалище и адрес на управление: ${COMPANY.seat}.`,
        `Физически магазин: ${COMPANY.store}.`,
        `За контакт по въпроси, свързани със защитата на личните данни: ${COMPANY.email} или чрез контактната форма на сайта.`,
      ],
    },
    {
      heading: "2. Какви данни събираме",
      body: [
        "• Идентификационни и контактни данни: две имена, телефонен номер, имейл адрес;",
        "• Данни за доставка: избран куриер (Speedy или Еконт) и адрес/офис за доставка;",
        "• Данни от заявки за покупка: заявени продукти, размер и цена, бележки;",
        "• Данни от контактната форма: име, имейл/телефон и съдържание на съобщението;",
        "• Данни от промоционални игри (напр. „Завъртете колелото“): име, имейл и/или телефон и спечелена награда;",
        "• Технически данни: функционални бисквитки (език на сайта).",
      ],
    },
    {
      heading: "3. Цели и правни основания за обработката",
      body: [
        "• Обработка и изпълнение на заявки за покупка и организиране на доставка — на основание предприемане на стъпки по Ваше искане преди сключване на договор;",
        "• Отговор на запитвания през контактната форма — на основание легитимен интерес да отговаряме на запитвания;",
        "• Участие в промоционални игри и предоставяне на награди — на основание Вашето съгласие;",
        "• Изпращане на маркетингови съобщения — само ако сте дали изрично съгласие за това (отделна отметка);",
        "• Спазване на законови задължения (счетоводни, данъчни) — на основание законово задължение.",
      ],
    },
    {
      heading: "4. Получатели на данните",
      body: [
        "Вашите данни могат да бъдат предоставени на куриерски фирми (Speedy, Еконт) с цел доставка, както и на доставчици на хостинг и технически услуги, които обработват данни от наше име при стриктна конфиденциалност.",
        "Не продаваме и не предоставяме Вашите данни на трети лица за техни самостоятелни цели.",
      ],
    },
    {
      heading: "5. Срок на съхранение",
      body: [
        "Съхраняваме данните от заявки толкова, колкото е необходимо за изпълнението им и за срокове, изисквани от закона (напр. счетоводни). Данни от контактната форма и промоционални игри съхраняваме до постигане на целта или до оттегляне на съгласието Ви.",
      ],
    },
    {
      heading: "6. Вашите права",
      body: [
        "Имате право на: достъп до данните си; коригиране; изтриване („право да бъдете забравени“); ограничаване на обработката; преносимост; възражение срещу обработка; както и право да оттеглите съгласието си по всяко време.",
        "За упражняване на правата си се свържете с нас на посочения по-горе имейл. Имате и право на жалба до Комисията за защита на личните данни (КЗЛД), гр. София, бул. „Проф. Цветан Лазаров“ 2, www.cpdp.bg.",
      ],
    },
    {
      heading: "7. Сигурност",
      body: [
        "Прилагаме подходящи технически и организационни мерки за защита на личните Ви данни срещу неоторизиран достъп, загуба или злоупотреба.",
      ],
    },
    {
      heading: "8. Бисквитки",
      body: [
        "Сайтът използва само функционални бисквитки, необходими за работата му (напр. запазване на избрания език). Не използваме рекламни или проследяващи бисквитки. Повече информация ще намерите в Политиката за бисквитки.",
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  updated: UPDATED_EN,
  sections: [
    {
      heading: "1. Data Controller",
      body: [
        `The controller of your personal data is ${COMPANY.nameEn}, UIC ${COMPANY.eik}, registered seat: ${COMPANY.seatEn}.`,
        `Physical store: ${COMPANY.storeEn}.`,
        `For data protection enquiries: ${COMPANY.email} or via the contact form on the site.`,
      ],
    },
    {
      heading: "2. Data We Collect",
      body: [
        "• Identification and contact data: full name, phone number, email;",
        "• Delivery data: chosen courier (Speedy or Econt) and delivery address/office;",
        "• Purchase request data: requested products, size and price, notes;",
        "• Contact form data: name, email/phone and message content;",
        "• Promotional game data (e.g. \"Spin the wheel\"): name, email and/or phone and the prize won;",
        "• Technical data: functional cookies (site language).",
      ],
    },
    {
      heading: "3. Purposes and Legal Bases",
      body: [
        "• Processing purchase requests and arranging delivery — to take steps at your request prior to entering a contract;",
        "• Responding to contact enquiries — legitimate interest;",
        "• Participation in promotional games and awarding prizes — your consent;",
        "• Sending marketing messages — only with your explicit consent (separate checkbox);",
        "• Compliance with legal (accounting, tax) obligations — legal obligation.",
      ],
    },
    {
      heading: "4. Recipients",
      body: [
        "Your data may be shared with courier companies (Speedy, Econt) for delivery, and with hosting/technical providers processing data on our behalf under strict confidentiality.",
        "We never sell or share your data with third parties for their own purposes.",
      ],
    },
    {
      heading: "5. Retention",
      body: [
        "We keep purchase data for as long as necessary to fulfil orders and for legally required periods. Contact and promotional data is kept until the purpose is met or you withdraw consent.",
      ],
    },
    {
      heading: "6. Your Rights",
      body: [
        "You have the right to: access; rectification; erasure ('right to be forgotten'); restriction; portability; objection; and to withdraw consent at any time.",
        "To exercise your rights, contact us at the email above. You also have the right to lodge a complaint with the Bulgarian Commission for Personal Data Protection (CPDP), www.cpdp.bg.",
      ],
    },
    {
      heading: "7. Security",
      body: ["We apply appropriate technical and organisational measures to protect your data against unauthorised access, loss or misuse."],
    },
    {
      heading: "8. Cookies",
      body: ["The site uses only functional cookies necessary for its operation (e.g. remembering your language). We do not use advertising or tracking cookies. See the Cookies Policy for details."],
    },
  ],
};

// ───────────────────────── COOKIES (Политика за бисквитки) ─────────────────────────
const cookiesBg: LegalDoc = {
  title: "Политика за бисквитки",
  updated: UPDATED_BG,
  sections: [
    { heading: "Какво представляват бисквитките", body: ["Бисквитките са малки текстови файлове, които се съхраняват на Вашето устройство при посещение на уебсайт."] },
    {
      heading: "Какви бисквитки използваме",
      body: [
        "Използваме само строго необходими (функционални) бисквитки:",
        "• Бисквитка за избрания език на сайта (BG/EN);",
        "• Сесийна бисквитка за вход в административния панел (само за служители).",
        "Не използваме рекламни, маркетингови или аналитични проследяващи бисквитки.",
      ],
    },
    { heading: "Управление на бисквитките", body: ["Можете да управлявате и изтривате бисквитките чрез настройките на Вашия браузър. Изключването на функционалните бисквитки може да повлияе на работата на сайта."] },
  ],
};

const cookiesEn: LegalDoc = {
  title: "Cookies Policy",
  updated: UPDATED_EN,
  sections: [
    { heading: "What are cookies", body: ["Cookies are small text files stored on your device when you visit a website."] },
    {
      heading: "Cookies we use",
      body: [
        "We use only strictly necessary (functional) cookies:",
        "• A cookie for the chosen site language (BG/EN);",
        "• A session cookie for admin login (staff only).",
        "We do not use advertising, marketing or analytics tracking cookies.",
      ],
    },
    { heading: "Managing cookies", body: ["You can manage and delete cookies via your browser settings. Disabling functional cookies may affect how the site works."] },
  ],
};

// ───────────────────────── TERMS (Общи условия) ─────────────────────────
const termsBg: LegalDoc = {
  title: "Общи условия",
  updated: UPDATED_BG,
  sections: [
    {
      heading: "1. Данни за търговеца",
      body: [
        `Сайтът ${COMPANY.site} се управлява от ${COMPANY.name}, ЕИК ${COMPANY.eik}, седалище: ${COMPANY.seat}.`,
        `Физически магазин: ${COMPANY.store}. Контакт: ${COMPANY.email}.`,
      ],
    },
    {
      heading: "2. Предмет",
      body: [
        "Сайтът представлява онлайн каталог за луксозни парфюми. Чрез сайта можете да разглеждате продукти и да изпращате заявки за покупка. Сайтът не извършва онлайн плащания — заявката е искане за покупка, което потвърждаваме допълнително по телефон или имейл.",
      ],
    },
    {
      heading: "3. Заявки и сключване на договор",
      body: [
        "След изпращане на заявка наш представител ще се свърже с Вас за потвърждение на наличност, крайна цена и условия за доставка. Договорът за покупко-продажба се счита за сключен след потвърждение от двете страни.",
        "Всички цени са в евро (EUR) с включен ДДС, доколкото е приложимо.",
      ],
    },
    {
      heading: "4. Доставка",
      body: ["Доставката се извършва чрез куриерските фирми Speedy или Еконт до посочен от Вас офис или адрес. Сроковете и цените за доставка се потвърждават при обработка на заявката."],
    },
    {
      heading: "5. Промоционални кодове и игри",
      body: ["Промоционални кодове и награди от игри се прилагат съгласно условията, обявени за съответната промоция. Не подлежат на замяна срещу пари."],
    },
    {
      heading: "6. Интелектуална собственост",
      body: ["Цялото съдържание на сайта (текстове, изображения, лого) е собственост на търговеца или се използва с разрешение и не може да се възпроизвежда без съгласие."],
    },
    {
      heading: "7. Приложимо право",
      body: ["За неуредените въпроси се прилага действащото българско законодателство."],
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms & Conditions",
  updated: UPDATED_EN,
  sections: [
    { heading: "1. Merchant Data", body: [`The site ${COMPANY.site} is operated by ${COMPANY.nameEn}, UIC ${COMPANY.eik}, seat: ${COMPANY.seatEn}. Store: ${COMPANY.storeEn}. Contact: ${COMPANY.email}.`] },
    { heading: "2. Subject", body: ["The site is an online catalog of luxury perfumes. You may browse products and send purchase requests. The site does not process online payments — a request is an enquiry to purchase, which we confirm separately by phone or email."] },
    { heading: "3. Requests and Contract", body: ["After you send a request, our representative will contact you to confirm availability, final price and delivery terms. The sale contract is concluded upon mutual confirmation. All prices are in euro (EUR), incl. VAT where applicable."] },
    { heading: "4. Delivery", body: ["Delivery is via Speedy or Econt couriers to your chosen office or address. Times and costs are confirmed when processing your request."] },
    { heading: "5. Promo Codes & Games", body: ["Promo codes and game prizes apply per the terms announced for each promotion and cannot be exchanged for cash."] },
    { heading: "6. Intellectual Property", body: ["All site content (text, images, logo) belongs to the merchant or is used with permission and may not be reproduced without consent."] },
    { heading: "7. Governing Law", body: ["Bulgarian law applies to all matters not covered herein."] },
  ],
};

// ───────────────────────── RETURNS (Право на отказ и връщане) ─────────────────────────
const returnsBg: LegalDoc = {
  title: "Право на отказ и връщане на стока",
  updated: UPDATED_BG,
  sections: [
    {
      heading: "Право на отказ",
      body: [
        "Като потребител имате право да се откажете от договора от разстояние в срок от 14 дни, без да посочвате причина, съгласно Закона за защита на потребителите.",
        "Срокът започва да тече от деня, в който Вие или посочено от Вас трето лице получите стоката.",
      ],
    },
    {
      heading: "Как да упражните правото си на отказ",
      body: [
        `Уведомете ни с недвусмислено заявление (напр. писмо по пощата или имейл до ${COMPANY.email}) за решението си да се откажете. Можете да използвате стандартния формуляр за отказ, но това не е задължително.`,
      ],
    },
    {
      heading: "Връщане на стоката",
      body: [
        "Трябва да върнете стоката без неоправдано забавяне и не по-късно от 14 дни. Преките разходи по връщането са за Ваша сметка. Стоката трябва да е в оригиналния си вид и опаковка.",
      ],
    },
    {
      heading: "Възстановяване на суми",
      body: [
        "Ще Ви възстановим получените суми не по-късно от 14 дни след като сме информирани за отказа Ви. Можем да задържим възстановяването до получаване на стоката обратно.",
      ],
    },
    {
      heading: "Изключения",
      body: [
        "Правото на отказ може да не се прилага за запечатани стоки, които не подлежат на връщане поради хигиенни съображения и са разпечатани след доставката (напр. отворени отливки/тестери), съгласно чл. 57 от ЗЗП.",
      ],
    },
  ],
};

const returnsEn: LegalDoc = {
  title: "Right of Withdrawal & Returns",
  updated: UPDATED_EN,
  sections: [
    { heading: "Right of withdrawal", body: ["As a consumer you have the right to withdraw from a distance contract within 14 days without giving a reason, under Bulgarian consumer law. The period starts the day you (or a third party indicated by you) receive the goods."] },
    { heading: "How to withdraw", body: [`Notify us with an unequivocal statement (e.g. letter or email to ${COMPANY.email}) of your decision to withdraw. You may use the standard withdrawal form, but it is not mandatory.`] },
    { heading: "Returning the goods", body: ["You must return the goods without undue delay and within 14 days. The direct cost of return is yours. Goods must be in their original condition and packaging."] },
    { heading: "Refunds", body: ["We will refund you no later than 14 days after being informed of your withdrawal. We may withhold the refund until we receive the goods back."] },
    { heading: "Exceptions", body: ["The right of withdrawal may not apply to sealed goods unsuitable for return for hygiene reasons that were unsealed after delivery (e.g. opened decants/testers), per Art. 57 of the Bulgarian Consumer Protection Act."] },
  ],
};

export const LEGAL: Record<string, { bg: LegalDoc; en: LegalDoc }> = {
  privacy: { bg: privacyBg, en: privacyEn },
  cookies: { bg: cookiesBg, en: cookiesEn },
  terms: { bg: termsBg, en: termsEn },
  returns: { bg: returnsBg, en: returnsEn },
};
