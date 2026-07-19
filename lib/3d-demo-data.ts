export interface CityBuilding {
  id: string;
  name: string;
  address: string;
  price: number;
  priceFormatted: string;
  coordinates: [number, number]; // [lng, lat]
  matchPercentage: number;
  timeToKubSU: number; // minutes
  rooms: string;
  area: string;
  image: string;
  roommates: {
    name: string;
    avatar: string;
    match: number;
  }[];
}

export interface QualityZone {
  id: string;
  name: string;
  peopleCount: number;
  matchScore: number;
  status: "green" | "yellow" | "red";
  polygon: [number, number][];
}

export interface RoommateAssignment {
  id: string;
  name: string;
  avatar: string;
  role: string;
  roomId: string | null;
  basePrice: number;
  adjustedPrice: number;
  hasWorkplace?: boolean;
}

export interface RoomDefinition {
  id: string;
  name: string;
  areaM2: number;
  type: "private" | "common";
  hasBalcony?: boolean;
  hasPrivateBath?: boolean;
  suggestedPrice: number;
}

export interface GameSituation {
  id: number;
  timeOfDay: "morning" | "noon" | "evening" | "night";
  title: string;
  question: string;
  options: {
    id: string;
    label: string;
    impact: number; // compatibility impact score
  }[];
}

export const MOCK_BUILDINGS: CityBuilding[] = [
  {
    id: "stavropolskaya-123",
    name: "ЖК «На Ставропольской»",
    address: "ул. Ставропольская, 123/1",
    price: 22000,
    priceFormatted: "22 000 ₽",
    coordinates: [38.976, 45.035],
    matchPercentage: 87,
    timeToKubSU: 18,
    rooms: "2-комнатная",
    area: "64 м²",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    roommates: [
      { name: "Анна", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", match: 96 },
      { name: "Илья", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", match: 91 },
      { name: "Арина", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", match: 89 },
      { name: "Роман", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", match: 87 },
    ],
  },
  {
    id: "krasnaya-176",
    name: "ЖК «Центральный»",
    address: "ул. Красная, 176",
    price: 23000,
    priceFormatted: "23 000 ₽",
    coordinates: [38.968, 45.039],
    matchPercentage: 92,
    timeToKubSU: 24,
    rooms: "3-комнатная",
    area: "78 м²",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    roommates: [
      { name: "Мария", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", match: 95 },
      { name: "Дмитрий", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", match: 92 },
    ],
  },
  {
    id: "severnaya-324",
    name: "ЖК «Северное Сияние»",
    address: "ул. Северная, 324",
    price: 20500,
    priceFormatted: "20 500 ₽",
    coordinates: [38.955, 45.031],
    matchPercentage: 81,
    timeToKubSU: 29,
    rooms: "2-комнатная",
    area: "58 м²",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    roommates: [
      { name: "Елена", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", match: 84 },
    ],
  },
  {
    id: "kubanskaya-45",
    name: "ЖК «Речной Парк»",
    address: "ул. Кубанская, 45",
    price: 24000,
    priceFormatted: "24 000 ₽",
    coordinates: [38.985, 45.042],
    matchPercentage: 89,
    timeToKubSU: 12,
    rooms: "3-комнатная",
    area: "85 м²",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    roommates: [
      { name: "Максим", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", match: 90 },
      { name: "София", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", match: 88 },
    ],
  },
];

export const MOCK_ROOMS: RoomDefinition[] = [
  { id: "room-master", name: "Главная спальня", areaM2: 22, type: "private", hasBalcony: true, suggestedPrice: 15000 },
  { id: "room-balcony", name: "Вторая спальня", areaM2: 18, type: "private", hasBalcony: false, suggestedPrice: 14000 },
  { id: "room-small", name: "Уютная спальня", areaM2: 14, type: "private", hasBalcony: false, suggestedPrice: 11000 },
  { id: "room-living", name: "Просторная гостиная", areaM2: 24, type: "common", suggestedPrice: 0 },
];

export const MOCK_ROOMMATES: RoommateAssignment[] = [
  {
    id: "roman",
    name: "Роман",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "Дизайнер",
    roomId: "room-master",
    basePrice: 15000,
    adjustedPrice: 15000,
  },
  {
    id: "ilya",
    name: "Илья",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Разработчик",
    roomId: "room-living",
    basePrice: 14000,
    adjustedPrice: 14000,
    hasWorkplace: true,
  },
  {
    id: "arina",
    name: "Арина",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    role: "Маркетолог",
    roomId: "room-balcony",
    basePrice: 11000,
    adjustedPrice: 11000,
  },
];

export const GAME_SITUATIONS: GameSituation[] = [
  {
    id: 1,
    timeOfDay: "morning",
    title: "Ситуация 1 из 5",
    question: "На кухне с вечера осталась грязная посуда соседа. Ваши действия?",
    options: [
      { id: "wash-self", label: "Помою молча сам(а), не делая из этого проблему", impact: 80 },
      { id: "write-chat", label: "Напишу вежливо в общий чат с просьбой убрать", impact: 95 },
      { id: "schedule", label: "Предложу установить четкий график дежурств по кухне", impact: 90 },
      { id: "leave-as-is", label: "Оставлю как есть, посуда не моя", impact: 65 },
    ],
  },
  {
    id: 2,
    timeOfDay: "evening",
    title: "Ситуация 2 из 5",
    question: "Сосед пригласил гостей поздно вечером",
    options: [
      { id: "normal", label: "Нормально", impact: 70 },
      { id: "warned", label: "Только по предупреждению", impact: 98 },
      { id: "against", label: "Категорически против", impact: 60 },
      { id: "depends", label: "Зависит от дня недели", impact: 88 },
    ],
  },
  {
    id: 3,
    timeOfDay: "noon",
    title: "Ситуация 3 из 5",
    question: "Закончился общий бытовой быт (кофе, бытовая химия, салфетки)",
    options: [
      { id: "who-saw", label: "Покупает тот, кто первый заметил", impact: 75 },
      { id: "common-budget", label: "Складываемся в общий фонд бытовых расходов", impact: 96 },
      { id: "everyone-own", label: "Каждый покупает только строго своё", impact: 82 },
      { id: "turn-by-turn", label: "Покупаем строго по очереди", impact: 89 },
    ],
  },
  {
    id: 4,
    timeOfDay: "night",
    title: "Ситуация 4 из 5",
    question: "Отношение к уровню шума после 23:00",
    options: [
      { id: "total-quiet", label: "Полная тишина, в 23:00 гасим свет и звук", impact: 92 },
      { id: "headphones", label: "Только в наушниках, спокойный досуг", impact: 95 },
      { id: "flexible", label: "Гибко, если никому не мешает", impact: 85 },
    ],
  },
  {
    id: 5,
    timeOfDay: "morning",
    title: "Ситуация 5 из 5",
    question: "Рабочая зона в гостиной: можно ли работать весь день на диване?",
    options: [
      { id: "welcome", label: "Да, гостиная общая — каждый может там работать", impact: 90 },
      { id: "agreed-hours", label: "Только в согласованное время, чтобы не занимать место", impact: 94 },
      { id: "own-room", label: "Работа лучше в своей комнате", impact: 78 },
    ],
  },
];
