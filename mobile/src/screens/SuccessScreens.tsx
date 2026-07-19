import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, FileCheck2, KeyRound, Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';

type SuccessProps = { navigation: { replace: (screen: string) => void; navigate: (screen: string) => void } };

function SuccessLayout({ icon, title, text, action, onPress, secondary, onSecondary }: { icon: 'application' | 'payment'; title: string; text: string; action: string; onPress: () => void; secondary?: string; onSecondary?: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.topLine}><View style={styles.topLineActive} /></View>
      <View style={styles.center}>
        <View style={styles.illustration}>
          <View style={styles.iconCircle}>{icon === 'application' ? <FileCheck2 size={48} color={COLORS.text} /> : <KeyRound size={48} color={COLORS.text} />}</View>
          <View style={styles.checkBadge}><Check size={17} color={COLORS.text} /></View>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} onPress={onPress} activeOpacity={0.85}><Text style={styles.primaryText}>{action}</Text></TouchableOpacity>
        {secondary && onSecondary ? <TouchableOpacity style={styles.secondary} onPress={onSecondary}><Text style={styles.secondaryText}>{secondary}</Text></TouchableOpacity> : null}
      </View>
    </View>
  );
}

export const ApplicationSuccessScreen: React.FC<SuccessProps> = ({ navigation }) => (
  <SuccessLayout
    icon="application"
    title="Заявка успешно отправлена"
    text="Собственник получил анкету группы. Статус сделки и ответ появятся в разделе «Аренда»."
    action="Перейти к аренде"
    onPress={() => navigation.replace('Main')}
    secondary="Открыть чат"
    onSecondary={() => navigation.navigate('Messages')}
  />
);

export const PaymentSuccessScreen: React.FC<SuccessProps> = ({ navigation }) => (
  <SuccessLayout
    icon="payment"
    title="Демо-оплата подтверждена"
    text="Деньги не списывались, чек и доставка ключей не оформлялись."
    action="Вернуться к аренде"
    onPress={() => navigation.replace('Main')}
    secondary="Открыть документы"
    onSecondary={() => navigation.navigate('Documents')}
  />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20, justifyContent: 'space-between' },
  topLine: { height: 4, marginTop: 8, borderRadius: 2, backgroundColor: COLORS.border },
  topLineActive: { width: '100%', height: 4, borderRadius: 2, backgroundColor: COLORS.accent },
  center: { alignItems: 'center', paddingHorizontal: 20 },
  illustration: { width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconCircle: { width: 98, height: 98, borderRadius: 49, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  checkBadge: { position: 'absolute', right: 16, bottom: 17, width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: COLORS.background },
  title: { marginTop: 28, fontSize: 27, fontWeight: '900', lineHeight: 32, letterSpacing: -0.8, color: COLORS.text, textAlign: 'center' },
  text: { marginTop: 12, fontSize: 14, lineHeight: 21, color: COLORS.textMuted, textAlign: 'center' },
  actions: { gap: 10, paddingBottom: 8 },
  primary: { minHeight: 52, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  secondary: { minHeight: 48, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
});
