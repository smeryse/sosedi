import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

interface SafeImageProps {
  uri: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const SafeImage: React.FC<SafeImageProps> = ({ uri, label = 'С', style }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  return (
    <View style={[styles.frame, style]} accessibilityRole="image">
      {failed || !uri ? (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{label.trim().charAt(0).toUpperCase() || 'С'}</Text>
        </View>
      ) : (
        <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" onError={() => setFailed(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: COLORS.surfaceMuted },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  fallbackText: { fontSize: 18, fontWeight: '900', color: COLORS.text },
});
