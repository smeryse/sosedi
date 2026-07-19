export type NavIconName =
  | "bell"
  | "bot"
  | "building"
  | "calendar"
  | "user"
  | "file"
  | "gamepad"
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
  { label: "Поиск жилья", href: "/app/housing", icon: "building" },
  { label: "Поиск соседей", href: "/app/roommates", icon: "search" },
  { label: "Моя группа", href: "/app/group", icon: "users" },
  { label: "Избранное", href: "/app/favorites", icon: "heart" },
  { label: "Сообщения", href: "/app/messages", icon: "message", badge: "2" },
  { label: "Мои заявки", href: "/app/applications", icon: "file" },
  { label: "Рекомендации", href: "/app/recommendations", icon: "bell" },
  { label: "Расписание дел", href: "/app/chores", icon: "calendar" },
  { label: "Расходы", href: "/app/budget", icon: "wallet" },
  { label: "Симулятор быта", href: "/app/simulator", icon: "gamepad", badge: "NEW" },
  { label: "Профиль и настройки", href: "/app/profile", icon: "settings" },
];

export const ownerNavigation: NavItem[] = [
  { label: "Главная", href: "/owner", icon: "home" },
  { label: "Мои объекты", href: "/owner/properties", icon: "building" },
  { label: "Заявки", href: "/owner/applications", icon: "file" },
  { label: "Сообщения", href: "/owner/messages", icon: "message", badge: "2" },
  { label: "Аналитика", href: "/owner/analytics", icon: "dashboard" },
  { label: "Настройки", href: "/owner/profile", icon: "settings" },
];
