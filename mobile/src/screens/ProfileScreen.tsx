import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, Bot, CalendarCheck, ChevronRight, CircleDollarSign, ClipboardList, FileText, Gamepad2, GitCompareArrows, Heart, LogOut, Settings, Share2, ShieldCheck, Sparkles, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { AppNavigation } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation }

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const rows = [
    { label: 'AI-помощник', sub: 'Ответы по договору и быту', icon: <Bot size={19} color={COLORS.text} />, screen: 'Assistant' },
    { label: 'Сравнение соседей', sub: 'Сопоставить до трёх анкет', icon: <GitCompareArrows size={19} color={COLORS.text} />, screen: 'RoommateCompare' },
    { label: 'Бюджет и расходы', sub: 'Общие платежи группы', icon: <CircleDollarSign size={19} color={COLORS.text} />, screen: 'Budget' },
    { label: 'Дела и дежурства', sub: 'График совместного быта', icon: <CalendarCheck size={19} color={COLORS.text} />, screen: 'Chores' },
    { label: 'Документы', sub: 'Договор, чеки и файлы', icon: <FileText size={19} color={COLORS.text} />, screen: 'Documents' },
    { label: 'Симулятор ситуаций', sub: 'Проверить бытовую совместимость', icon: <Gamepad2 size={19} color={COLORS.text} />, screen: 'Simulator' },
  ];

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}><View><Text style={styles.eyebrow}>ЛИЧНЫЙ КАБИНЕТ</Text><Text style={styles.title}>Мой профиль.</Text></View><TouchableOpacity accessibilityLabel="Настройки" style={styles.settings} onPress={() => navigation.navigate('Settings')}><Settings size={21} color={COLORS.text} /></TouchableOpacity></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.identity}><SafeImage uri="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400" label="Артём" style={styles.avatar} /><View style={styles.identityCopy}><View style={styles.nameRow}><Text style={styles.name}>Артём Смирнов</Text><ShieldCheck size={17} color={COLORS.text} fill={COLORS.surface} /></View><Text style={styles.meta}>27 лет · Senior Frontend Dev</Text><View style={styles.verified}><Text style={styles.verifiedText}>ПРОФИЛЬ ПОДТВЕРЖДЁН</Text></View></View></View>
          <View style={styles.heroBottom}><View><Text style={styles.heroLabel}>Совместимость заполнена</Text><Text style={styles.heroHint}>20 из 20 ответов</Text></View><View style={styles.heroScore}><Text style={styles.heroScoreValue}>100%</Text></View></View>
        </View>

        <TouchableOpacity style={styles.verification} onPress={() => navigation.navigate('Verification')} activeOpacity={0.85}><View style={styles.verificationIcon}><ShieldCheck size={21} color={COLORS.text} /></View><View style={styles.verificationCopy}><Text style={styles.verificationTitle}>Проверка личности</Text><Text style={styles.verificationSub}>Паспорт, селфи и контакты</Text></View><Text style={styles.verificationStatus}>пройти</Text><ChevronRight size={17} color={COLORS.text} /></TouchableOpacity>

        <Text style={styles.sectionTitle}>Главное</Text>
        <View style={styles.tiles}>
          <Tile title="Заявки" sub="Просмотры и статусы" icon={<ClipboardList size={22} color={COLORS.text} />} accent onPress={() => navigation.navigate('Applications')} />
          <Tile title="Моя группа" sub="3 участника · 89%" icon={<Users size={22} color={COLORS.text} />} onPress={() => navigation.navigate('Group')} />
          <Tile title="Анкета" sub="Совместимость 100%" icon={<Sparkles size={22} color={COLORS.text} />} onPress={() => navigation.navigate('Compatibility')} />
          <Tile title="Избранное" sub="Жильё и соседи" icon={<Heart size={22} color={COLORS.text} />} onPress={() => navigation.navigate('Favorites')} />
        </View>

        <Text style={styles.sectionTitle}>Сервисы</Text>
        <View style={styles.rows}>{rows.map((row, index) => <AnimatedListItem key={row.screen} index={index}><MenuRow {...row} onPress={() => navigation.navigate(row.screen as never)} /></AnimatedListItem>)}</View>

        <Text style={styles.sectionTitle}>Аккаунт</Text>
        <View style={styles.rows}>
          <MenuRow label="Уведомления" sub="Новые заявки и сообщения" icon={<Bell size={19} color={COLORS.text} />} onPress={() => navigation.navigate('Notifications')} />
          <MenuRow label="Пригласить друга" sub="Добавить человека в группу" icon={<Share2 size={19} color={COLORS.text} />} onPress={() => navigation.navigate('Invite')} />
          <MenuRow label="Настройки" sub="Безопасность и приватность" icon={<Settings size={19} color={COLORS.text} />} onPress={() => navigation.navigate('Settings')} />
        </View>

        <TouchableOpacity style={styles.logout} onPress={() => navigation.navigate('Auth')}><LogOut size={18} color={COLORS.danger} /><Text style={styles.logoutText}>Выйти из аккаунта</Text></TouchableOpacity>
      </ScrollView>
    </ScreenTransition>
  );
};

function Tile({ title, sub, icon, accent, onPress }: { title: string; sub: string; icon: React.ReactNode; accent?: boolean; onPress: () => void }) {
  return <TouchableOpacity style={[styles.tile, accent && styles.tileAccent]} onPress={onPress} activeOpacity={0.85}><View style={[styles.tileIcon, accent && styles.tileIconAccent]}>{icon}</View><ChevronRight size={16} color={COLORS.textMuted} style={styles.tileArrow} /><Text style={styles.tileTitle}>{title}</Text><Text style={styles.tileSub}>{sub}</Text></TouchableOpacity>;
}

function MenuRow({ label, sub, icon, onPress }: { label: string; sub: string; icon: React.ReactNode; onPress: () => void; screen?: string }) {
  return <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}><View style={styles.rowIcon}>{icon}</View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowSub}>{sub}</Text></View><ChevronRight size={18} color={COLORS.textMuted} /></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { minHeight: 91, paddingHorizontal: 18, paddingBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  eyebrow: { marginBottom: 3, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: COLORS.textMuted },
  title: { fontSize: 29, lineHeight: 32, fontWeight: '900', letterSpacing: -1.1, color: COLORS.text },
  settings: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  content: { padding: 16, paddingBottom: 38 },
  hero: { padding: 17, borderRadius: 22, backgroundColor: COLORS.accent },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: COLORS.surface },
  identityCopy: { flex: 1, marginLeft: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 19, fontWeight: '900', letterSpacing: -0.4, color: COLORS.text },
  meta: { marginTop: 4, fontSize: 11.5, color: COLORS.textSecondary },
  verified: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.surface },
  verifiedText: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.6, color: COLORS.text },
  heroBottom: { marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(13,13,12,0.14)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: 12.5, fontWeight: '900', color: COLORS.text },
  heroHint: { marginTop: 3, fontSize: 10.5, color: COLORS.textSecondary },
  heroScore: { minWidth: 59, height: 34, paddingHorizontal: 10, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  heroScoreValue: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  verification: { minHeight: 69, marginTop: 11, padding: 11, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  verificationIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  verificationCopy: { flex: 1, marginLeft: 10 },
  verificationTitle: { fontSize: 13.5, fontWeight: '900', color: COLORS.text },
  verificationSub: { marginTop: 3, fontSize: 10.5, color: COLORS.textMuted },
  verificationStatus: { marginRight: 4, fontSize: 10, fontWeight: '900', color: COLORS.accentBorder },
  sectionTitle: { marginTop: 25, marginBottom: 10, fontSize: 17, fontWeight: '900', letterSpacing: -0.3, color: COLORS.text },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48.4%', minHeight: 128, padding: 14, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tileAccent: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accentBorder },
  tileIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  tileIconAccent: { backgroundColor: COLORS.accent },
  tileArrow: { position: 'absolute', right: 13, top: 24 },
  tileTitle: { marginTop: 15, fontSize: 14, fontWeight: '900', color: COLORS.text },
  tileSub: { marginTop: 4, fontSize: 10.5, lineHeight: 14, color: COLORS.textMuted },
  rows: { overflow: 'hidden', borderRadius: 19, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  row: { minHeight: 70, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  rowIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  rowCopy: { flex: 1, marginLeft: 11 },
  rowLabel: { fontSize: 13.5, fontWeight: '900', color: COLORS.text },
  rowSub: { marginTop: 3, fontSize: 10.5, color: COLORS.textMuted },
  logout: { minHeight: 53, marginTop: 18, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.dangerSoft },
  logoutText: { fontSize: 13, fontWeight: '900', color: COLORS.danger },
});
