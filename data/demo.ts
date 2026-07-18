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
  district: string;
  price: number;
  rooms: number;
  area: number;
  image: string;
  match: number;
};

export const demoRoommates: DemoRoommate[] = [
  {
    id: "maria",
    name: "Мария",
    age: 24,
    job: "Маркетолог",
    budget: 25_000,
    district: "Центр",
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
    district: "Фестивальный",
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
    district: "Юбилейный",
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
    district: "Черёмушки",
    compatibility: 91,
    image: "/demo/people/ilya.jpg",
    traits: ["Работает из дома", "Без гостей"],
  },
];

export const demoProperties: DemoProperty[] = [
  {
    id: "center-loft",
    title: "Светлая квартира в центре",
    district: "Центр",
    price: 45_000,
    rooms: 2,
    area: 54,
    image: "/demo/properties/center-loft.jpg",
    match: 98,
  },
  {
    id: "festival-flat",
    title: "Квартира рядом с парком",
    district: "Фестивальный",
    price: 39_000,
    rooms: 2,
    area: 48,
    image: "/demo/properties/festival-flat.jpg",
    match: 95,
  },
  {
    id: "yubileyniy-room",
    title: "Комната в спокойном районе",
    district: "Юбилейный",
    price: 22_000,
    rooms: 1,
    area: 18,
    image: "/demo/properties/yubileyniy-room.jpg",
    match: 93,
  },
  {
    id: "park-room",
    title: "Комната у Галицкого парка",
    district: "Панорама",
    price: 24_000,
    rooms: 1,
    area: 16,
    image: "/demo/properties/park-room.jpg",
    match: 91,
  },
];

export function formatRubles(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
