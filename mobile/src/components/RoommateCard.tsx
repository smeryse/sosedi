import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, UserPlus, ChevronRight, Heart } from 'lucide-react-native';
import { Roommate } from '../types';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { SafeImage } from './SafeImage';
import { CompatibilityBadge } from './CompatibilityBadge';

interface RoommateCardProps {
  roommate: Roommate;
  onPress: () => void;
  onInvitePress?: () => void;
  onFavoritePress?: () => void;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ roommate, onPress, onInvitePress, onFavoritePress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.headerRow}>
        <SafeImage uri={roommate.image} label={roommate.name} style={styles.image} />
        
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {roommate.name}, {roommate.age}
            </Text>
          </View>
          
          <Text style={styles.jobText}>{roommate.job}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={13} color={COLORS.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {roommate.district}
            </Text>
          </View>

          <Text style={styles.budgetText}>
            до {roommate.budget.toLocaleString('ru-RU')} ₽ / мес
          </Text>
        </View>

        <View style={styles.badgeWrapper}><CompatibilityBadge score={roommate.compatibility} size="sm" /></View>
      </View>

      {/* Traits Pills */}
      <View style={styles.traitsRow}>
        {roommate.traits.map((trait, index) => (
          <View key={index} style={styles.traitPill}>
            <Text style={styles.traitText}>{trait}</Text>
          </View>
        ))}
      </View>

      {/* Action footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={onInvitePress || onPress}
          activeOpacity={0.8}
        >
          <UserPlus size={15} color={COLORS.text} />
          <Text style={styles.inviteBtnText}>В группу</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.detailBtn} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.detailBtnText}>Анкета</Text>
          <ChevronRight size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
        {onFavoritePress ? <TouchableOpacity style={styles.favoriteBtn} onPress={onFavoritePress} accessibilityLabel={roommate.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}><Heart size={17} color={roommate.isFavorite ? COLORS.danger : COLORS.textMuted} fill={roommate.isFavorite ? COLORS.danger : 'transparent'} /></TouchableOpacity> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 14,
    position: 'relative',
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  jobText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  traitPill: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  traitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  inviteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  favoriteBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
});
