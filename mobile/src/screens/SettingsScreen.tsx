import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Bell,
  Shield,
  Globe,
  User,
  Smartphone,
  Mail,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  Key,
  HelpCircle,
  Info,
  Wifi,
  Database,
  Cloud,
  Download,
  UserPlus,
  Home,
  Clock,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

import { AppNavigation } from '../types/navigation';

interface SettingsScreenProps { navigation: AppNavigation; }

interface SettingItem {
  key: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  default?: boolean;
  type?: 'select' | 'action' | 'info';
  options?: string[];
  destructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Уведомления',
    items: [
      { key: 'pushMessages', label: 'Push-уведомления', subtitle: 'Новые сообщения и приглашения', icon: Bell, default: true },
      { key: 'pushInvites', label: 'Приглашения в группы', subtitle: 'Когда вас добавляют в группу', icon: UserPlus, default: true },
      { key: 'pushApplications', label: 'Статус заявок', subtitle: 'Обновления по заявкам на жилье', icon: Home, default: true },
      { key: 'pushMatches', label: 'Новые совпадения', subtitle: 'Подходящие соседи и квартиры', icon: Smartphone, default: true },
      { key: 'emailDigest', label: 'Еженедельный дайджест', subtitle: 'Итоги недели по почте', icon: Mail, default: false },
    ],
  },
  {
    title: 'Внешний вид',
    items: [
      { key: 'theme', label: 'Тема приложения', subtitle: 'Светлая', icon: Smartphone, type: 'info' },
      { key: 'language', label: 'Язык', subtitle: 'Русский / English', icon: Globe, type: 'select', options: ['ru', 'en'] },
      { key: 'fontSize', label: 'Размер шрифта', subtitle: 'Малый / Средний / Крупный', icon: Smartphone, type: 'select', options: ['small', 'medium', 'large'] },
    ],
  },
  {
    title: 'Приватность и безопасность',
    items: [
      { key: 'profileVisibility', label: 'Видимость профиля', subtitle: 'Кто видит ваш профиль', icon: User, type: 'select', options: ['everyone', 'verified', 'groups'] },
      { key: 'showOnline', label: 'Показывать статус онлайн', subtitle: 'В чатах и профиле', icon: Wifi, default: true },
      { key: 'showLastSeen', label: 'Последний вход', subtitle: 'Время последней активности', icon: Clock, default: true },
      { key: 'twoFactor', label: 'Двухфакторная аутентификация', subtitle: 'Дополнительная защита аккаунта', icon: Shield, default: false },
      { key: 'verification', label: 'Подтверждение личности', subtitle: 'Паспорт, селфи и контакты', icon: Shield, type: 'action' },
      { key: 'changePassword', label: 'Сменить пароль', subtitle: 'Обновить пароль доступа', icon: Key, type: 'action' },
      { key: 'blockedUsers', label: 'Заблокированные пользователи', subtitle: 'Управление черным списком', icon: Lock, type: 'action' },
    ],
  },
  {
    title: 'Данные и хранилище',
    items: [
      { key: 'cacheSize', label: 'Размер кэша', subtitle: '~45 МБ', icon: Database, type: 'info' },
      { key: 'clearCache', label: 'Очистить кэш', subtitle: 'Освободить место на устройстве', icon: Trash2, type: 'action', destructive: true },
      { key: 'downloadData', label: 'Скачать мои данные', subtitle: 'Получить архив с данными профиля', icon: Download, type: 'action' },
      { key: 'autoBackup', label: 'Автобэкап в облако', subtitle: 'Синхронизация с iCloud / Google Drive', icon: Cloud, default: true },
      { key: 'wifiOnlyBackup', label: 'Бэкап только по Wi-Fi', subtitle: 'Экономия мобильного трафика', icon: Wifi, default: true },
    ],
  },
  {
    title: 'Поддержка и приложение',
    items: [
      { key: 'helpCenter', label: 'Центр помощи', subtitle: 'FAQ и руководства', icon: HelpCircle, type: 'action' },
      { key: 'feedback', label: 'Обратная связь', subtitle: 'Сообщить о проблеме или предложить идею', icon: Mail, type: 'action' },
      { key: 'rateApp', label: 'Оценить приложение', subtitle: 'Поделиться впечатлениями', icon: Shield, type: 'action' },
      { key: 'about', label: 'О приложении', subtitle: 'Версия 1.0.0, лицензии, правовая информация', icon: Info, type: 'action' },
      { key: 'deleteAccount', label: 'Удалить аккаунт', subtitle: 'Навсегда удалить профиль и данные', icon: Trash2, type: 'action', destructive: true },
    ],
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState({
    pushMessages: true,
    pushInvites: true,
    pushApplications: true,
    pushMatches: true,
    emailDigest: false,
    language: 'ru',
    fontSize: 'medium',
    profileVisibility: 'verified',
    showOnline: true,
    showLastSeen: true,
    twoFactor: false,
    autoBackup: true,
    wifiOnlyBackup: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => {
      const value = prev[key];
      if (typeof value !== 'boolean') return prev;
      return { ...prev, [key]: !value };
    });
  };

  const renderItem = (item: SettingItem) => {
    const value = item.key in settings
      ? settings[item.key as keyof typeof settings]
      : undefined;
    const isDestructive = item.destructive;

    if (item.type === 'select') {
      const options = item.options ?? [];
      return (
        <TouchableOpacity
          style={[styles.settingRow, { marginBottom: 8 }]}
          onPress={() => {
            if (options.length === 0) return;
            const currentIndex = options.indexOf(String(value));
            const nextIndex = (currentIndex + 1) % options.length;
            setSettings((prev) => ({ ...prev, [item.key]: options[nextIndex] }));
          }}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.accentSoft }]}>
              <item.icon size={18} color={COLORS.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, isDestructive && styles.settingValueDestructive]}>
              {options[Math.max(0, options.indexOf(String(value)))] || String(value)}
            </Text>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'action') {
      return (
        <TouchableOpacity
          style={[styles.settingRow, { marginBottom: 8 }]}
          onPress={() => {
            if (item.key === 'deleteAccount') {
              Alert.alert(
                'Удалить аккаунт?',
                'Это действие нельзя отменить. Все данные будут удалены навсегда.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  { text: 'Удалить', style: 'destructive', onPress: () => navigation.navigate('Auth') },
                ]
              );
            } else if (item.key === 'changePassword') {
              navigation.navigate('Auth');
            } else if (item.key === 'verification') {
              navigation.navigate('Verification');
            } else if (item.key === 'clearCache') {
              Alert.alert('Кэш очищен', 'Временные файлы удалены. Данные профиля сохранены.');
            } else if (item.key === 'downloadData') {
              Alert.alert('Архив готовится', 'Ссылка на скачивание придёт на вашу почту.');
            } else if (item.key === 'helpCenter') {
              Alert.alert('Центр помощи', 'Ответы на частые вопросы доступны в разделе FAQ на сайте «Соседи».');
            } else if (item.key === 'feedback') {
              Alert.alert('Обратная связь', 'Опишите проблему в чате поддержки — ответим в течение рабочего дня.');
            } else if (item.key === 'rateApp') {
              Alert.alert('Спасибо!', 'Оценка станет доступна после публикации приложения в магазине.');
            } else if (item.key === 'about') {
              Alert.alert('Соседи 1.0.0', 'Совместная аренда и подбор соседей в Краснодаре.');
            } else if (item.key === 'blockedUsers') {
              Alert.alert('Заблокированные пользователи', 'В списке пока никого нет.');
            }
          }}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: isDestructive ? COLORS.dangerSoft : COLORS.accentSoft }]}>
              <item.icon size={18} color={isDestructive ? COLORS.danger : COLORS.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, isDestructive && styles.settingLabelDestructive]}>{item.label}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      );
    }

    if (item.type === 'info') {
      return (
        <View style={[styles.settingRow, { marginBottom: 8 }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.accentSoft }]}>
              <item.icon size={18} color={COLORS.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </View>
      );
    }

    // Switch type (default)
    return (
      <TouchableOpacity style={[styles.settingRow, { marginBottom: 8 }]} onPress={() => toggleSetting(item.key as keyof typeof settings)} activeOpacity={0.9}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: value ? COLORS.accentSoft : COLORS.surfaceMuted }]}>
            <item.icon size={18} color={value ? COLORS.accent : COLORS.textMuted} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <Switch
          value={Boolean(value)}
          onValueChange={() => toggleSetting(item.key as keyof typeof settings)}
          thumbColor={Boolean(value) ? COLORS.accent : COLORS.border}
          trackColor={{ false: COLORS.border, true: COLORS.accentSoft }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SETTINGS_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionBox}>
              {section.items.map((item, itemIndex) => renderItem(item))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              'Выйти из аккаунта?',
              'Вы можете войти снова в любое время.',
              [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Выйти', style: 'destructive', onPress: () => navigation.navigate('Auth') },
              ]
            );
          }}
        >
          <LogOut size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Sosedi v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  sectionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    minWidth: 0,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingLabelDestructive: {
    color: COLORS.danger,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  settingValueDestructive: {
    color: COLORS.danger,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    marginTop: 16,
    marginHorizontal: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 24,
  },
});
