import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, ChevronRight, Clock3, FileCheck2, MessageCircle, Sparkles, SprayCan, WalletCards } from 'lucide-react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGlobalState } from '../data/stateStore';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { SafeImage } from '../components/SafeImage';

type Nav = { navigate: (screen: string, params?: object) => void; goBack: () => void };
type DealProps = { navigation: Nav; route: { params?: { id?: string } } };

const services = [
  { id: 'common', title: 'Уборка общих зон', subtitle: 'Кухня, гостиная и коридор', price: '590 ₽ / мес' },
  { id: 'room', title: 'Уборка комнаты', subtitle: 'Раз в две недели', price: '890 ₽ / мес' },
  { id: 'laundry', title: 'Прачечная', subtitle: 'До 8 кг в месяц', price: '390 ₽ / мес' },
];

export const DealDetailScreen: React.FC<DealProps> = ({ navigation, route }) => {
  const { properties, group } = useGlobalState();
  const property = properties.find((item) => item.id === route.params?.id) ?? properties[0];
  const submitted = group.status === 'under_review';
  const [expandedService, setExpandedService] = useState('common');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Детали аренды" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.propertySummary} onPress={() => navigation.navigate('HousingDetail', { id: property.id })} activeOpacity={0.85}>
          <SafeImage uri={property.image} label={property.title} style={styles.propertyImage} />
          <View style={styles.propertyText}><Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ / мес</Text><Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text><Text style={styles.propertyMeta}>{property.address}</Text></View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Совместная сделка</Text>
          {[
            ['Заявка отправлена', submitted, 'Сегодня'],
            ['Проверка собственником', false, 'До 24 часов'],
            ['Заявка одобрена', false, 'После проверки'],
            ['Первый платёж', false, 'После одобрения'],
            ['Ключи получены', false, 'В день заезда'],
          ].map(([label, done, meta], index) => (
            <View key={String(label)} style={styles.timelineRow}>
              <View style={styles.timelineRail}><View style={[styles.timelineDot, done && styles.timelineDotDone]}>{done ? <Check size={12} color={COLORS.text} /> : <Text style={styles.timelineNumber}>{index + 1}</Text>}</View>{index < 4 ? <View style={styles.timelineLine} /> : null}</View>
              <View style={styles.timelineText}><Text style={[styles.timelineLabel, !done && styles.timelineLabelMuted]}>{label}</Text><Text style={styles.timelineMeta}>{meta}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Доступные сервисы</Text>
          {services.map((service) => {
            const expanded = expandedService === service.id;
            return (
              <TouchableOpacity key={service.id} style={styles.serviceItem} onPress={() => setExpandedService(expanded ? '' : service.id)} activeOpacity={0.8}>
                <View style={styles.serviceIcon}><SprayCan size={18} color={COLORS.text} /></View>
                <View style={styles.serviceText}><Text style={styles.serviceTitle}>{service.title}</Text><Text style={styles.serviceSub}>{expanded ? `${service.subtitle} · экологичные средства` : service.subtitle}</Text>{expanded ? <Text style={styles.servicePrice}>{service.price}</Text> : null}</View>
                <ChevronDown size={18} color={COLORS.textMuted} style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Платежи по аренде</Text>
          {['Август 2026', 'Сентябрь 2026', 'Октябрь 2026'].map((month, index) => (
            <View key={month} style={styles.paymentRow}><View><Text style={styles.paymentMonth}>{month}</Text><Text style={styles.paymentStatus}>{index === 0 ? 'Доступен после одобрения' : 'Запланирован'}</Text></View><Text style={styles.paymentAmount}>{property.price.toLocaleString('ru-RU')} ₽</Text></View>
          ))}
        </View>

        <TouchableOpacity style={styles.assistantButton} onPress={() => navigation.navigate('Messages')}><MessageCircle size={18} color={COLORS.text} /><Text style={styles.assistantText}>Написать помощнику</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, submitted && styles.primaryButtonDark]} onPress={() => navigation.navigate(submitted ? 'Payment' : 'OnlineDeal', { id: property.id })}><Text style={[styles.primaryText, submitted && styles.primaryTextLight]}>{submitted ? 'Перейти к оплате' : 'Начать оформление'}</Text><ChevronRight size={18} color={submitted ? COLORS.textInverted : COLORS.text} /></TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export const OnlineDealScreen: React.FC<DealProps> = ({ navigation, route }) => {
  const { properties, submitGroupApplication } = useGlobalState();
  const property = properties.find((item) => item.id === route.params?.id) ?? properties[0];
  const [personalData, setPersonalData] = useState(true);
  const [contract, setContract] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const submit = () => {
    if (!personalData || !contract) {
      Alert.alert('Нужно согласие', 'Подтвердите передачу данных и условия договора.');
      return;
    }
    submitGroupApplication();
    navigation.navigate('ApplicationSuccess', { id: property.id });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Общая заявка" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.onlineScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}><Sparkles size={17} color={COLORS.text} /><Text style={styles.noticeText}>Перед отправкой проверьте состав группы и договорённости с собственником.</Text></View>
        <Text style={styles.sectionTitle}>Личная информация</Text>
        <Text style={styles.explainer}>Данные участников будут доступны только собственнику выбранной квартиры и только для этой заявки.</Text>
        <View style={styles.switchGroup}>
          <SwitchRow title="Передать данные группы" subtitle="Имена, телефоны и подтверждённые профили" value={personalData} onValueChange={setPersonalData} />
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Договор</Text>
        <Text style={styles.explainer}>Подтвердите, что группа согласна с правилами проживания и условиями обработки заявки.</Text>
        <View style={styles.switchGroup}>
          <SwitchRow title="Согласиться с условиями" subtitle="Черновик договора доступен в документах" value={contract} onValueChange={setContract} />
          <SwitchRow title="Уведомления о статусе" subtitle="Сообщим об ответе собственника" value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.summaryBox}><FileCheck2 size={20} color={COLORS.text} /><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>{property.title}</Text><Text style={styles.summarySub}>Заявка от 3 участников · бюджет подтверждён</Text></View></View>
      </ScrollView>
      <View style={styles.fixedBottom}><TouchableOpacity style={[styles.primaryButton, (!personalData || !contract) && styles.disabledButton]} onPress={submit} activeOpacity={0.85}><Text style={styles.primaryText}>Отправить заявку</Text><ChevronRight size={18} color={COLORS.text} /></TouchableOpacity></View>
    </View>
  );
};

function SwitchRow({ title, subtitle, value, onValueChange }: { title: string; subtitle: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.switchRow}><View style={{ flex: 1 }}><Text style={styles.switchTitle}>{title}</Text><Text style={styles.switchSub}>{subtitle}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: COLORS.border, true: COLORS.accent }} thumbColor={COLORS.surface} /></View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  propertySummary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  propertyImage: { width: 90, height: 78, borderRadius: RADIUS.md },
  propertyText: { flex: 1 },
  price: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  propertyTitle: { marginTop: 3, fontSize: 12, fontWeight: '800', color: COLORS.text, lineHeight: 16 },
  propertyMeta: { marginTop: 3, fontSize: 10, color: COLORS.textMuted },
  section: { marginTop: 16, padding: 18, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', minHeight: 58 },
  timelineRail: { width: 34, alignItems: 'center' },
  timelineDot: { width: 27, height: 27, borderRadius: 14, backgroundColor: COLORS.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: COLORS.accent },
  timelineNumber: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted },
  timelineLine: { width: 1, flex: 1, backgroundColor: COLORS.border },
  timelineText: { flex: 1, paddingLeft: 9, paddingTop: 2 },
  timelineLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  timelineLabelMuted: { color: COLORS.textMuted },
  timelineMeta: { marginTop: 3, fontSize: 11, color: COLORS.textMuted },
  serviceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  serviceIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  serviceText: { flex: 1 },
  serviceTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  serviceSub: { marginTop: 2, fontSize: 11, lineHeight: 15, color: COLORS.textMuted },
  servicePrice: { marginTop: 6, fontSize: 12, fontWeight: '900', color: COLORS.text },
  paymentRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  paymentMonth: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  paymentStatus: { marginTop: 2, fontSize: 10, color: COLORS.textMuted },
  paymentAmount: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  assistantButton: { minHeight: 48, marginTop: 16, borderRadius: RADIUS.full, backgroundColor: COLORS.accentSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  assistantText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  primaryButton: { minHeight: 52, marginTop: 12, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonDark: { backgroundColor: COLORS.text },
  primaryText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  primaryTextLight: { color: COLORS.textInverted },
  onlineScroll: { padding: 20, paddingBottom: 110 },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.accentSoft, marginBottom: 24 },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17, color: COLORS.text },
  explainer: { marginTop: -4, marginBottom: 12, fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  switchGroup: { overflow: 'hidden', borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  switchRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  switchTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  switchSub: { marginTop: 3, fontSize: 11, lineHeight: 15, color: COLORS.textMuted },
  summaryBox: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.surfaceMuted },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  summarySub: { marginTop: 3, fontSize: 11, color: COLORS.textMuted },
  fixedBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  disabledButton: { opacity: 0.5 },
});
