import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({ score, size = 'md' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        isSm && styles.badgeSm,
        isLg && styles.badgeLg,
      ]}
    >
      <Sparkles size={isSm ? 12 : isLg ? 18 : 14} color={COLORS.text} />
      <Text
        style={[
          styles.text,
          isSm && styles.textSm,
          isLg && styles.textLg,
        ]}
      >
        {score}% {isSm ? '' : 'совпадение'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLg: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  textSm: {
    fontSize: 11,
  },
  textLg: {
    fontSize: 16,
    fontWeight: '800',
  },
});
