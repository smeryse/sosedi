export type NavigationIconName =
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

export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIconName;
  badge?: number;
  exact?: boolean;
};

export const tenantNavigation: NavigationItem[] = [
  { label: "Главная", href: "/app", icon: "home", exact: true },
  { label: "Поиск жилья", href: "/app/housing", icon: "building" },
  { label: "Поиск соседей", href: "/app/roommates", icon: "search" },
  { label: "Моя группа", href: "/app/group", icon: "users" },
  { label: "Заявки", href: "/app/applications", icon: "file" },
  { label: "Избранное", href: "/app/favorites", icon: "heart" },
  {
    label: "Сообщения",
    href: "/app/messages",
    icon: "message",
    badge: 3,
  },
  {
    label: "Бюджет и расходы",
    href: "/app/budget",
    icon: "wallet",
  },
  {
    label: "Уборка и задачи",
    href: "/app/chores",
    icon: "calendar",
  },
  { label: "AI-помощник", href: "/app/assistant", icon: "bot" },
  {
    label: "Уведомления",
    href: "/app/notifications",
    icon: "bell",
    badge: 5,
  },
  { label: "Профиль", href: "/app/profile", icon: "user" },
  { label: "Настройки", href: "/app/settings", icon: "settings" },
];

export const ownerNavigation: NavigationItem[] = [
  { label: "Обзор", href: "/owner", icon: "dashboard", exact: true },
  { label: "Мои объекты", href: "/owner/properties", icon: "building" },
  { label: "Заявки", href: "/owner/applications", icon: "file" },
  { label: "Сообщения", href: "/owner/messages", icon: "message" },
  { label: "Аналитика", href: "/owner/analytics", icon: "wallet" },
  { label: "Профиль", href: "/owner/profile", icon: "user" },
  { label: "Настройки", href: "/owner/settings", icon: "settings" },
];
