import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell, Search } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';

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
  return (
    <View style={styles.container}>
      {showLogo ? (
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>Соседи</Text>
          <View style={styles.logoDot} />
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

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' }}
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 3,
  },
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
