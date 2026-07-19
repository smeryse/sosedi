import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, Check, ChevronRight, Clock3, Home, MessageCircle, Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';
import { SafeImage } from '../components/SafeImage';
import { ScreenTransition } from '../components/ScreenTransition';

interface RentScreenProps { navigation: { navigate: (screen: string, params?: object) => void } }

export const RentScreen: React.FC<RentScreenProps> = ({ navigation }) => {
  const { properties, group } = useGlobalState();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const property = properties[0];
  const applicationStarted = group.status === 'under_review';

  return (
    <ScreenTransition style={styles.container}>
      <View style={styles.top}><Text style={styles.pageTitle}>Аренда</Text><Text style={styles.pageSub}>Заявки, платежи и ключи в одном месте</Text></View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'current' && styles.tabActive]} onPress={() => setActiveTab('current')}><Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>Текущие</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => setActiveTab('history')}><Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>История</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'current' ? (
          <>
            <TouchableOpacity style={styles.dealCard} onPress={() => navigation.navigate('DealDetail', { id: property.id })} activeOpacity={0.9}>
              <SafeImage uri={property.image} label={property.title} style={styles.propertyImage} />
              <View style={styles.dealInfo}>
                <View style={styles.statusRow}><View style={styles.statusDot} /><Text style={styles.statusText}>{applicationStarted ? 'Заявка рассматривается' : 'Можно подать заявку'}</Text></View>
                <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
                <Text style={styles.propertyMeta}>{property.address}</Text>
                <Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ / мес</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.progressCard}>
              <Text style={styles.sectionTitle}>Статус сделки</Text>
              {[
                ['Заявка группы', applicationStarted ? 'Отправлена' : 'Не отправлена', applicationStarted],
                ['Решение собственника', 'Ожидается', false],
                ['Первый платёж', 'После одобрения', false],
                ['Получение ключей', 'После оплаты', false],
              ].map(([label, value, done], index) => (
                <View key={String(label)} style={styles.progressRow}>
                  <View style={[styles.progressIcon, done && styles.progressIconDone]}>{done ? <Check size={14} color={COLORS.text} /> : index === 0 ? <Sparkles size={14} color={COLORS.textMuted} /> : <Clock3 size={14} color={COLORS.textMuted} />}</View>
                  <View style={styles.progressText}><Text style={styles.progressLabel}>{label}</Text><Text style={styles.progressValue}>{value}</Text></View>
                </View>
              ))}
            </View>

            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('Documents')}><CalendarDays size={20} color={COLORS.text} /><Text style={styles.quickTitle}>Документы</Text><Text style={styles.quickSub}>Договор и чеки</Text></TouchableOpacity>
              <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('Messages')}><MessageCircle size={20} color={COLORS.text} /><Text style={styles.quickTitle}>Чат</Text><Text style={styles.quickSub}>С группой и владельцем</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate(applicationStarted ? 'DealDetail' : 'OnlineDeal', { id: property.id })} activeOpacity={0.85}><Text style={styles.primaryText}>{applicationStarted ? 'Открыть сделку' : 'Подать общую заявку'}</Text><ChevronRight size={18} color={COLORS.text} /></TouchableOpacity>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Home size={28} color={COLORS.text} /></View>
            <Text style={styles.emptyTitle}>История пока пуста</Text>
            <Text style={styles.emptyText}>Завершённые заявки и платежи появятся здесь.</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Housing')}><Text style={styles.secondaryText}>Найти жильё</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  top: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.8 },
  pageSub: { marginTop: 3, fontSize: 13, color: COLORS.textMuted },
  tabs: { flexDirection: 'row', marginHorizontal: 20, padding: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceMuted },
  tab: { flex: 1, minHeight: 38, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: COLORS.surface, ...SHADOWS.card },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.text, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 40 },
  dealCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  propertyImage: { width: 92, height: 104, borderRadius: RADIUS.md },
  dealInfo: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  statusText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase' },
  propertyTitle: { marginTop: 7, fontSize: 15, fontWeight: '800', color: COLORS.text, lineHeight: 19 },
  propertyMeta: { marginTop: 4, fontSize: 11, color: COLORS.textMuted },
  price: { marginTop: 7, fontSize: 15, fontWeight: '900', color: COLORS.text },
  progressCard: { marginTop: 16, padding: 18, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 14 },
  progressRow: { flexDirection: 'row', gap: 12, minHeight: 54 },
  progressIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  progressIconDone: { backgroundColor: COLORS.accent },
  progressText: { flex: 1, paddingTop: 2, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  progressLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  progressValue: { marginTop: 2, fontSize: 11, color: COLORS.textMuted },
  quickGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  quickItem: { flex: 1, minHeight: 118, padding: 15, borderRadius: RADIUS.lg, backgroundColor: COLORS.accentSoft },
  quickTitle: { marginTop: 18, fontSize: 14, fontWeight: '900', color: COLORS.text },
  quickSub: { marginTop: 3, fontSize: 11, color: COLORS.textSecondary, lineHeight: 15 },
  primaryButton: { marginTop: 18, minHeight: 52, paddingHorizontal: 20, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  empty: { alignItems: 'center', paddingTop: 70 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 20, fontSize: 20, fontWeight: '900', color: COLORS.text },
  emptyText: { marginTop: 7, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  secondaryButton: { marginTop: 20, minHeight: 46, paddingHorizontal: 24, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
});
