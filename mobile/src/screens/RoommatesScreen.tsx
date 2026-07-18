import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';
import { RoommateCard } from '../components/RoommateCard';
import { FilterChips } from '../components/FilterChips';
import { useGlobalState } from '../data/stateStore';

interface RoommatesScreenProps {
  navigation: any;
}

const ROOMMATE_FILTERS = [
  { id: 'all', label: 'Все кандидаты' },
  { id: 'non_smoker', label: 'Не курят' },
  { id: 'remote', label: 'Удалёнка' },
  { id: 'early', label: 'Жаворонки' },
  { id: 'budget', label: 'Бюджет 25k+' },
];

export const RoommatesScreen: React.FC<RoommatesScreenProps> = ({ navigation }) => {
  const { roommates } = useGlobalState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredRoommates = roommates.filter((r) => {
    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = r.name.toLowerCase().includes(query);
      const jobMatch = r.job.toLowerCase().includes(query);
      const traitMatch = r.traits.some((t) => t.toLowerCase().includes(query));
      if (!nameMatch && !jobMatch && !traitMatch) return false;
    }

    if (selectedFilter === 'non_smoker') return r.traits.includes('Без курения') || r.traits.includes('Не курит') || r.traits.includes('Спокойная');
    if (selectedFilter === 'remote') return r.traits.includes('Работает из дома');
    if (selectedFilter === 'early') return r.sleepHabit?.includes('Жаворонок');
    if (selectedFilter === 'budget') return r.budget >= 25000;
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
            placeholder="Поиск соседа по имени, работе..."
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
          options={ROOMMATE_FILTERS}
          selectedId={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </View>

      <Text style={styles.countText}>
        Найдено {filteredRoommates.length} совместимых кандидатов
      </Text>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredRoommates.map((roommate) => (
          <RoommateCard
            key={roommate.id}
            roommate={roommate}
            onPress={() => navigation.navigate('RoommateDetail', { id: roommate.id })}
            onInvitePress={() => navigation.navigate('Group')}
          />
        ))}
      </ScrollView>
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
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
