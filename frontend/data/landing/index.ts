export interface LandingMetric {
  value: string;
  label: string;
}

export const landingMetrics: LandingMetric[] = [
  { value: "12 500+", label: "пользователей" },
  { value: "3 200+", label: "проверенных квартир" },
  { value: "16", label: "районов Краснодара" },
  { value: "4.9 ★", label: "средняя оценка" },
];

export interface LandingStep {
  step: string;
  title: string;
  desc: string;
  badge?: string;
  avatars?: string[];
  image?: string;
}

export const landingSteps: LandingStep[] = [
  {
    step: "01",
    title: "Находим подходящих соседей",
    desc: "Умный алгоритм подбирает людей, с которыми комфортно жить вместе.",
    badge: "92%",
    avatars: ["maria", "artem", "ekaterina"],
  },
  {
    step: "02",
    title: "Выбираем жильё",
    desc: "Проверенные квартиры от собственников и агентств. Фото, документы, условия.",
    image: "/demo/properties/festival-flat.jpg",
  },
  {
    step: "03",
    title: "Заселяемся вместе",
    desc: "Собирайте группу, подавайте общую заявку и переезжайте без стресса.",
    image: "/demo/properties/park-room.jpg",
  },
];

export interface LandingFeature {
  title: string;
  price: string;
  district: string;
  image: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    title: "2-комн. квартира",
    price: "38 000 ₽ / мес.",
    district: "Фестивальный",
    image: "/demo/properties/center-loft.jpg",
  },
  {
    title: "Студия у парка",
    price: "28 000 ₽ / мес.",
    district: "Панорама",
    image: "/demo/properties/festival-flat.jpg",
  },
];

export interface LandingReview {
  name: string;
  role: string;
  quote: string;
  image: string;
}

export const landingReviews: LandingReview[] = [
  {
    name: "Александра, 23",
    role: "Студентка",
    quote: "«Наша квартира в центре и соседи — как друзья. Без платформы точно бы не сошлось так идеально.»",
    image: "/demo/people/maria.jpg",
  },
  {
    name: "Дмитрий, 26",
    role: "Разработчик",
    quote: "«Впервые живём с незнакомыми людьми — и это лучший опыт. Сервис реально экономит время и нервы.»",
    image: "/demo/people/artem.jpg",
  },
  {
    name: "Илья, 25",
    role: "Маркетолог",
    quote: "«Нашли квартиру мечты и заселились своей группой за неделю. Очень удобно!»",
    image: "/demo/people/ilya.jpg",
  },
];