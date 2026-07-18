import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Search, SlidersHorizontal, Map, List, MapPin } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { PropertyCard } from '../components/PropertyCard';
import { FilterChips } from '../components/FilterChips';
import { useGlobalState } from '../data/stateStore';

interface HousingScreenProps {
  navigation: any;
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Все объекты' },
  { id: '1room', label: '1-комнатные' },
  { id: '2rooms', label: '2-комнатные' },
  { id: 'center', label: 'Центральный' },
  { id: 'budget', label: 'До 25k/чел' },
];

export const HousingScreen: React.FC<HousingScreenProps> = ({ navigation }) => {
  const { properties } = useGlobalState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMapView, setIsMapView] = useState(false);

  const filteredProperties = properties.filter((p) => {
    // Search query match
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(query);
      const addressMatch = p.address.toLowerCase().includes(query);
      const districtMatch = p.district.toLowerCase().includes(query);
      if (!titleMatch && !addressMatch && !districtMatch) return false;
    }

    if (selectedFilter === '1room') return p.rooms === 1;
    if (selectedFilter === '2rooms') return p.rooms === 2;
    if (selectedFilter === 'center') return p.district.includes('Центральный');
    if (selectedFilter === 'budget') return p.price / 2 <= 25000;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по адресу, району..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <SlidersHorizontal size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChipsRow}>
        <FilterChips
          options={FILTER_OPTIONS}
          selectedId={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </View>

      {/* View Toggle Bar */}
      <View style={styles.toggleRow}>
        <Text style={styles.countText}>Найдено {filteredProperties.length} варианта</Text>
        
        <View style={styles.toggleSwitch}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isMapView && styles.toggleBtnActive]}
            onPress={() => setIsMapView(false)}
          >
            <List size={15} color={!isMapView ? COLORS.text : COLORS.textMuted} />
            <Text style={[styles.toggleBtnText, !isMapView && styles.toggleBtnTextActive]}>
              Список
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isMapView && styles.toggleBtnActive]}
            onPress={() => setIsMapView(true)}
          >
            <Map size={15} color={isMapView ? COLORS.text : COLORS.textMuted} />
            <Text style={[styles.toggleBtnText, isMapView && styles.toggleBtnTextActive]}>
              Карта
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isMapView ? (
        <View style={styles.mapMockContainer}>
          <View style={styles.mapMockBg}>
            <MapPin size={32} color={COLORS.accentBorder} style={styles.mapPin1} />
            <View style={styles.mapPinBadge1}>
              <Text style={styles.pinText}>48 000 ₽ (98%)</Text>
            </View>

            <MapPin size={32} color={COLORS.info} style={styles.mapPin2} />
            <View style={styles.mapPinBadge2}>
              <Text style={styles.pinText}>55 000 ₽ (95%)</Text>
            </View>

            <Text style={styles.mapNotice}>
              Интерактивная карта Краснодара (OpenStreetMap / MapLibre)
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => navigation.navigate('HousingDetail', { id: property.id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipsRow: {
    maxHeight: 50,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  toggleSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mapMockContainer: {
    flex: 1,
    margin: 20,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapMockBg: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPin1: {
    position: 'absolute',
    top: '35%',
    left: '40%',
  },
  mapPinBadge1: {
    position: 'absolute',
    top: '30%',
    left: '25%',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  mapPin2: {
    position: 'absolute',
    top: '55%',
    left: '60%',
  },
  mapPinBadge2: {
    position: 'absolute',
    top: '50%',
    left: '52%',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  mapNotice: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
