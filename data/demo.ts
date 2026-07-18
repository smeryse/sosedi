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

export const demoProperties: DemoProperty[] = [];

export function formatRubles(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
