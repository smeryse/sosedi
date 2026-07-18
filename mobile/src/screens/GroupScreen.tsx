import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  CalendarCheck,
  MessageCircle,
  Home,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { CompatibilityBadge } from '../components/CompatibilityBadge';
import { mockProperties } from '../data/mockData';
import { useGlobalState } from '../data/stateStore';

interface GroupScreenProps {
  navigation: any;
}

export const GroupScreen: React.FC<GroupScreenProps> = ({ navigation }) => {
  const { group, submitGroupApplication } = useGlobalState();
  const targetProperty = mockProperties[0];

  const isSubmitted = group.status === 'under_review';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>Моя группа сожительства</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Group Header Card */}
        <View style={styles.groupCard}>
          <View style={styles.statusRow}>
            <View style={[styles.readyBadge, isSubmitted && { backgroundColor: COLORS.accentSoft }]}>
              <CheckCircle2 size={14} color={isSubmitted ? COLORS.text : COLORS.success} />
              <Text style={[styles.readyBadgeText, isSubmitted && { color: COLORS.text }]}>
                {isSubmitted ? 'Заявка отправлена' : 'Готова к совместной заявке'}
              </Text>
            </View>
            <CompatibilityBadge score={group.compatibilityScore} size="sm" />
          </View>

          <Text style={styles.groupName}>{group.name}</Text>

          {/* Budget Overview */}
          <View style={styles.budgetProgressBox}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Общий бюджет участников</Text>
              <Text style={styles.budgetVal}>
                {group.currentTotalBudget.toLocaleString('ru-RU')} ₽ / 50 000 ₽
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '100%' }]} />
            </View>
          </View>
        </View>

        {/* Co-living Tools Grid (sharely & chores) */}
        <Text style={styles.sectionTitle}>Быт и инструменты группы</Text>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Budget')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: COLORS.accentSoft }]}>
              <DollarSign size={20} color={COLORS.text} />
            </View>
            <Text style={styles.toolTitle}>Бюджет & Сплит</Text>
            <Text style={styles.toolSub}>Распределение счетов</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Chores')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#E0F2FE' }]}>
              <CalendarCheck size={20} color="#0284C7" />
            </View>
            <Text style={styles.toolTitle}>График уборки</Text>
            <Text style={styles.toolSub}>Ротация дежурств</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Messages')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#FEF3C7' }]}>
              <MessageCircle size={20} color="#D97706" />
            </View>
            <Text style={styles.toolTitle}>Общий чат</Text>
            <Text style={styles.toolSub}>Обсуждения группы</Text>
          </TouchableOpacity>
        </View>

        {/* Group Members List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Участники ({group.members.length} из 3)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Roommates')} activeOpacity={0.7}>
            <Text style={styles.addMemberBtnText}>+ Пригласить</Text>
          </TouchableOpacity>
        </View>

        {group.members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{member.role}</Text>
                </View>
              </View>
              <Text style={styles.memberJob}>{member.job}</Text>
            </View>
            <CompatibilityBadge score={member.compatibility} size="sm" />
          </View>
        ))}

        {/* Target Property */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Целевая квартира группы</Text>
        <TouchableOpacity
          style={styles.targetPropCard}
          onPress={() => navigation.navigate('HousingDetail', { id: targetProperty.id })}
          activeOpacity={0.9}
        >
          <Image source={{ uri: targetProperty.image }} style={styles.targetPropImg} />
          <View style={styles.targetPropContent}>
            <Text style={styles.targetPropTitle} numberOfLines={1}>
              {targetProperty.title}
            </Text>
            <Text style={styles.targetPropPrice}>
              {targetProperty.price.toLocaleString('ru-RU')} ₽ / мес
            </Text>
            <View style={styles.targetFitRow}>
              <Sparkles size={13} color={COLORS.text} />
              <Text style={styles.targetFitText}>Group Fit: {targetProperty.match}%</Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.text} />
        </TouchableOpacity>

        {/* Group Application Timeline (Reference 13.png & 14.png) */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Статус совместной заявки</Text>

          <View style={styles.timelineStep}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLineActive} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>1. Формирование группы</Text>
              <Text style={styles.stepSub}>Завершено 16 июля</Text>
            </View>
          </View>

          <View style={styles.timelineStep}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLineActive} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>2. Проверка анкет и совпадения</Text>
              <Text style={styles.stepSub}>95% совпадение подтверждено</Text>
            </View>
          </View>

          <View style={styles.timelineStep}>
            <View style={isSubmitted ? styles.timelineDotActive : styles.timelineDotCurrent} />
            <View style={styles.stepContent}>
              <Text style={isSubmitted ? styles.stepTitle : styles.stepTitleCurrent}>
                3. Подача заявки собственнику
              </Text>
              <Text style={styles.stepSub}>
                {isSubmitted ? 'Заявка отправлена (на рассмотрении)' : 'Готово к отправке'}
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Action Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitted && { backgroundColor: COLORS.surfaceMuted, opacity: 0.8 }]}
          onPress={() => {
            if (!isSubmitted) submitGroupApplication();
          }}
          disabled={isSubmitted}
          activeOpacity={0.85}
        >
          <Text style={[styles.submitBtnText, isSubmitted && { color: COLORS.textMuted }]}>
            {isSubmitted ? 'Заявка на рассмотрении' : 'Отправить заявку собственнику'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  topNavTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 20,
    ...SHADOWS.glow,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  readyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  budgetProgressBox: {
    marginTop: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  budgetVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toolCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  toolIconBg: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  toolSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMemberBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentBorder,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleBadge: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  memberJob: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  targetPropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  targetPropImg: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
  },
  targetPropContent: {
    flex: 1,
    marginLeft: 12,
  },
  targetPropTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  targetPropPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  targetFitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  targetFitText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 16,
  },
  timelineDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    marginTop: 3,
    marginRight: 12,
    zIndex: 2,
  },
  timelineLineActive: {
    position: 'absolute',
    left: 6,
    top: 16,
    bottom: -16,
    width: 2,
    backgroundColor: COLORS.success,
  },
  timelineDotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    marginTop: 3,
    marginRight: 12,
    zIndex: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepTitleCurrent: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  stepSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  submitBtn: {
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
