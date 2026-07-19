import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Bell,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Home,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

import { AppNavigation } from '../types/navigation';

interface NotificationsScreenProps { navigation: AppNavigation; }

const NOTIFICATION_TYPES = {
  message: { icon: MessageSquare, color: COLORS.info, bg: COLORS.infoSoft },
  invite: { icon: UserPlus, color: COLORS.accent, bg: COLORS.accentSoft },
  application: { icon: Home, color: COLORS.accent, bg: COLORS.accentSoft },
  system: { icon: AlertCircle, color: COLORS.warning, bg: COLORS.warningSoft },
  success: { icon: CheckCircle2, color: COLORS.success, bg: COLORS.successSoft },
} as const;

const mockNotifications = [
  {
    id: '1',
    type: 'message',
    title: 'Новое сообщение в группе',
    body: 'Мария К.: "Ребята, кто пойдет за ключами в субботу?"',
    time: '5 мин назад',
    isRead: false,
    navigation: 'Messages',
  },
  {
    id: '2',
    type: 'invite',
    title: 'Приглашение в группу',
    body: 'Артём С. приглашает вас присоединиться к группе "Центр 2026"',
    time: '1 час назад',
    isRead: false,
    navigation: 'Group',
  },
  {
    id: '3',
    type: 'application',
    title: 'Заявка принята',
    body: 'Ваша заявка на квартиру "Евро-двушка на Северной" одобрена собственником',
    time: '3 часа назад',
    isRead: true,
    navigation: 'HousingDetail',
  },
  {
    id: '4',
    type: 'application',
    title: 'Заявка на рассмотрении',
    body: 'Собственник квартиры "Студия у парка" просматривает вашу заявку',
    time: 'Вчера, 14:30',
    isRead: true,
    navigation: 'HousingDetail',
  },
  {
    id: '5',
    type: 'success',
    title: 'Группа сформирована',
    body: 'Поздравляем! Группа "Центр 2026" готова к совместной заявке (95% совместимость)',
    time: 'Вчера, 10:00',
    isRead: true,
    navigation: 'Group',
  },
  {
    id: '6',
    type: 'system',
    title: 'Новый подходящий объект',
    body: 'Появилась квартира, подходящая под критерии вашей группы: 2-комн., 45 000 ₽, Центр',
    time: '2 дня назад',
    isRead: true,
    navigation: 'Housing',
  },
  {
    id: '7',
    type: 'message',
    title: 'Новое сообщение',
    body: 'Екатерина В.: "Подскажите, как лучше разделить счет за интернет?"',
    time: '3 дня назад',
    isRead: true,
    navigation: 'Messages',
  },
  {
    id: '8',
    type: 'invite',
    title: 'Приглашение к анкете',
    body: 'Мария К. хочет, чтобы вы заполнили анкету совместимости для лучшего подбора',
    time: '4 дня назад',
    isRead: true,
    navigation: 'Compatibility',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = mockNotifications.filter((n) =>
    filter === 'all' ? true : !n.isRead
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Уведомления</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
          <Text style={[styles.filterBtnText, filter === 'unread' && styles.filterBtnTextActive]}>
            {filter === 'all' ? 'Все' : 'Непрочитанные'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map((notification) => {
          const typeConfig = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES];
          const Icon = typeConfig.icon;

          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.isRead && styles.notificationCardUnread]}
              onPress={() => navigation.navigate(notification.navigation)}
              activeOpacity={0.8}
            >
              <View style={styles.notificationRow}>
                <View style={[styles.iconWrapper, { backgroundColor: typeConfig.bg }]}>
                  <Icon size={18} color={typeConfig.color} />
                </View>

                <View style={styles.contentWrapper}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.title, !notification.isRead && styles.titleUnread]}>{notification.title}</Text>
                    <Text style={styles.time}>{notification.time}</Text>
                  </View>
                  <Text style={[styles.body, !notification.isRead && styles.bodyUnread]} numberOfLines={2}>
                    {notification.body}
                  </Text>
                </View>

                <ChevronRight size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Уведомлений нет</Text>
            <Text style={styles.emptySub}>Здесь появятся сообщения, приглашения и обновления</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterBtnTextActive: {
    color: COLORS.accent,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  notificationCardUnread: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentBorder,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  contentWrapper: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  titleUnread: {
    fontWeight: '800',
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    flexShrink: 0,
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bodyUnread: {
    color: COLORS.text,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
