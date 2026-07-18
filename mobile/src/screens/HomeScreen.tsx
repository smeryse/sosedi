import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Users,
  Home as HomeIcon,
  Sparkles,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Bot,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { Header } from '../components/Header';
import { RoommateCard } from '../components/RoommateCard';
import { PropertyCard } from '../components/PropertyCard';
import { useGlobalState } from '../data/stateStore';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { group, roommates, properties } = useGlobalState();
  const isSubmitted = group.status === 'under_review';
  return (
    <View style={styles.container}>
      <Header
        showLogo
        onSearchPress={() => navigation.navigate('Housing')}
        onNotificationPress={() => navigation.navigate('Messages')}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Action Buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Roommates')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: COLORS.accentSoft }]}>
              <Users size={22} color={COLORS.text} />
            </View>
            <Text style={styles.actionTitle}>Соседи</Text>
            <Text style={styles.actionSub}>Подобрать</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Housing')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
              <HomeIcon size={22} color="#0284C7" />
            </View>
            <Text style={styles.actionTitle}>Жильё</Text>
            <Text style={styles.actionSub}>Поиск квартир</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Group')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FEE2E2' }]}>
              <TrendingUp size={22} color="#DC2626" />
            </View>
            <Text style={styles.actionTitle}>Группа</Text>
            <Text style={styles.actionSub}>Сожительство</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Compatibility')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FEF3C7' }]}>
              <ClipboardCheck size={22} color="#D97706" />
            </View>
            <Text style={styles.actionTitle}>Анкета</Text>
            <Text style={styles.actionSub}>20 вопросов</Text>
          </TouchableOpacity>
        </View>

        {/* Group Banner Widget */}
        <TouchableOpacity
          style={styles.groupBanner}
          onPress={() => navigation.navigate('Group')}
          activeOpacity={0.9}
        >
          <View style={styles.groupBannerHeader}>
            <View style={[styles.groupStatusPill, isSubmitted && { backgroundColor: COLORS.accentSoft }]}>
              <View style={[styles.groupDot, isSubmitted && { backgroundColor: COLORS.text }]} />
              <Text style={styles.groupStatusText}>
                {isSubmitted ? 'Заявка на рассмотрении' : 'Группа готова'}
              </Text>
            </View>
            <Text style={styles.groupMatchText}>{group.compatibilityScore}% совпадение</Text>
          </View>

          <Text style={styles.groupTitle}>{group.name}</Text>
          <Text style={styles.groupSub}>
            Целевой бюджет: {group.targetBudget.toLocaleString('ru-RU')} ₽ / мес
          </Text>

          <View style={styles.groupFooter}>
            <View style={styles.avatarsRow}>
              {group.members.map((m, i) => (
                <Image key={i} source={{ uri: m.avatar }} style={styles.groupAvatar} />
              ))}
              {group.members.length < 3 && (
                <View style={styles.addMemberBadge}>
                  <Text style={styles.addMemberText}>+{3 - group.members.length}</Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={COLORS.text} />
          </View>
        </TouchableOpacity>

        {/* AI Assistant Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Bot size={20} color={COLORS.text} />
            </View>
            <Text style={styles.aiTitle}>AI-Помощник «Соседи»</Text>
          </View>
          <Text style={styles.aiText}>
            Мы проанализировали ваш профиль! Подходящая евро-двушка на ул. Северной идеальна для вас и Марии: тихий двор, посудомойка, в рамках общего бюджета.
          </Text>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => navigation.navigate('HousingDetail', { id: 'center-loft' })}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color={COLORS.text} />
            <Text style={styles.aiBtnText}>Посмотреть объект (98%)</Text>
          </TouchableOpacity>
        </View>

        {/* Roommates Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Рекомендуемые соседи</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Roommates')}>
            <Text style={styles.seeAllText}>Все</Text>
          </TouchableOpacity>
        </View>

        {roommates.slice(0, 2).map((roommate) => (
          <RoommateCard
            key={roommate.id}
            roommate={roommate}
            onPress={() => navigation.navigate('RoommateDetail', { id: roommate.id })}
            onInvitePress={() => {
              navigation.navigate('RoommateDetail', { id: roommate.id });
            }}
          />
        ))}

        {/* Housing Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Популярное жильё</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Housing')}>
            <Text style={styles.seeAllText}>Все объекты</Text>
          </TouchableOpacity>
        </View>

        {properties.slice(0, 2).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => navigation.navigate('HousingDetail', { id: property.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '23%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  groupBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    ...SHADOWS.glow,
  },
  groupBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  groupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  groupStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  groupMatchText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
  },
  groupSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.surface,
    marginRight: -8,
  },
  addMemberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    marginLeft: 4,
  },
  addMemberText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  aiCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xl,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  aiText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 10,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    marginTop: 14,
  },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
