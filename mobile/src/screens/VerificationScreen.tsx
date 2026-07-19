import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, Check, ChevronRight, Contact, FileBadge2, ShieldCheck, Upload } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADIUS } from '../theme/colors';

type VerificationProps = { navigation: { goBack: () => void } };

export const VerificationScreen: React.FC<VerificationProps> = ({ navigation }) => {
  const [passportUploaded, setPassportUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [email, setEmail] = useState('artem@sosedi.app');
  const [phone, setPhone] = useState('+7 918 420-15-99');
  const [consent, setConsent] = useState(false);

  const submit = () => {
    if (!passportUploaded || !selfieUploaded || !email.trim() || !phone.trim() || !consent) {
      Alert.alert('Не всё заполнено', 'Добавьте документы, контакты и подтвердите согласие.');
      return;
    }
    Alert.alert('Профиль отправлен', 'Проверка обычно занимает до 24 часов.', [{ text: 'Готово', onPress: navigation.goBack }]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Верификация" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}><ShieldCheck size={24} color={COLORS.text} /><View style={{ flex: 1 }}><Text style={styles.introTitle}>Подтвердите профиль</Text><Text style={styles.introText}>Документы видит только команда проверки. Мы не показываем их другим пользователям.</Text></View></View>

        <Text style={styles.sectionTitle}>Паспорт</Text>
        <Text style={styles.sectionText}>Фото разворота с данными и страницы регистрации.</Text>
        <UploadCard icon={FileBadge2} title="Основная страница" subtitle={passportUploaded ? 'Файл добавлен' : 'JPG, PNG или PDF до 10 МБ'} completed={passportUploaded} action="Загрузить" onPress={() => setPassportUploaded(true)} />
        <UploadCard icon={Camera} title="Селфи с документом" subtitle={selfieUploaded ? 'Фото добавлено' : 'Сделайте фото при хорошем освещении'} completed={selfieUploaded} action="Открыть камеру" onPress={() => setSelfieUploaded(true)} />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Контакты</Text>
        <Text style={styles.sectionText}>Нужны для важных уведомлений о заявке и документах.</Text>
        <View style={styles.field}><Text style={styles.fieldLabel}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Телефон</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>

        <TouchableOpacity style={styles.consentRow} onPress={() => setConsent((value) => !value)}><View style={[styles.checkbox, consent && styles.checkboxActive]}>{consent ? <Check size={13} color={COLORS.text} /> : null}</View><Text style={styles.consentText}>Согласен на проверку документов и получение уведомлений о статусе.</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.primary, (!passportUploaded || !selfieUploaded || !consent) && styles.primaryDisabled]} onPress={submit}><Text style={styles.primaryText}>Отправить на проверку</Text><ChevronRight size={18} color={COLORS.text} /></TouchableOpacity>
      </ScrollView>
    </View>
  );
};

function UploadCard({ icon: Icon, title, subtitle, completed, action, onPress }: { icon: typeof FileBadge2; title: string; subtitle: string; completed: boolean; action: string; onPress: () => void }) {
  return <View style={[styles.uploadCard, completed && styles.uploadCardDone]}><View style={styles.uploadIcon}>{completed ? <Check size={22} color={COLORS.text} /> : <Icon size={23} color={COLORS.text} />}</View><View style={{ flex: 1 }}><Text style={styles.uploadTitle}>{title}</Text><Text style={styles.uploadSub}>{subtitle}</Text></View><TouchableOpacity style={styles.uploadButton} onPress={onPress}><Text style={styles.uploadButtonText}>{completed ? 'Заменить' : action}</Text></TouchableOpacity></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  intro: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.accentSoft, marginBottom: 24 },
  introTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  introText: { marginTop: 4, fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  sectionText: { marginTop: 4, marginBottom: 12, fontSize: 12, lineHeight: 18, color: COLORS.textMuted },
  uploadCard: { minHeight: 88, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  uploadCardDone: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accentBorder },
  uploadIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  uploadTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  uploadSub: { marginTop: 3, fontSize: 10, lineHeight: 14, color: COLORS.textMuted },
  uploadButton: { minHeight: 35, paddingHorizontal: 11, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  uploadButtonText: { fontSize: 10, fontWeight: '900', color: COLORS.text },
  field: { marginBottom: 12 },
  fieldLabel: { marginBottom: 6, fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  input: { minHeight: 48, paddingHorizontal: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, fontSize: 14, color: COLORS.text },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 7, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  consentText: { flex: 1, fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  primary: { minHeight: 52, marginTop: 20, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryDisabled: { opacity: 0.55 },
  primaryText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
});
