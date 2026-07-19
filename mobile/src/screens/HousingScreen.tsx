import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Heart, List, Map as MapIcon, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { useGlobalState } from '../data/stateStore';
import { Property } from '../types';
import { AppNavigation } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation }

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'room', label: 'Комната' },
  { id: 'flat', label: 'Квартира' },
  { id: 'studio', label: 'Студия' },
  { id: 'coliving', label: 'Коливинг' },
];

export const HousingScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { properties, toggleFavoriteProperty } = useGlobalState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState(properties[0]?.id);

  const filtered = useMemo(() => properties.filter((item) => {
    const q = query.trim().toLowerCase();
    if (q && !`${item.title} ${item.address} ${item.district}`.toLowerCase().includes(q)) return false;
    if (filter === 'room') return item.rooms === 1;
    if (filter === 'flat') return item.rooms >= 2;
    if (filter === 'studio') return item.area <= 35;
    if (filter === 'coliving') return item.match >= 96;
    return true;
  }), [filter, properties, query]);

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity accessibilityLabel="Назад" style={styles.back} onPress={navigation.goBack}><ArrowLeft size={22} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Жильё</Text><View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}><Search size={21} color={COLORS.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Поиск по району, метро или адресу" placeholderTextColor={COLORS.textMuted} style={styles.searchInput} /></View>
        <TouchableOpacity accessibilityLabel="Фильтры" style={styles.filterButton}><SlidersHorizontal size={20} color={COLORS.text} /></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => <TouchableOpacity key={item.id} style={[styles.filter, filter === item.id && styles.filterActive]} onPress={() => setFilter(item.id)}><Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text></TouchableOpacity>)}
      </ScrollView>

      <View style={styles.resultRow}><Text style={styles.resultText}>{filtered.length * 314} предложений</Text><View style={styles.segment}><TouchableOpacity style={[styles.segmentItem, mode === 'list' && styles.segmentActive]} onPress={() => setMode('list')}><List size={15} color={mode === 'list' ? COLORS.text : COLORS.textMuted} /><Text style={[styles.segmentText, mode === 'list' && styles.segmentTextActive]}>Список</Text></TouchableOpacity><TouchableOpacity style={[styles.segmentItem, mode === 'map' && styles.segmentActive]} onPress={() => setMode('map')}><MapIcon size={15} color={mode === 'map' ? COLORS.text : COLORS.textMuted} /><Text style={[styles.segmentText, mode === 'map' && styles.segmentTextActive]}>Карта</Text></TouchableOpacity></View></View>

      {mode === 'list' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.map((property, index) => <AnimatedListItem key={property.id} index={index}><CatalogCard property={property} onOpen={() => navigation.navigate('HousingDetail', { id: property.id })} onFavorite={() => toggleFavoriteProperty(property.id)} /></AnimatedListItem>)}
        </ScrollView>
      ) : (
        <MapView properties={filtered} selected={selected} onSelect={setSelected} onOpen={(id) => navigation.navigate('HousingDetail', { id })} />
      )}
    </ScreenTransition>
  );
};

function CatalogCard({ property, onOpen, onFavorite }: { property: Property; onOpen: () => void; onFavorite: () => void }) {
  return <TouchableOpacity style={styles.card} onPress={onOpen} activeOpacity={0.9}><View style={styles.media}><SafeImage uri={property.image} label={property.title} style={styles.fill} /><View style={styles.match}><Users size={14} color={COLORS.text} /><Text style={styles.matchText}>{property.match}%</Text></View><TouchableOpacity accessibilityLabel="Избранное" style={styles.favorite} onPress={onFavorite}><Heart size={20} color={COLORS.text} fill={property.isFavorite ? COLORS.accent : 'transparent'} /></TouchableOpacity></View><View style={styles.cardBody}><Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ <Text style={styles.priceUnit}>/ мес.</Text></Text><View style={styles.address}><MapPin size={14} color={COLORS.accentBorder} /><Text style={styles.addressText} numberOfLines={1}>{property.address} · 5 мин пешком</Text></View><View style={styles.facts}><Text style={styles.fact}>{property.rooms} {property.rooms === 1 ? 'комната' : 'комнаты'}</Text><Text style={styles.fact}>{property.area} м²</Text><Text style={styles.fact}>{property.floor} этаж</Text></View><View style={styles.tags}>{(property.amenities ?? property.tags).slice(0, 3).map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText} numberOfLines={1}>{tag}</Text></View>)}</View></View></TouchableOpacity>;
}

function MapView({ properties, selected, onSelect, onOpen }: { properties: Property[]; selected?: string; onSelect: (id: string) => void; onOpen: (id: string) => void }) {
  const active = properties.find((item) => item.id === selected) ?? properties[0];
  const positions = [styles.pin0, styles.pin1, styles.pin2, styles.pin3];
  return <View style={styles.mapWrap}><View style={styles.map}><View style={[styles.road, styles.roadOne]} /><View style={[styles.road, styles.roadTwo]} /><View style={[styles.road, styles.roadThree]} /><Text style={styles.mapLabel}>ЦЕНТР КРАСНОДАРА</Text>{properties.map((item, index) => <TouchableOpacity key={item.id} style={[styles.pin, positions[index % positions.length], selected === item.id && styles.pinActive]} onPress={() => onSelect(item.id)}><Text style={styles.pinText}>{Math.round(item.price / 1000)} тыс.</Text></TouchableOpacity>)}</View>{active ? <TouchableOpacity style={styles.preview} onPress={() => onOpen(active.id)}><SafeImage uri={active.image} label={active.title} style={styles.previewImage} /><View style={styles.previewCopy}><Text style={styles.previewTitle} numberOfLines={2}>{active.title}</Text><Text style={styles.previewPrice}>{active.price.toLocaleString('ru-RU')} ₽ / мес.</Text></View></TouchableOpacity> : null}</View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { minHeight: 62, paddingHorizontal: 16, paddingBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 42 },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6, color: COLORS.text },
  searchRow: { paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', gap: 9 },
  search: { flex: 1, height: 52, paddingHorizontal: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 13.5, color: COLORS.text },
  filterButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  filters: { minHeight: 62, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filter: { minHeight: 42, paddingHorizontal: 19, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 13, color: COLORS.text },
  filterTextActive: { fontWeight: '800' },
  resultRow: { minHeight: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultText: { fontSize: 13.5, color: COLORS.textMuted },
  segment: { padding: 3, borderRadius: 17, flexDirection: 'row', backgroundColor: COLORS.surfaceMuted },
  segmentItem: { minHeight: 34, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  segmentActive: { backgroundColor: COLORS.surface },
  segmentText: { fontSize: 11.5, color: COLORS.textMuted },
  segmentTextActive: { fontWeight: '800', color: COLORS.text },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { marginBottom: 14, overflow: 'hidden', borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  media: { height: 188, position: 'relative' },
  fill: { width: '100%', height: '100%' },
  match: { position: 'absolute', left: 12, top: 12, minHeight: 34, paddingHorizontal: 11, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.accentSoft },
  matchText: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  favorite: { position: 'absolute', right: 12, top: 12, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  cardBody: { padding: 13 },
  price: { fontSize: 21, lineHeight: 24, fontWeight: '900', color: COLORS.text },
  priceUnit: { fontSize: 13, fontWeight: '500' },
  address: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  addressText: { flex: 1, fontSize: 12, color: COLORS.textMuted },
  facts: { marginTop: 10, flexDirection: 'row', gap: 18 },
  fact: { fontSize: 12, color: COLORS.textSecondary },
  tags: { marginTop: 10, flexDirection: 'row', gap: 7 },
  tag: { maxWidth: '36%', minHeight: 28, paddingHorizontal: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  tagText: { fontSize: 10.5, color: COLORS.text },
  mapWrap: { flex: 1, margin: 16, overflow: 'hidden', borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  map: { flex: 1, minHeight: 390, position: 'relative', overflow: 'hidden', backgroundColor: '#E8EAE3' },
  road: { position: 'absolute', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D8DBD3' },
  roadOne: { left: -20, right: -20, top: '30%', height: 28, transform: [{ rotate: '-7deg' }] },
  roadTwo: { top: -40, bottom: -40, left: '45%', width: 26, transform: [{ rotate: '8deg' }] },
  roadThree: { left: -20, right: -20, bottom: '22%', height: 22, transform: [{ rotate: '5deg' }] },
  mapLabel: { position: 'absolute', left: 16, top: 17, fontSize: 9, fontWeight: '900', letterSpacing: 1.1, color: COLORS.textMuted },
  pin: { position: 'absolute', minHeight: 34, paddingHorizontal: 10, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  pin0: { left: '14%', top: '21%' }, pin1: { right: '13%', top: '38%' }, pin2: { left: '28%', bottom: '24%' }, pin3: { right: '24%', top: '15%' },
  pinActive: { backgroundColor: COLORS.accent },
  pinText: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  preview: { minHeight: 94, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  previewImage: { width: 78, height: 72, borderRadius: 13 },
  previewCopy: { flex: 1 },
  previewTitle: { fontSize: 13, lineHeight: 17, fontWeight: '800', color: COLORS.text },
  previewPrice: { marginTop: 7, fontSize: 13, fontWeight: '900', color: COLORS.text },
});
