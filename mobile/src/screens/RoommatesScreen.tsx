import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, Heart, MapPin, Search, SlidersHorizontal, WalletCards } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { useGlobalState } from '../data/stateStore';
import { Roommate } from '../types';
import { AppNavigation } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation }

const FILTERS = [
  { id: 'all', label: 'Лучшие совпадения' },
  { id: 'non_smoker', label: 'Не курят' },
  { id: 'remote', label: 'Удалёнка' },
  { id: 'early', label: 'Жаворонки' },
  { id: 'budget', label: 'До 30 000 ₽' },
];

export const RoommatesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { roommates, toggleFavoriteRoommate } = useGlobalState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => roommates.filter((roommate) => {
    const q = query.trim().toLowerCase();
    if (q && !`${roommate.name} ${roommate.job} ${roommate.district} ${roommate.traits.join(' ')}`.toLowerCase().includes(q)) return false;
    if (filter === 'non_smoker') return roommate.smokingHabit?.includes('Не кур') || roommate.traits.some((trait) => /не кур|без кур/i.test(trait));
    if (filter === 'remote') return roommate.workStyle?.includes('Удал') || roommate.traits.some((trait) => /из дома/i.test(trait));
    if (filter === 'early') return roommate.sleepHabit?.includes('Жаворонок');
    if (filter === 'budget') return roommate.budget <= 30000;
    return true;
  }), [filter, query, roommates]);

  const [featured, ...rest] = filtered;

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity accessibilityLabel="Назад" style={styles.iconButton} onPress={navigation.goBack}><ArrowLeft size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Соседи</Text><View style={styles.iconButton} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}><Search size={21} color={COLORS.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Имя, профессия или район" placeholderTextColor={COLORS.textMuted} style={styles.searchInput} /></View>
        <TouchableOpacity accessibilityLabel="Фильтры" style={styles.filterButton}><SlidersHorizontal size={20} color={COLORS.text} /></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => <TouchableOpacity key={item.id} style={[styles.filter, filter === item.id && styles.filterActive]} onPress={() => setFilter(item.id)}><Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>

      <View style={styles.resultRow}><Text style={styles.resultTitle}>Для вас</Text><Text style={styles.resultCount}>{filtered.length * 47} анкет</Text></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {featured ? <AnimatedListItem index={0}><FeaturedCard roommate={featured} onOpen={() => navigation.navigate('RoommateDetail', { id: featured.id })} onInvite={() => navigation.navigate('Group')} onFavorite={() => toggleFavoriteRoommate(featured.id)} /></AnimatedListItem> : null}
        {rest.map((roommate, index) => <AnimatedListItem key={roommate.id} index={index + 1}><CompactCard roommate={roommate} onOpen={() => navigation.navigate('RoommateDetail', { id: roommate.id })} onFavorite={() => toggleFavoriteRoommate(roommate.id)} /></AnimatedListItem>)}
        {!featured ? <View style={styles.empty}><Text style={styles.emptyTitle}>Никого не нашли</Text><Text style={styles.emptyText}>Попробуйте другой фильтр или запрос.</Text></View> : null}
      </ScrollView>
    </ScreenTransition>
  );
};

function FeaturedCard({ roommate, onOpen, onInvite, onFavorite }: { roommate: Roommate; onOpen: () => void; onInvite: () => void; onFavorite: () => void }) {
  return <View style={styles.featured}><TouchableOpacity style={styles.hero} onPress={onOpen} activeOpacity={0.9}><SafeImage uri={roommate.image} label={roommate.name} style={styles.fill} /><View style={styles.score}><Text style={styles.scoreValue}>{roommate.compatibility}%</Text><Text style={styles.scoreLabel}>совпадение</Text></View><TouchableOpacity accessibilityLabel="Избранное" style={styles.favorite} onPress={onFavorite}><Heart size={20} color={COLORS.text} fill={roommate.isFavorite ? COLORS.accent : 'transparent'} /></TouchableOpacity></TouchableOpacity><View style={styles.featuredBody}><TouchableOpacity onPress={onOpen}><View style={styles.nameRow}><Text style={styles.name}>{roommate.name}, {roommate.age}</Text><CheckCircle2 size={17} color={COLORS.accentBorder} fill={COLORS.accentSoft} /></View><Text style={styles.meta}>{roommate.job} · {roommate.district}</Text><Text style={styles.bio} numberOfLines={2}>{roommate.bio}</Text><View style={styles.traits}>{roommate.traits.slice(0, 3).map((trait, idx) => <View key={trait} style={[styles.trait, idx === 0 && styles.traitMatch]}><Text style={[styles.traitText, idx === 0 && styles.traitMatchText]}>{idx === 0 ? '✓ ' : ''}{trait}</Text></View>)}</View><View style={styles.quickFacts}><Fact icon={<WalletCards size={17} color={COLORS.text} />} value={`${Math.round(roommate.budget / 1000)} 000 ₽`} label="бюджет" /><Fact icon={<CalendarDays size={17} color={COLORS.text} />} value="15 авг." label="переезд" /><Fact icon={<BriefcaseBusiness size={17} color={COLORS.text} />} value={roommate.workStyle?.includes('Удал') ? 'Удалёнка' : 'Офис'} label="режим" /></View></TouchableOpacity><TouchableOpacity style={styles.primaryButton} onPress={onInvite}><Text style={styles.primaryText}>Пригласить в группу</Text></TouchableOpacity></View></View>;
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <View style={styles.fact}><View style={styles.factIcon}>{icon}</View><Text style={styles.factValue}>{value}</Text><Text style={styles.factLabel}>{label}</Text></View>;
}

function CompactCard({ roommate, onOpen, onFavorite }: { roommate: Roommate; onOpen: () => void; onFavorite: () => void }) {
  return <TouchableOpacity style={styles.compact} onPress={onOpen} activeOpacity={0.9}><View style={styles.compactMedia}><SafeImage uri={roommate.image} label={roommate.name} style={styles.fill} /><View style={styles.compactScore}><Text style={styles.compactScoreText}>{roommate.compatibility}%</Text></View></View><View style={styles.compactBody}><View style={styles.compactTop}><View style={styles.compactCopy}><Text style={styles.compactName}>{roommate.name}, {roommate.age}</Text><Text style={styles.compactMeta} numberOfLines={1}>{roommate.job}</Text></View><TouchableOpacity accessibilityLabel="Избранное" style={styles.smallFavorite} onPress={onFavorite}><Heart size={18} color={COLORS.text} fill={roommate.isFavorite ? COLORS.accent : 'transparent'} /></TouchableOpacity></View><View style={styles.location}><MapPin size={13} color={COLORS.accentBorder} /><Text style={styles.locationText} numberOfLines={1}>{roommate.district}</Text></View><Text style={styles.compactBio} numberOfLines={2}>{roommate.bio}</Text><Text style={styles.compactBudget}>до {roommate.budget.toLocaleString('ru-RU')} ₽ / мес.</Text></View></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { minHeight: 62, paddingHorizontal: 16, paddingBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6, color: COLORS.text },
  searchRow: { paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', gap: 9 },
  search: { flex: 1, height: 52, paddingHorizontal: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filterButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  filters: { minHeight: 62, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filter: { minHeight: 42, paddingHorizontal: 18, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 12.5, color: COLORS.text },
  filterTextActive: { fontWeight: '800' },
  resultRow: { paddingHorizontal: 17, minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  resultCount: { fontSize: 12.5, color: COLORS.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 36 },
  featured: { marginBottom: 14, overflow: 'hidden', borderRadius: 21, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  hero: { height: 292, position: 'relative' },
  fill: { width: '100%', height: '100%' },
  score: { position: 'absolute', left: 12, bottom: 12, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 13, backgroundColor: COLORS.accent },
  scoreValue: { fontSize: 18, lineHeight: 19, fontWeight: '900', color: COLORS.text },
  scoreLabel: { marginTop: 1, fontSize: 9, fontWeight: '700', color: COLORS.text },
  favorite: { position: 'absolute', right: 12, top: 12, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  featuredBody: { padding: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.6, color: COLORS.text },
  meta: { marginTop: 4, fontSize: 12.5, color: COLORS.textMuted },
  bio: { marginTop: 10, fontSize: 13, lineHeight: 18, color: COLORS.textSecondary },
  traits: { marginTop: 11, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  trait: { minHeight: 28, paddingHorizontal: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  traitMatch: { backgroundColor: COLORS.accent, borderColor: COLORS.accentBorder },
  traitText: { fontSize: 10.5, color: COLORS.text },
  traitMatchText: { fontWeight: '800' },
  quickFacts: { marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: COLORS.borderLight, flexDirection: 'row' },
  fact: { flex: 1, alignItems: 'center' },
  factIcon: { width: 31, height: 31, marginBottom: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  factValue: { fontSize: 11.5, fontWeight: '900', color: COLORS.text },
  factLabel: { marginTop: 2, fontSize: 9.5, color: COLORS.textMuted },
  primaryButton: { marginTop: 15, minHeight: 49, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  primaryText: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  compact: { minHeight: 154, marginBottom: 12, padding: 10, borderRadius: 18, flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  compactMedia: { width: 116, minHeight: 134, overflow: 'hidden', borderRadius: 14, position: 'relative' },
  compactScore: { position: 'absolute', left: 7, bottom: 7, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: COLORS.accent },
  compactScoreText: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  compactBody: { flex: 1, paddingVertical: 3 },
  compactTop: { flexDirection: 'row', alignItems: 'flex-start' },
  compactCopy: { flex: 1 },
  compactName: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  compactMeta: { marginTop: 3, fontSize: 11.5, color: COLORS.textMuted },
  smallFavorite: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  location: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { flex: 1, fontSize: 10.5, color: COLORS.textMuted },
  compactBio: { marginTop: 8, fontSize: 11, lineHeight: 15, color: COLORS.textSecondary },
  compactBudget: { marginTop: 'auto', fontSize: 11.5, fontWeight: '900', color: COLORS.text },
  empty: { paddingVertical: 70, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  emptyText: { marginTop: 7, fontSize: 13, color: COLORS.textMuted },
});
