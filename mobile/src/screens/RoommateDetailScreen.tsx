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
  ArrowLeft,
  MapPin,
  Sparkles,
  MessageSquare,
  UserPlus,
  Moon,
  Briefcase,
  Cat,
  CigaretteOff,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { CompatibilityBadge } from '../components/CompatibilityBadge';
import { useGlobalState } from '../data/stateStore';

interface RoommateDetailScreenProps {
  route: any;
  navigation: any;
}

export const RoommateDetailScreen: React.FC<RoommateDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { roommates, group, inviteRoommate } = useGlobalState();
  const roommateId = route.params?.id || 'maria';
  const roommate = roommates.find((r) => r.id === roommateId) || roommates[0];
  const isAlreadyMember = group.members.some((m) => m.id === roommate.id);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Профиль соседа</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <Image source={{ uri: roommate.image }} style={styles.avatar} />
          
          <View style={styles.badgePos}>
            <CompatibilityBadge score={roommate.compatibility} size="lg" />
          </View>

          <Text style={styles.nameText}>{roommate.name}, {roommate.age}</Text>
          <Text style={styles.jobText}>{roommate.job}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color={COLORS.textMuted} />
            <Text style={styles.locationText}>{roommate.district}</Text>
          </View>

          <View style={styles.budgetPill}>
            <Text style={styles.budgetText}>
              Бюджет до {roommate.budget.toLocaleString('ru-RU')} ₽ / мес
            </Text>
          </View>
        </View>

        {/* Compatibility Breakdown (Reference 11.png) */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Sparkles size={20} color={COLORS.text} />
            <Text style={styles.breakdownTitle}>Причины высокого совпадения ({roommate.compatibility}%)</Text>
          </View>

          <View style={styles.matchBarRow}>
            <Text style={styles.matchLabel}>Режим сна и тишина</Text>
            <Text style={styles.matchPercent}>100%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: '100%' }]} />
          </View>

          <View style={styles.matchBarRow}>
            <Text style={styles.matchLabel}>Совпадение по бюджету</Text>
            <Text style={styles.matchPercent}>98%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: '98%' }]} />
          </View>

          <View style={styles.matchBarRow}>
            <Text style={styles.matchLabel}>Отношение к чистоте</Text>
            <Text style={styles.matchPercent}>95%</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: '95%' }]} />
          </View>
        </View>

        {/* Lifestyle Habits (habi style) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Образ жизни и привычки</Text>

          <View style={styles.habitsGrid}>
            <View style={styles.habitBox}>
              <Moon size={18} color={COLORS.text} />
              <View>
                <Text style={styles.habitTitle}>График сна</Text>
                <Text style={styles.habitVal}>{roommate.sleepHabit}</Text>
              </View>
            </View>

            <View style={styles.habitBox}>
              <Briefcase size={18} color={COLORS.text} />
              <View>
                <Text style={styles.habitTitle}>Работа</Text>
                <Text style={styles.habitVal}>{roommate.workStyle}</Text>
              </View>
            </View>

            <View style={styles.habitBox}>
              <CigaretteOff size={18} color={COLORS.text} />
              <View>
                <Text style={styles.habitTitle}>Курение</Text>
                <Text style={styles.habitVal}>{roommate.smokingHabit}</Text>
              </View>
            </View>

            <View style={styles.habitBox}>
              <Cat size={18} color={COLORS.text} />
              <View>
                <Text style={styles.habitTitle}>Животные</Text>
                <Text style={styles.habitVal}>{roommate.petsHabit}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О себе</Text>
          <Text style={styles.bioText}>{roommate.bio}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.8}
        >
          <MessageSquare size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.inviteBtn, isAlreadyMember && { backgroundColor: COLORS.surfaceMuted, borderWidth: 1, borderColor: COLORS.border }]}
          onPress={() => {
            if (!isAlreadyMember) {
              inviteRoommate(roommate.id);
            }
            navigation.navigate('Group');
          }}
          activeOpacity={0.85}
        >
          {isAlreadyMember ? (
            <CheckCircle2 size={18} color={COLORS.success} />
          ) : (
            <UserPlus size={18} color={COLORS.text} />
          )}
          <Text style={[styles.inviteBtnText, isAlreadyMember && { color: COLORS.textSecondary }]}>
            {isAlreadyMember ? 'Уже в группе' : 'Пригласить в группу'}
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  badgePos: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  jobText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  budgetPill: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: 12,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  breakdownCard: {
    backgroundColor: COLORS.surfaceCard,
    margin: 20,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  matchBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  matchPercent: {
    fontSize: 12,
    fontWeight: '800',
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  habitsGrid: {
    gap: 10,
  },
  habitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  habitTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  habitVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    ...SHADOWS.card,
  },
  chatBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inviteBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  inviteBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
});
