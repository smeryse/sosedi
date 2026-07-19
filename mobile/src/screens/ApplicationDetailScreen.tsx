import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, CalendarDays, Check, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeImage } from '../components/SafeImage';
import { ScreenTransition } from '../components/ScreenTransition';
import { useGlobalState } from '../data/stateStore';
import { AppNavigation, IdRoute } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation; route: IdRoute }

export const ApplicationDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { applications, properties, group, chooseViewing } = useGlobalState();
  const application = applications.find((item) => item.id === route.params?.id) ?? applications[0];
  const property = properties.find((item) => item.id === application.propertyId) ?? properties[0];
  const [slot, setSlot] = useState(application.viewingSlot ?? 'Суббота, 17 мая · 11:00–12:00');

  const select = (value: string) => {
    setSlot(value);
    chooseViewing(application.id, value);
  };

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity accessibilityLabel="Назад" style={styles.back} onPress={navigation.goBack}><ArrowLeft size={21} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Заявка №{application.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}>
        <View style={styles.property}>
          <SafeImage uri={property.image} label={property.title} style={styles.propertyImage} />
          <View style={styles.propertyCopy}><Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text><View style={styles.address}><MapPin size={14} color={COLORS.textMuted} /><Text style={styles.addressText} numberOfLines={1}>{property.address}</Text></View><Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ <Text style={styles.priceUnit}>/ мес.</Text></Text></View>
        </View>

        <View style={styles.timeline}>
          <TimelineStep done title="Заявка отправлена" meta="20 мая 2026 в 16:30" />
          <TimelineStep done title="Собственник ответил" meta="20 мая 2026 в 17:10" note="Квартира свободна. Выберите удобное время для просмотра." />
          <TimelineStep active number="3" title="Выберите просмотр" meta="Выберите удобное время для просмотра" />
          <TimelineStep number="4" title="Решение по заявке" meta="Собственник примет решение после просмотра" last />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Доступные даты для просмотра</Text>
          {['Пятница, 16 мая · 18:00–19:00', 'Суббота, 17 мая · 11:00–12:00'].map((value, index) => {
            const selected = slot === value;
            const [day, time] = value.split(' · ');
            return <TouchableOpacity key={value} style={[styles.slot, index === 0 && styles.slotDivider]} onPress={() => select(value)}><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View><CalendarDays size={21} color={COLORS.textSecondary} /><View style={styles.slotCopy}><Text style={styles.slotDay}>{day}</Text><Text style={styles.slotTime}>{time}</Text></View><Text style={styles.duration}>1 час</Text></TouchableOpacity>;
          })}
        </View>

        <Text style={styles.externalTitle}>Участники</Text>
        <View style={styles.participants}>
          {group.members.slice(0, 2).map((member) => <View key={member.id} style={styles.participant}><View style={styles.avatarWrap}><SafeImage uri={member.avatar} label={member.name} style={styles.avatar} /><View style={styles.online} /></View><View><Text style={styles.participantName}>{member.name}</Text><Text style={styles.participantRole}>{member.role}</Text></View></View>)}
          <View style={styles.morePeople}><Text style={styles.morePeopleText}>+{Math.max(group.members.length - 2, 1)}</Text></View>
        </View>

        <Text style={styles.externalTitle}>Сообщение от собственника</Text>
        <TouchableOpacity style={styles.message} onPress={() => navigation.navigate('Messages')}><Text style={styles.messageText}>Квартира свободна и готова к показу. Парковка во дворе, рядом магазины и остановки. Если есть вопросы — пишите!</Text><Text style={styles.messageTime}>20 мая 2026 в 17:10</Text></TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}><TouchableOpacity style={styles.confirm} onPress={() => select(slot)}><Text style={styles.confirmText}>Подтвердить просмотр</Text></TouchableOpacity></View>
    </ScreenTransition>
  );
};

function TimelineStep({ title, meta, note, done, active, number, last }: { title: string; meta: string; note?: string; done?: boolean; active?: boolean; number?: string; last?: boolean }) {
  return <View style={styles.timelineStep}><View style={styles.markerColumn}><View style={[styles.marker, done && styles.markerDone, active && styles.markerActive]}>{done ? <Check size={14} color={COLORS.text} /> : <Text style={[styles.markerText, active && styles.markerTextActive]}>{number}</Text>}</View>{!last ? <View style={[styles.line, (done || active) && styles.lineActive]} /> : null}</View><View style={styles.timelineCopy}><Text style={styles.timelineTitle}>{title}</Text><Text style={styles.timelineMeta}>{meta}</Text>{note ? <Text style={styles.timelineNote}>{note}</Text> : null}</View></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { minHeight: 62, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  headerSpacer: { width: 42 },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.45, color: COLORS.text },
  property: { margin: 16, padding: 11, borderRadius: 17, flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  propertyImage: { width: 98, height: 82, borderRadius: 13 },
  propertyCopy: { flex: 1, minWidth: 0 },
  propertyTitle: { fontSize: 15, lineHeight: 19, fontWeight: '900', color: COLORS.text },
  address: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { flex: 1, fontSize: 11, color: COLORS.textMuted },
  price: { marginTop: 8, fontSize: 18, fontWeight: '900', color: COLORS.text },
  priceUnit: { fontSize: 12, fontWeight: '500' },
  timeline: { paddingHorizontal: 28, paddingTop: 8 },
  timelineStep: { minHeight: 94, flexDirection: 'row', gap: 15 },
  markerColumn: { width: 32, alignItems: 'center' },
  marker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  markerDone: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  markerActive: { borderColor: COLORS.accentBorder, backgroundColor: COLORS.accent },
  markerText: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted },
  markerTextActive: { color: COLORS.text },
  line: { width: 2, flex: 1, backgroundColor: COLORS.border },
  lineActive: { backgroundColor: COLORS.accentBorder },
  timelineCopy: { flex: 1, paddingTop: 3, paddingBottom: 16 },
  timelineTitle: { fontSize: 15.5, fontWeight: '900', color: COLORS.text },
  timelineMeta: { marginTop: 5, fontSize: 12, lineHeight: 17, color: COLORS.textMuted },
  timelineNote: { marginTop: 8, fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  block: { marginHorizontal: 16, marginTop: 4, padding: 14, borderRadius: 17, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  blockTitle: { fontSize: 16.5, fontWeight: '900', color: COLORS.text },
  slot: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 11 },
  slotDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderWidth: 3, borderColor: COLORS.accentBorder },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.text },
  slotCopy: { flex: 1 },
  slotDay: { fontSize: 13.5, fontWeight: '900', color: COLORS.text },
  slotTime: { marginTop: 3, fontSize: 11.5, color: COLORS.textMuted },
  duration: { fontSize: 11.5, color: COLORS.textMuted },
  externalTitle: { marginHorizontal: 20, marginTop: 23, marginBottom: 9, fontSize: 18, fontWeight: '900', color: COLORS.text },
  participants: { marginHorizontal: 16, minHeight: 82, padding: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  participant: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  online: { position: 'absolute', right: -1, bottom: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accentBorder, borderWidth: 2, borderColor: COLORS.surface },
  participantName: { maxWidth: 73, fontSize: 11.5, fontWeight: '800', color: COLORS.text },
  participantRole: { maxWidth: 73, marginTop: 2, fontSize: 9.5, color: COLORS.textMuted },
  morePeople: { marginLeft: 'auto', width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  morePeopleText: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  message: { marginHorizontal: 16, padding: 15, borderRadius: 17, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  messageText: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  messageTime: { marginTop: 11, fontSize: 10.5, color: COLORS.textMuted },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: COLORS.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  confirm: { minHeight: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  confirmText: { fontSize: 15.5, fontWeight: '900', color: COLORS.text },
});
