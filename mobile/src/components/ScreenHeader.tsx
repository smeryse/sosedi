import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, MoreHorizontal } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  onMore?: () => void;
  subtitle?: string;
};

export function ScreenHeader({ title, onBack, onMore, subtitle }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top, minHeight: 60 + insets.top }]}>
      {onBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.75} accessibilityLabel="Назад">
          <ArrowLeft size={19} color={COLORS.text} />
        </TouchableOpacity>
      ) : <View style={styles.placeholder} />}
      <View style={styles.titleBox}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {onMore ? (
        <TouchableOpacity style={styles.iconButton} onPress={onMore} activeOpacity={0.75} accessibilityLabel="Ещё">
          <MoreHorizontal size={19} color={COLORS.text} />
        </TouchableOpacity>
      ) : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholder: { width: 40 },
  titleBox: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  subtitle: { marginTop: 2, fontSize: 11, color: COLORS.textMuted },
});
