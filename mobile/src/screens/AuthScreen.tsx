import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowRight, Phone, Lock, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

import { AppNavigation } from '../types/navigation';

interface AuthScreenProps { navigation: AppNavigation; }

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');

  const handleSendPhone = () => {
    if (phone.replace(/\D/g, '').length < 11) {
      setError('Введите номер в формате +7 900 000-00-00.');
      return;
    }
    setError('');
    setStep('code');
  };

  const handleLogin = () => {
    if (!/^\d{4}$/.test(code)) {
      setError('Введите любые четыре цифры для входа в демо.');
      return;
    }
    navigation.replace('Main');
  };

  const handleDemoEntrance = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Brand Logo Header */}
          <View style={styles.brandBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>С</Text>
            </View>
            <Text style={styles.brandTitle}>Соседи</Text>
            <Text style={styles.brandSub}>Платформа совместной аренды и подбора сожителей в Краснодаре</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {step === 'phone' ? (
              <>
                <Text style={styles.formTitle}>Вход в демо</Text>
                <Text style={styles.formSub}>SMS в демо не отправляем. Номер нужен только для прохождения сценария.</Text>

                <View style={styles.inputBox}>
                  <Phone size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+7 (900) 000-00-00"
                    placeholderTextColor={COLORS.textMuted}
                    accessibilityLabel="Номер телефона"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendPhone} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Продолжить</Text>
                  <ArrowRight size={18} color={COLORS.text} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.codeHeaderRow}>
                  <Text style={styles.formTitle}>Введите код из SMS</Text>
                  <TouchableOpacity onPress={() => setStep('phone')}>
                    <Text style={styles.changePhoneText}>Изменить номер</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.formSub}>Введите любые четыре цифры — в демо код не проверяется.</Text>

                <View style={styles.inputBox}>
                  <Lock size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    placeholder="4-значный код"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={4}
                    accessibilityLabel="Четырёхзначный код для демо"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
                  <CheckCircle2 size={18} color={COLORS.text} />
                  <Text style={styles.primaryBtnText}>Открыть демо</Text>
                </TouchableOpacity>
              </>
            )}

            {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ИЛИ</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Instant Demo Entrance */}
            <TouchableOpacity style={styles.demoBtn} onPress={handleDemoEntrance} activeOpacity={0.85}>
              <Sparkles size={18} color={COLORS.text} />
              <Text style={styles.demoBtnText}>Открыть демо без номера</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.legalNotice}>
          В демо персональные данные не проверяются и действия не создают настоящих заявок или платежей.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.glow,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  brandSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  formSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 18,
  },
  codeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changePhoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentBorder,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: '#B42318',
  },
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.glow,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  demoBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  legalNotice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
