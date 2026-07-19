import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarDays, Check, ChevronDown, CreditCard, KeyRound, MapPin, PackageCheck, WalletCards } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGlobalState } from '../data/stateStore';
import { COLORS, RADIUS } from '../theme/colors';

type PaymentProps = { navigation: { goBack: () => void; navigate: (screen: string) => void } };

const serviceOptions = [
  { id: 'cleaning', label: 'Уборка общих зон', price: 590 },
  { id: 'room', label: 'Уборка комнаты', price: 890 },
  { id: 'laundry', label: 'Прачечная', price: 390 },
  { id: 'delivery', label: 'Доставка продуктов', price: 490 },
];

const deliveryDates = ['24 июля', '25 июля', '26 июля'];
const deliveryTimes = ['12:00–14:00', '14:00–16:00', '18:00–20:00'];

export const PaymentScreen: React.FC<PaymentProps> = ({ navigation }) => {
  const { properties } = useGlobalState();
  const property = properties[0];
  const [delivery, setDelivery] = useState(true);
  const [name, setName] = useState('Артём Смирнов');
  const [email, setEmail] = useState('artem@sosedi.app');
  const [phone, setPhone] = useState('+7 918 420-15-99');
  const [address, setAddress] = useState(property.address);
  const [selectedServices, setSelectedServices] = useState<string[]>(['cleaning']);
  const [method, setMethod] = useState<'card' | 'sbp'>('sbp');
  const [confirmed, setConfirmed] = useState(false);
  const [dateIndex, setDateIndex] = useState(0);
  const [timeIndex, setTimeIndex] = useState(0);

  const servicesTotal = serviceOptions.filter((item) => selectedServices.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  const total = property.price + servicesTotal;

  const toggleService = (id: string) => setSelectedServices((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const pay = () => {
    if (delivery && (!name.trim() || !email.trim() || !phone.trim() || !address.trim())) {
      Alert.alert('Заполните данные', 'Для доставки ключей нужны имя, контакты и адрес.');
      return;
    }
    if (!confirmed) {
      Alert.alert('Нужно подтверждение', 'Подтвердите сумму и способ оплаты.');
      return;
    }
    navigation.navigate('PaymentSuccess');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Оплата и ключи" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Получение ключей</Text>
        <View style={styles.choiceGroup}>
          <TouchableOpacity style={[styles.choice, !delivery && styles.choiceActive]} onPress={() => setDelivery(false)}><View style={styles.choiceIcon}><KeyRound size={19} color={COLORS.text} /></View><View style={{ flex: 1 }}><Text style={styles.choiceTitle}>Получить лично</Text><Text style={styles.choiceSub}>В офисе собственника</Text></View>{!delivery ? <View style={styles.radioActive}><Check size={12} color={COLORS.text} /></View> : <View style={styles.radio} />}</TouchableOpacity>
          <TouchableOpacity style={[styles.choice, delivery && styles.choiceActive]} onPress={() => setDelivery(true)}><View style={styles.choiceIcon}><PackageCheck size={19} color={COLORS.text} /></View><View style={{ flex: 1 }}><Text style={styles.choiceTitle}>Заказать доставку</Text><Text style={styles.choiceSub}>Бесплатно в пределах Краснодара</Text></View>{delivery ? <View style={styles.radioActive}><Check size={12} color={COLORS.text} /></View> : <View style={styles.radio} />}</TouchableOpacity>
        </View>

        {delivery ? <View style={styles.formSection}><Text style={styles.sectionTitle}>Данные для доставки</Text><Field label="Имя" value={name} onChangeText={setName} /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" /><Field label="Телефон" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Field label="Адрес" value={address} onChangeText={setAddress} /><View style={styles.dateRow}><TouchableOpacity style={styles.dateField} onPress={() => setDateIndex((value) => (value + 1) % deliveryDates.length)}><CalendarDays size={16} color={COLORS.textMuted} /><Text style={styles.dateText}>{deliveryDates[dateIndex]}</Text><ChevronDown size={15} color={COLORS.textMuted} /></TouchableOpacity><TouchableOpacity style={styles.dateField} onPress={() => setTimeIndex((value) => (value + 1) % deliveryTimes.length)}><Text style={styles.dateText}>{deliveryTimes[timeIndex]}</Text><ChevronDown size={15} color={COLORS.textMuted} /></TouchableOpacity></View></View> : null}

        <View style={styles.formSection}><Text style={styles.sectionTitle}>Дополнительные сервисы</Text>{serviceOptions.map((service) => { const enabled = selectedServices.includes(service.id); return <View key={service.id} style={styles.serviceRow}><View style={{ flex: 1 }}><Text style={styles.serviceTitle}>{service.label}</Text><Text style={styles.servicePrice}>+ {service.price} ₽</Text></View><Switch value={enabled} onValueChange={() => toggleService(service.id)} trackColor={{ false: COLORS.border, true: COLORS.accent }} thumbColor={COLORS.surface} /></View>; })}</View>

        <View style={styles.formSection}><Text style={styles.sectionTitle}>Способ оплаты</Text><TouchableOpacity style={[styles.method, method === 'sbp' && styles.methodActive]} onPress={() => setMethod('sbp')}><View style={styles.methodIcon}><WalletCards size={19} color={COLORS.text} /></View><Text style={styles.methodText}>СБП</Text>{method === 'sbp' ? <View style={styles.radioActive}><Check size={12} color={COLORS.text} /></View> : <View style={styles.radio} />}</TouchableOpacity><TouchableOpacity style={[styles.method, method === 'card' && styles.methodActive]} onPress={() => setMethod('card')}><View style={styles.methodIcon}><CreditCard size={19} color={COLORS.text} /></View><Text style={styles.methodText}>Карта •••• 3528</Text>{method === 'card' ? <View style={styles.radioActive}><Check size={12} color={COLORS.text} /></View> : <View style={styles.radio} />}</TouchableOpacity></View>

        <TouchableOpacity style={styles.confirmRow} onPress={() => setConfirmed((value) => !value)}><View style={[styles.checkbox, confirmed && styles.checkboxActive]}>{confirmed ? <Check size={13} color={COLORS.text} /> : null}</View><Text style={styles.confirmText}>Подтверждаю сумму платежа и согласен с условиями возврата.</Text></TouchableOpacity>

        <View style={styles.totalBox}><View><Text style={styles.totalLabel}>Итого к оплате</Text><Text style={styles.totalHint}>Аренда {property.price.toLocaleString('ru-RU')} ₽ + сервисы {servicesTotal.toLocaleString('ru-RU')} ₽</Text></View><Text style={styles.total}>{total.toLocaleString('ru-RU')} ₽</Text></View>
        <TouchableOpacity style={[styles.payButton, !confirmed && styles.payButtonDisabled]} onPress={pay} activeOpacity={0.85}><Text style={styles.payText}>Оплатить {total.toLocaleString('ru-RU')} ₽</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
};

function Field({ label, value, onChangeText, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'email-address' | 'phone-pad' }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} style={styles.input} keyboardType={keyboardType} placeholderTextColor={COLORS.textMuted} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  choiceGroup: { gap: 10 },
  choice: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  choiceActive: { borderColor: COLORS.accentBorder, backgroundColor: COLORS.accentSoft },
  choiceIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  choiceTitle: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  choiceSub: { marginTop: 2, fontSize: 11, color: COLORS.textMuted },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border },
  radioActive: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  formSection: { marginTop: 24, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  field: { marginBottom: 12 },
  fieldLabel: { marginBottom: 6, fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  input: { minHeight: 47, paddingHorizontal: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceMuted, fontSize: 14, color: COLORS.text },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, minHeight: 45, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceMuted },
  dateText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  serviceRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  serviceTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  servicePrice: { marginTop: 2, fontSize: 11, color: COLORS.textMuted },
  method: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  methodActive: { backgroundColor: COLORS.accentSoft, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: RADIUS.md },
  methodIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  methodText: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.text },
  confirmRow: { marginTop: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  confirmText: { flex: 1, fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  totalBox: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.surfaceMuted },
  totalLabel: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  totalHint: { marginTop: 3, maxWidth: 210, fontSize: 10, lineHeight: 14, color: COLORS.textMuted },
  total: { fontSize: 21, fontWeight: '900', color: COLORS.text },
  payButton: { minHeight: 54, marginTop: 14, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  payButtonDisabled: { opacity: 0.55 },
  payText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
});
