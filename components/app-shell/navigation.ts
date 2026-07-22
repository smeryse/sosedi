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
  mobile?: boolean;
}

export type NavigationItem = NavItem;

export const tenantNavigation: NavItem[] = [
  { label: "Главная", href: "/app", icon: "home", mobile: true },
  { label: "Поиск жилья", href: "/app/housing", icon: "building", mobile: true },
  { label: "Поиск соседей", href: "/app/roommates", icon: "search", mobile: true },
  { label: "Моя группа", href: "/app/group", icon: "users" },
  { label: "Избранное", href: "/app/favorites", icon: "heart", mobile: true },
  { label: "Сообщения", href: "/app/messages", icon: "message", badge: "2", mobile: true },
  { label: "Мои заявки", href: "/app/applications", icon: "file" },
  { label: "Рекомендации", href: "/app/recommendations", icon: "bell" },
  { label: "Расписание дел", href: "/app/chores", icon: "calendar" },
  { label: "Расходы", href: "/app/budget", icon: "wallet" },
  { label: "Профиль и настройки", href: "/app/profile", icon: "settings" },
];

export const ownerNavigation: NavItem[] = [
  { label: "Главная", href: "/owner", icon: "home", mobile: true },
  { label: "Мои объекты", href: "/owner/properties", icon: "building", mobile: true },
  { label: "Заявки", href: "/owner/applications", icon: "file", mobile: true },
  { label: "Сообщения", href: "/owner/messages", icon: "message", badge: "2", mobile: true },
  { label: "Аналитика", href: "/owner/analytics", icon: "dashboard", mobile: true },
  { label: "Настройки", href: "/owner/settings", icon: "settings" },
];
