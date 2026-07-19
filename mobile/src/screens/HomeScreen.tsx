import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ChevronDown, ChevronRight, Heart, MapPin, Search, Sparkles, Star, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { useGlobalState } from '../data/stateStore';
import { Property } from '../types';
import { COLORS, RADIUS } from '../theme/colors';

interface Props {
  navigation: { navigate: (screen: string, params?: Record<string, string>) => void };
}

function ListingCard({ property, compact, onPress, onFavorite }: { property: Property; compact?: boolean; onPress: () => void; onFavorite: () => void }) {
  return (
    <TouchableOpacity style={[styles.listing, compact && styles.listingCompact]} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.listingMedia, compact && styles.listingMediaCompact]}>
        <SafeImage uri={property.image} label={property.title} style={styles.fill} />
        <TouchableOpacity style={styles.heart} onPress={onFavorite} accessibilityLabel="Избранное">
          <Heart size={17} color={COLORS.text} fill={property.isFavorite ? COLORS.accent : 'transparent'} />
        </TouchableOpacity>
        {!compact ? <View style={styles.rating}><Star size={11} color="#F59E0B" fill="#F59E0B" /><Text style={styles.ratingText}>4.{property.match - 89} ({property.photosCount + 8})</Text></View> : null}
      </View>
      <View style={compact ? styles.compactBody : styles.listingBody}>
        {!compact ? <Text style={styles.factLine}>{property.rooms} комната · {property.area} м² · {property.floor} этаж</Text> : null}
        <Text style={compact ? styles.compactPrice : styles.listingPrice}>{property.price.toLocaleString('ru-RU')} ₽ <Text style={styles.priceSuffix}>/ мес.</Text></Text>
        <View style={styles.miniFacts}>
          <Text style={styles.miniAccent}>⌂</Text><Text style={styles.miniText}>{property.rooms * 3 + 2} мин</Text>
          <Text style={styles.miniText}>♙ {compact ? '0,8' : '1,2'} км</Text>
          <Users size={12} color={COLORS.textMuted} /><Text style={styles.miniText}>{property.rooms + 1}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { properties, roommates, toggleFavoriteProperty } = useGlobalState();

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.top, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.logo}>соседи<Text style={styles.logoDot}>.</Text></Text>
        <TouchableOpacity style={styles.location} onPress={() => navigation.navigate('Housing')}>
          <MapPin size={19} color={COLORS.text} />
          <Text style={styles.locationText}>Краснодар</Text>
          <ChevronDown size={17} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.search} onPress={() => navigation.navigate('Housing')} activeOpacity={0.9}>
          <Search size={20} color={COLORS.textMuted} />
          <Text style={styles.searchText}>Поиск по району, метро или адресу</Text>
        </TouchableOpacity>

        <SectionTitle title="Популярное" onPress={() => navigation.navigate('Housing')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          {properties.map((property, index) => (
            <AnimatedListItem key={property.id} index={index}>
              <ListingCard property={property} onPress={() => navigation.navigate('HousingDetail', { id: property.id })} onFavorite={() => toggleFavoriteProperty(property.id)} />
            </AnimatedListItem>
          ))}
        </ScrollView>

        <TouchableOpacity style={[styles.lifestyle, { width: width - 36 }]} onPress={() => navigation.navigate('Compatibility')} activeOpacity={0.9}>
          <View style={styles.lifestyleCopy}>
            <Sparkles size={19} color={COLORS.text} />
            <Text style={styles.lifestyleTitle}>Подбор{`\n`}по образу жизни</Text>
            <Text style={styles.lifestyleText}>Найдём жильё и соседей под ваш ритм, интересы и привычки</Text>
            <View style={styles.lifestyleButton}><Text style={styles.lifestyleButtonText}>Пройти подбор</Text><ChevronRight size={18} color={COLORS.text} /></View>
          </View>
          <SafeImage uri={roommates[0]?.image} label="Мария" style={[styles.bannerPerson, styles.bannerPersonOne]} />
          <SafeImage uri={roommates[1]?.image} label="Артём" style={[styles.bannerPerson, styles.bannerPersonTwo]} />
        </TouchableOpacity>

        <SectionTitle title="Рядом с вами" onPress={() => navigation.navigate('Housing')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearShelf}>
          {properties.map((property, index) => (
            <AnimatedListItem key={`near-${property.id}`} index={index}>
              <ListingCard compact property={property} onPress={() => navigation.navigate('HousingDetail', { id: property.id })} onFavorite={() => toggleFavoriteProperty(property.id)} />
            </AnimatedListItem>
          ))}
        </ScrollView>

        <View style={styles.shortcutRow}>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate('Roommates')}><Users size={19} color={COLORS.text} /><Text style={styles.shortcutText}>Найти соседа</Text></TouchableOpacity>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate('Recommendations')}><Sparkles size={19} color={COLORS.text} /><Text style={styles.shortcutText}>Рекомендации</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenTransition>
  );
};

function SectionTitle({ title, onPress }: { title: string; onPress: () => void }) {
  return <View style={styles.sectionHead}><Text style={styles.sectionTitle}>{title}</Text><TouchableOpacity style={styles.allLink} onPress={onPress}><Text style={styles.allText}>Смотреть все</Text><ChevronRight size={17} color={COLORS.accentBorder} /></TouchableOpacity></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  top: { minHeight: 74, paddingHorizontal: 18, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  logo: { fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -2.2, color: COLORS.text },
  logoDot: { color: COLORS.accentBorder },
  location: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7 },
  locationText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  content: { paddingBottom: 28 },
  search: { height: 52, marginHorizontal: 18, marginTop: 12, paddingHorizontal: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  searchText: { flex: 1, fontSize: 14, color: COLORS.textMuted },
  sectionHead: { marginTop: 28, marginBottom: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.7, color: COLORS.text },
  allLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 2 },
  allText: { fontSize: 13, color: COLORS.accentBorder },
  shelf: { paddingHorizontal: 18, gap: 10 },
  listing: { width: 210, overflow: 'hidden', borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border },
  listingCompact: { width: 158, borderRadius: 15 },
  listingMedia: { height: 164, position: 'relative' },
  listingMediaCompact: { height: 112 },
  fill: { width: '100%', height: '100%' },
  heart: { position: 'absolute', right: 9, top: 9, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  rating: { position: 'absolute', left: 9, bottom: 9, minHeight: 26, paddingHorizontal: 8, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.94)' },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  listingBody: { padding: 12 },
  compactBody: { padding: 10 },
  factLine: { fontSize: 11, color: COLORS.textMuted },
  listingPrice: { marginTop: 8, fontSize: 18, fontWeight: '900', color: COLORS.text },
  compactPrice: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  priceSuffix: { fontSize: 11, fontWeight: '500' },
  miniFacts: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniAccent: { fontSize: 12, color: COLORS.accentBorder },
  miniText: { fontSize: 10, color: COLORS.textMuted, marginRight: 3 },
  lifestyle: { alignSelf: 'stretch', height: 242, marginHorizontal: 18, marginTop: 28, borderRadius: 24, overflow: 'hidden', backgroundColor: COLORS.accent, flexDirection: 'row' },
  lifestyleCopy: { width: '60%', zIndex: 2, padding: 20, alignItems: 'flex-start' },
  lifestyleTitle: { marginTop: 10, fontSize: 25, lineHeight: 27, fontWeight: '900', letterSpacing: -0.8, color: COLORS.text },
  lifestyleText: { marginTop: 9, maxWidth: 190, fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  lifestyleButton: { marginTop: 15, minHeight: 42, paddingHorizontal: 14, borderRadius: 21, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface },
  lifestyleButtonText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  bannerPerson: { position: 'absolute', bottom: -8, width: 124, height: 180, borderRadius: 62, borderWidth: 6, borderColor: 'rgba(255,255,255,0.45)' },
  bannerPersonOne: { right: 62, transform: [{ rotate: '-5deg' }] },
  bannerPersonTwo: { right: -23, transform: [{ rotate: '5deg' }] },
  nearShelf: { paddingHorizontal: 18, gap: 9 },
  shortcutRow: { paddingHorizontal: 18, marginTop: 26, flexDirection: 'row', gap: 10 },
  shortcut: { flex: 1, minHeight: 52, paddingHorizontal: 14, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shortcutText: { fontSize: 12, fontWeight: '800', color: COLORS.text },
});
