import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Heart, Home, MapPin, Search, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { useGlobalState } from '../data/stateStore';
import { Property, Roommate } from '../types';
import { AppNavigation } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation }

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { properties, roommates, toggleFavoriteProperty, toggleFavoriteRoommate } = useGlobalState();
  const [tab, setTab] = useState<'properties' | 'roommates'>('properties');
  const favoriteProperties = properties.filter((item) => item.isFavorite);
  const favoriteRoommates = roommates.filter((item) => item.isFavorite);
  const list = tab === 'properties' ? favoriteProperties : favoriteRoommates;

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}><Text style={styles.eyebrow}>ВАША КОЛЛЕКЦИЯ</Text><Text style={styles.title}>Избранное.</Text><Text style={styles.subtitle}>Сохранённые квартиры и люди в одном месте</Text></View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'properties' && styles.tabActive]} onPress={() => setTab('properties')}><Home size={16} color={COLORS.text} /><Text style={[styles.tabText, tab === 'properties' && styles.tabTextActive]}>Жильё · {favoriteProperties.length}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'roommates' && styles.tabActive]} onPress={() => setTab('roommates')}><Users size={16} color={COLORS.text} /><Text style={[styles.tabText, tab === 'roommates' && styles.tabTextActive]}>Соседи · {favoriteRoommates.length}</Text></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.listHead}><Text style={styles.listTitle}>{tab === 'properties' ? 'Сохранённое жильё' : 'Сохранённые соседи'}</Text><Text style={styles.listCount}>{list.length}</Text></View>
        {tab === 'properties' ? favoriteProperties.map((property, index) => <AnimatedListItem key={property.id} index={index}><PropertyFavorite property={property} onOpen={() => navigation.navigate('HousingDetail', { id: property.id })} onRemove={() => toggleFavoriteProperty(property.id)} /></AnimatedListItem>) : favoriteRoommates.map((roommate, index) => <AnimatedListItem key={roommate.id} index={index}><RoommateFavorite roommate={roommate} onOpen={() => navigation.navigate('RoommateDetail', { id: roommate.id })} onRemove={() => toggleFavoriteRoommate(roommate.id)} /></AnimatedListItem>)}
        {list.length === 0 ? <View style={styles.empty}><View style={styles.emptyIcon}>{tab === 'properties' ? <Home size={27} color={COLORS.text} /> : <Users size={27} color={COLORS.text} />}</View><Text style={styles.emptyTitle}>Здесь пока пусто</Text><Text style={styles.emptyText}>{tab === 'properties' ? 'Сохраняйте квартиры, чтобы быстро вернуться к сравнению.' : 'Сохраняйте подходящих людей и приглашайте их в группу.'}</Text><TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate(tab === 'properties' ? 'Housing' : 'Roommates')}><Search size={17} color={COLORS.text} /><Text style={styles.emptyButtonText}>{tab === 'properties' ? 'Найти жильё' : 'Найти соседей'}</Text></TouchableOpacity></View> : null}
      </ScrollView>
    </ScreenTransition>
  );
};

function PropertyFavorite({ property, onOpen, onRemove }: { property: Property; onOpen: () => void; onRemove: () => void }) {
  return <TouchableOpacity style={styles.property} onPress={onOpen} activeOpacity={0.9}><View style={styles.propertyMedia}><SafeImage uri={property.image} label={property.title} style={styles.fill} /><View style={styles.match}><Users size={13} color={COLORS.text} /><Text style={styles.matchText}>{property.match}%</Text></View><TouchableOpacity accessibilityLabel="Удалить из избранного" style={styles.favorite} onPress={onRemove}><Heart size={20} color={COLORS.text} fill={COLORS.accent} /></TouchableOpacity></View><View style={styles.propertyBody}><Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ <Text style={styles.unit}>/ мес.</Text></Text><View style={styles.address}><MapPin size={14} color={COLORS.accentBorder} /><Text style={styles.addressText} numberOfLines={1}>{property.address}</Text></View><Text style={styles.propertyFacts}>{property.rooms} комната · {property.area} м² · {property.floor} этаж</Text><View style={styles.tags}>{property.tags.slice(0, 2).map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View></View></TouchableOpacity>;
}

function RoommateFavorite({ roommate, onOpen, onRemove }: { roommate: Roommate; onOpen: () => void; onRemove: () => void }) {
  return <TouchableOpacity style={styles.roommate} onPress={onOpen} activeOpacity={0.9}><View style={styles.roommateMedia}><SafeImage uri={roommate.image} label={roommate.name} style={styles.fill} /><View style={styles.roommateMatch}><Text style={styles.roommateMatchText}>{roommate.compatibility}%</Text></View></View><View style={styles.roommateBody}><View style={styles.roommateTop}><View><Text style={styles.roommateName}>{roommate.name}, {roommate.age}</Text><Text style={styles.roommateMeta}>{roommate.job}</Text></View><TouchableOpacity accessibilityLabel="Удалить из избранного" style={styles.smallHeart} onPress={onRemove}><Heart size={19} color={COLORS.text} fill={COLORS.accent} /></TouchableOpacity></View><Text style={styles.roommateDistrict} numberOfLines={1}>{roommate.district}</Text><Text style={styles.roommateBio} numberOfLines={2}>{roommate.bio}</Text><Text style={styles.roommateBudget}>до {roommate.budget.toLocaleString('ru-RU')} ₽ / мес.</Text></View></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { paddingHorizontal: 18, paddingBottom: 17, backgroundColor: COLORS.surface },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: COLORS.textMuted },
  title: { marginTop: 4, fontSize: 30, lineHeight: 34, fontWeight: '900', letterSpacing: -1.1, color: COLORS.text },
  subtitle: { marginTop: 5, fontSize: 12.5, color: COLORS.textMuted },
  tabs: { margin: 16, marginBottom: 4, padding: 4, borderRadius: 18, flexDirection: 'row', backgroundColor: COLORS.surfaceMuted },
  tab: { flex: 1, minHeight: 43, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { fontSize: 11.5, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.text, fontWeight: '900' },
  content: { padding: 16, paddingBottom: 36 },
  listHead: { minHeight: 42, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  listTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  listCount: { minWidth: 27, height: 27, borderRadius: 14, textAlign: 'center', paddingTop: 5, fontSize: 11, fontWeight: '900', color: COLORS.text, backgroundColor: COLORS.accentSoft },
  property: { marginBottom: 13, overflow: 'hidden', borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  propertyMedia: { height: 218, position: 'relative' },
  fill: { width: '100%', height: '100%' },
  match: { position: 'absolute', left: 11, top: 11, minHeight: 34, paddingHorizontal: 10, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.accentSoft },
  matchText: { fontSize: 12.5, fontWeight: '900', color: COLORS.text },
  favorite: { position: 'absolute', right: 11, top: 11, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  propertyBody: { padding: 14 },
  price: { fontSize: 21, fontWeight: '900', color: COLORS.text },
  unit: { fontSize: 12.5, fontWeight: '500' },
  address: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  addressText: { flex: 1, fontSize: 11.5, color: COLORS.textMuted },
  propertyFacts: { marginTop: 10, fontSize: 11.5, color: COLORS.textSecondary },
  tags: { marginTop: 10, flexDirection: 'row', gap: 7 },
  tag: { maxWidth: '48%', minHeight: 28, paddingHorizontal: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  tagText: { fontSize: 9.5, color: COLORS.text },
  roommate: { minHeight: 165, marginBottom: 12, padding: 10, borderRadius: 19, flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  roommateMedia: { width: 126, minHeight: 145, overflow: 'hidden', borderRadius: 15, position: 'relative' },
  roommateMatch: { position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, backgroundColor: COLORS.accent },
  roommateMatchText: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  roommateBody: { flex: 1, paddingVertical: 4 },
  roommateTop: { flexDirection: 'row', justifyContent: 'space-between' },
  roommateName: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  roommateMeta: { marginTop: 3, fontSize: 11, color: COLORS.textMuted },
  smallHeart: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center' },
  roommateDistrict: { marginTop: 8, fontSize: 10.5, color: COLORS.accentBorder },
  roommateBio: { marginTop: 8, fontSize: 11, lineHeight: 15, color: COLORS.textSecondary },
  roommateBudget: { marginTop: 'auto', fontSize: 11.5, fontWeight: '900', color: COLORS.text },
  empty: { paddingHorizontal: 30, paddingTop: 64, alignItems: 'center' },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentSoft },
  emptyTitle: { marginTop: 18, fontSize: 19, fontWeight: '900', color: COLORS.text },
  emptyText: { marginTop: 7, fontSize: 13, lineHeight: 19, textAlign: 'center', color: COLORS.textMuted },
  emptyButton: { marginTop: 18, minHeight: 48, paddingHorizontal: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accent },
  emptyButtonText: { fontSize: 13, fontWeight: '900', color: COLORS.text },
});
