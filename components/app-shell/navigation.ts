export type NavIconName =
  | "bell"
  | "bot"
  | "building"
  | "calendar"
  | "user"
  | "file"
  | "heart"
  | "home"
  | "dashboard"
  | "message"
  | "wallet"
  | "search"
  | "settings"
  | "users";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
  badge?: string;
}

export type NavigationItem = NavItem;

export const tenantNavigation: NavItem[] = [
  { label: "Главная", href: "/app", icon: "home" },
  { label: "Поиск сожителей", href: "/app/roommates", icon: "search" },
  { label: "Поиск жилья", href: "/app/housing", icon: "building" },
  { label: "Мои объявления", href: "/app/applications", icon: "file" },
  { label: "Избранное", href: "/app/favorites", icon: "heart" },
  { label: "Сообщения", href: "/app/messages", icon: "message", badge: "2" },
  { label: "Заявки", href: "/app/recommendations", icon: "bell" },
  { label: "Мои группы", href: "/app/group", icon: "users" },
  { label: "Календарь уборок", href: "/app/chores", icon: "calendar" },
  { label: "Расходы", href: "/app/budget", icon: "wallet" },
  { label: "AI ассистент", href: "/app/assistant", icon: "bot", badge: "BETA" },
  { label: "Настройки", href: "/app/settings", icon: "settings" },
];

export const ownerNavigation: NavItem[] = [
  { label: "Главная", href: "/owner", icon: "home" },
  { label: "Мои объекты", href: "/owner/properties", icon: "building" },
  { label: "Заявки", href: "/owner/applications", icon: "file" },
  { label: "Сообщения", href: "/owner/messages", icon: "message", badge: "2" },
  { label: "Аналитика", href: "/owner/analytics", icon: "dashboard" },
  { label: "Настройки", href: "/owner/settings", icon: "settings" },
];
