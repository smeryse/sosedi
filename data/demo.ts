export type DemoRoommate = {
  id: string;
  name: string;
  age: number;
  job: string;
  budget: number;
  district: string;
  compatibility: number;
  image: string;
  traits: string[];
};

export type DemoProperty = {
  id: string;
  title: string;
  address: string;
  district: string;
  price: number;
  rooms: number;
  area: number;
  floor: string;
  image: string;
  match: number;
  photosCount: number;
  tags: string[];
  cianUrl?: string;
};

export const demoRoommates: DemoRoommate[] = [
  {
    id: "maria",
    name: "Мария",
    age: 24,
    job: "Маркетолог",
    budget: 25_000,
    district: "Центральный район",
    compatibility: 96,
    image: "/demo/people/maria.jpg",
    traits: ["Спокойная", "Любит порядок"],
  },
  {
    id: "artem",
    name: "Артём",
    age: 27,
    job: "Разработчик",
    budget: 28_000,
    district: "Прикубанский округ",
    compatibility: 94,
    image: "/demo/people/artem.jpg",
    traits: ["Без вечеринок", "Работает из дома"],
  },
  {
    id: "ekaterina",
    name: "Екатерина",
    age: 26,
    job: "Дизайнер",
    budget: 30_000,
    district: "Западный округ",
    compatibility: 93,
    image: "/demo/people/ekaterina.jpg",
    traits: ["Не курит", "Ценит тишину"],
  },
  {
    id: "ilya",
    name: "Илья",
    age: 29,
    job: "Предприниматель",
    budget: 27_000,
    district: "Карасунский округ",
    compatibility: 91,
    image: "/demo/people/ilya.jpg",
    traits: ["Работает из дома", "Без гостей"],
  },
];

export const demoProperties: DemoProperty[] = [
  {
    id: "center-loft",
    title: "1-комн. квартира, 35 м² — Центральный район",
    address: "ул. Северная, д. 426",
    district: "Центральный район",
    price: 25000,
    rooms: 1,
    area: 35,
    floor: "2/9",
    image: "/demo/properties/center-loft.jpg",
    match: 98,
    photosCount: 10,
    tags: ["Реальный объект ЦИАН", "От: АРЕАТОР", "Центр"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317717478/"
  },
  {
    id: "cian-318182747",
    title: "1-комн. квартира, 42 м² — Прикубанский округ",
    address: "ул. им. Героя Яцкова И.В., д. 15/1",
    district: "Прикубанский округ",
    price: 28000,
    rooms: 1,
    area: 42,
    floor: "9/16",
    image: "/demo/properties/festival-flat.jpg",
    match: 97,
    photosCount: 11,
    tags: ["Реальный объект ЦИАН", "От: Застроевъ", "ККБ"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/318182747/"
  },
  {
    id: "cian-317424192",
    title: "1-комн. квартира, 38 м² — Центральный район",
    address: "ул. им. Кондратенко Н.И., д. 8",
    district: "Центральный район",
    price: 32000,
    rooms: 1,
    area: 38,
    floor: "16/24",
    image: "/demo/properties/park-room.jpg",
    match: 96,
    photosCount: 12,
    tags: ["Реальный объект ЦИАН", "Видовой этаж", "Центр"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317424192/"
  },
  {
    id: "cian-318181657",
    title: "1-комн. квартира, 40 м² — Прикубанский округ",
    address: "ул. Агрохимическая, д. 84",
    district: "Прикубанский округ",
    price: 23000,
    rooms: 1,
    area: 40,
    floor: "2/6",
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 95,
    photosCount: 13,
    tags: ["Реальный объект ЦИАН", "Доступная аренда", "РИП"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/318181657/"
  },
  {
    id: "cian-316527017",
    title: "1-комн. квартира, 41 м² — Прикубанский округ",
    address: "ул. им. Заполярная, д. 37 к 3",
    district: "Прикубанский округ",
    price: 30000,
    rooms: 1,
    area: 41,
    floor: "10/16",
    image: "/demo/properties/center-loft.jpg",
    match: 94,
    photosCount: 14,
    tags: ["Реальный объект ЦИАН", "Западный Обход", "Свежий ремонт"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/316527017/"
  },
  {
    id: "cian-318180479",
    title: "1-комн. квартира, 40 м² — Прикубанский округ",
    address: "ул. им. Героя Яцкова И.В., д. 9к1",
    district: "Прикубанский округ",
    price: 26000,
    rooms: 1,
    area: 40,
    floor: "14/16",
    image: "/demo/properties/festival-flat.jpg",
    match: 93,
    photosCount: 15,
    tags: ["Реальный объект ЦИАН", "Панорама", "Губернский"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/318180479/"
  },
  {
    id: "cian-317130635",
    title: "1-комн. квартира, 36 м² — Прикубанский округ",
    address: "ул. им. Генерала Трошева Г.Н., д. 47",
    district: "Прикубанский округ",
    price: 32000,
    rooms: 1,
    area: 36,
    floor: "11/16",
    image: "/demo/properties/park-room.jpg",
    match: 92,
    photosCount: 16,
    tags: ["Реальный объект ЦИАН", "Парк Галицкого", "Вся техника"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317130635/"
  },
  {
    id: "cian-317926715",
    title: "1-комн. квартира, 38 м² — Прикубанский округ",
    address: "ул. Восточно-Кругликовская, д. 48",
    district: "Прикубанский округ",
    price: 27000,
    rooms: 1,
    area: 38,
    floor: "10/16",
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 91,
    photosCount: 17,
    tags: ["Реальный объект ЦИАН", "Панорама", "Балкон"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317926715/"
  },
  {
    id: "cian-317822949",
    title: "1-комн. квартира, 40 м² — Прикубанский округ",
    address: "ул. Восточно-Кругликовская, д. 22",
    district: "Прикубанский округ",
    price: 30000,
    rooms: 1,
    area: 40,
    floor: "11/16",
    image: "/demo/properties/center-loft.jpg",
    match: 90,
    photosCount: 10,
    tags: ["Реальный объект ЦИАН", "Стадион Краснодар", "Кондиционер"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317822949/"
  },
  {
    id: "cian-316200257",
    title: "1-комн. квартира, 37 м² — Центральный район",
    address: "ул. Промышленная, д. 19",
    district: "Центральный район",
    price: 35000,
    rooms: 1,
    area: 37,
    floor: "9/22",
    image: "/demo/properties/festival-flat.jpg",
    match: 89,
    photosCount: 11,
    tags: ["Реальный объект ЦИАН", "ЖК Промышленный", "Центр"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/316200257/"
  },
  {
    id: "cian-318175317",
    title: "1-комн. квартира, 45 м² — Прикубанский округ",
    address: "ул. им. 40-летия Победы, д. 178 к 1",
    district: "Прикубанский округ",
    price: 33000,
    rooms: 1,
    area: 45,
    floor: "4/16",
    image: "/demo/properties/park-room.jpg",
    match: 88,
    photosCount: 12,
    tags: ["Реальный объект ЦИАН", "40 лет Победы", "Уютная"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/318175317/"
  },
  {
    id: "cian-317789725",
    title: "1-комн. квартира, 38 м² — Прикубанский округ",
    address: "ул. им. Героя Аверкиева А.А., д. 22",
    district: "Прикубанский округ",
    price: 30000,
    rooms: 1,
    area: 38,
    floor: "5/14",
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 87,
    photosCount: 13,
    tags: ["Реальный объект ЦИАН", "ККБ", "Меблирована"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317789725/"
  },
  {
    id: "cian-316520336",
    title: "2-комн. квартира, 63 м² — Карасунский округ (ГМР / ЧМР)",
    address: "ул. им. Игнатова, д. 2/1",
    district: "Карасунский округ (ГМР / ЧМР)",
    price: 40000,
    rooms: 2,
    area: 63,
    floor: "8/10",
    image: "/demo/properties/center-loft.jpg",
    match: 98,
    photosCount: 14,
    tags: ["Реальный объект ЦИАН", "ГМР / ЧМР", "Просторная 2-к"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/316520336/"
  },
  {
    id: "cian-316827376",
    title: "2-комн. квартира, 65 м² — Прикубанский округ",
    address: "ул. им. Героя Яцкова И.В., д. 16",
    district: "Прикубанский округ",
    price: 35000,
    rooms: 2,
    area: 65,
    floor: "10/16",
    image: "/demo/properties/festival-flat.jpg",
    match: 97,
    photosCount: 15,
    tags: ["Реальный объект ЦИАН", "Губернский", "Евроремонт"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/316827376/"
  },
  {
    id: "cian-318181165",
    title: "2-комн. квартира, 54 м² — Прикубанский округ",
    address: "ул. им. Героя Сарабеева В.И., д. 5",
    district: "Прикубанский округ",
    price: 35000,
    rooms: 2,
    area: 54,
    floor: "2/16",
    image: "/demo/properties/park-room.jpg",
    match: 96,
    photosCount: 16,
    tags: ["Реальный объект ЦИАН", "Панорама", "Раздельный с/у"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/318181165/"
  },
  {
    id: "cian-317452391",
    title: "2-комн. квартира, 73 м² — Центральный район",
    address: "ул. Фабричная, д. 5",
    district: "Центральный район",
    price: 60000,
    rooms: 2,
    area: 73,
    floor: "6/22",
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 95,
    photosCount: 17,
    tags: ["Реальный объект ЦИАН", "Элитный дом", "Центр"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317452391/"
  },
  {
    id: "cian-317804473",
    title: "2-комн. квартира, 58 м² — Прикубанский округ",
    address: "ул. им. 40-летия Победы, д. 178к1",
    district: "Прикубанский округ",
    price: 40000,
    rooms: 2,
    area: 58,
    floor: "4/16",
    image: "/demo/properties/center-loft.jpg",
    match: 94,
    photosCount: 10,
    tags: ["Реальный объект ЦИАН", "40 лет Победы", "Лоджия"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317804473/"
  },
  {
    id: "cian-317926107",
    title: "2-комн. квартира, 70 м² — Прикубанский округ",
    address: "ул. Российская, д. 72/1",
    district: "Прикубанский округ",
    price: 38000,
    rooms: 2,
    area: 70,
    floor: "9/17",
    image: "/demo/properties/festival-flat.jpg",
    match: 93,
    photosCount: 11,
    tags: ["Реальный объект ЦИАН", "Лента", "Просторная 2-к"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317926107/"
  },
  {
    id: "cian-317865203",
    title: "2-комн. квартира, 64 м² — Прикубанский округ",
    address: "ул. Ковалева, д. 1",
    district: "Прикубанский округ",
    price: 42000,
    rooms: 2,
    area: 64,
    floor: "7/10",
    image: "/demo/properties/park-room.jpg",
    match: 92,
    photosCount: 12,
    tags: ["Реальный объект ЦИАН", "ФМР", "Тихий двор"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/317865203/"
  },
  {
    id: "cian-316527581",
    title: "2-комн. квартира, 67 м² — Западный округ",
    address: "ул. Кубанская Набережная, д. 27",
    district: "Западный округ (ФМР / ЮМР)",
    price: 70000,
    rooms: 2,
    area: 67,
    floor: "5/14",
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 91,
    photosCount: 13,
    tags: ["Реальный объект ЦИАН", "Кубанская Набережная", "Вид на реку"],
    cianUrl: "https://krasnodar.cian.ru/rent/flat/316527581/"
  }
];

export function formatRubles(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}