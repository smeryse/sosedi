import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../theme/colors';
import { SafeImage } from './SafeImage';
import { PEOPLE_IMAGES } from '../data/peopleAssets';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = true,
  onNotificationPress,
  onSearchPress,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, height: 62 + insets.top }]}>
      {showLogo ? (
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>соседи<Text style={styles.logoAccent}>.</Text></Text>
        </View>
      ) : (
        <Text style={styles.titleText}>{title}</Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onSearchPress} activeOpacity={0.7}>
          <Search size={20} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress} activeOpacity={0.7}>
          <Bell size={20} color={COLORS.text} />
          <View style={styles.unreadBadge} />
        </TouchableOpacity>

        <SafeImage
          uri={PEOPLE_IMAGES.artem}
          label="Артём"
          style={styles.avatar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoAccent: { color: COLORS.accentHover },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
});
