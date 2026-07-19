import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ChevronRight, Heart, MapPin, MessageCircle, Share2, Wifi, WashingMachine, Wind } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeImage } from '../components/SafeImage';
import { ScreenTransition } from '../components/ScreenTransition';
import { useGlobalState } from '../data/stateStore';
import { AppNavigation, IdRoute } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { route: IdRoute; navigation: AppNavigation }

const amenityIcons = [Wifi, Wind, WashingMachine, Wifi, WashingMachine, Wind];

export const HousingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { properties, group, toggleFavoriteProperty } = useGlobalState();
  const property = properties.find((item) => item.id === route.params?.id) ?? properties[0];
  const gallery = [property, ...properties.filter((item) => item.id !== property.id)].slice(0, 4);

  return (
    <ScreenTransition style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 104 + insets.bottom }]}>
        <View style={styles.hero}>
          <SafeImage uri={property.image} label={property.title} style={styles.heroImage} />
          <View style={[styles.heroControls, { top: Math.max(insets.top, 12) + 4 }]}>
            <RoundButton label="Назад" onPress={navigation.goBack}><ArrowLeft size={22} color={COLORS.text} /></RoundButton>
            <View style={styles.heroRight}>
              <RoundButton label="Избранное" onPress={() => toggleFavoriteProperty(property.id)}><Heart size={21} color={COLORS.text} fill={property.isFavorite ? COLORS.accent : 'transparent'} /></RoundButton>
              <RoundButton label="Поделиться" onPress={() => undefined}><Share2 size={20} color={COLORS.text} /></RoundButton>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
          {gallery.map((item, index) => <SafeImage key={`${item.id}-${index}`} uri={item.image} label={item.title} style={styles.thumb} />)}
          <View style={styles.moreThumb}><Text style={styles.moreText}>+{Math.max(property.photosCount - 4, 6)}</Text></View>
        </ScrollView>

        <View style={styles.main}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>{property.price.toLocaleString('ru-RU')} ₽ <Text style={styles.priceUnit}>/ мес.</Text></Text>
          <View style={styles.addressRow}><MapPin size={16} color={COLORS.textMuted} /><Text style={styles.address}>{property.address}</Text><Text style={styles.walk}>5 мин. <Text style={styles.lime}>♙</Text></Text></View>

          <View style={styles.facts}>
            <Fact value={`${property.rooms} комнаты`} icon="◇" />
            <Fact value={`${property.area} м²`} icon="□" />
            <Fact value={`${property.floor} этаж`} icon="▟" />
            <Fact value="Высокие потолки" icon="↥" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
            {['Для группы', 'Без животных', 'Можно с велосипедом'].map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagIcon}>✦</Text><Text style={styles.tagText}>{tag}</Text></View>)}
          </ScrollView>

          <Section title="О квартире">
            <Text style={styles.body}>{property.description} Светлая кухня-гостиная, спокойный двор и регулярная уборка общих зон.</Text>
          </Section>

          <Section title="Удобства">
            <View style={styles.amenities}>
              {(property.amenities ?? ['Общая кухня', 'Кондиционер', 'Быстрый Wi-Fi', 'Стиральная машина', 'Уборка общих зон', 'Лифт']).slice(0, 6).map((name, index) => {
                const Icon = amenityIcons[index];
                return <View key={name} style={styles.amenity}><Icon size={17} color={COLORS.text} /><Text style={styles.amenityText}>{name}</Text></View>;
              })}
            </View>
          </Section>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Будущие соседи</Text><TouchableOpacity style={styles.allNeighbors} onPress={() => navigation.navigate('Group')}><Text style={styles.allNeighborsText}>Все {group.members.length}</Text><ChevronRight size={17} color={COLORS.accentBorder} /></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.people}>
            {group.members.map((member) => <TouchableOpacity key={member.id} style={styles.person} onPress={() => navigation.navigate('RoommateDetail', { id: member.id })}><SafeImage uri={member.avatar} label={member.name} style={styles.avatar} /><View><Text style={styles.personName}>{member.name}</Text><Text style={styles.personMeta}>{member.job}</Text><Text style={styles.personMeta}>{member.compatibility}% совпадение</Text></View><View style={styles.online} /></TouchableOpacity>)}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Messages')}><Text style={styles.secondaryText}>Написать</Text><MessageCircle size={18} color={COLORS.text} /></TouchableOpacity>
        <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('OnlineDeal', { id: property.id })}><Text style={styles.primaryText}>Подать заявку</Text></TouchableOpacity>
      </View>
    </ScreenTransition>
  );
};

function RoundButton({ children, label, onPress }: { children: React.ReactNode; label: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityLabel={label} style={styles.roundButton} onPress={onPress}>{children}</TouchableOpacity>;
}

function Fact({ icon, value }: { icon: string; value: string }) {
  return <View style={styles.fact}><Text style={styles.factIcon}>{icon}</Text><Text style={styles.factText}>{value}</Text></View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.surface },
  content: { backgroundColor: COLORS.surface },
  hero: { height: 330, position: 'relative', backgroundColor: COLORS.surfaceMuted },
  heroImage: { width: '100%', height: '100%' },
  heroControls: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  heroRight: { flexDirection: 'row', gap: 9 },
  roundButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.94)' },
  gallery: { paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  thumb: { width: 86, height: 58, borderRadius: 12 },
  moreThumb: { width: 70, height: 58, borderRadius: 12, backgroundColor: '#3B3733', alignItems: 'center', justifyContent: 'center' },
  moreText: { color: COLORS.textInverted, fontSize: 17, fontWeight: '800' },
  main: { paddingTop: 8 },
  title: { paddingHorizontal: 20, fontSize: 28, lineHeight: 32, fontWeight: '900', letterSpacing: -1, color: COLORS.text },
  price: { paddingHorizontal: 20, marginTop: 13, fontSize: 27, lineHeight: 31, fontWeight: '900', color: COLORS.text },
  priceUnit: { fontSize: 15, fontWeight: '500' },
  addressRow: { paddingHorizontal: 20, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { flex: 1, fontSize: 13, color: COLORS.textMuted },
  walk: { fontSize: 12, color: COLORS.textMuted },
  lime: { color: COLORS.accentBorder },
  facts: { marginTop: 20, paddingHorizontal: 20, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  factIcon: { fontSize: 19, color: COLORS.text },
  factText: { fontSize: 10.5, color: COLORS.text },
  tags: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  tag: { minHeight: 38, paddingHorizontal: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.accentSoft },
  tagIcon: { color: COLORS.accentBorder, fontSize: 13 },
  tagText: { fontSize: 11.5, color: COLORS.text },
  section: { paddingHorizontal: 20, paddingTop: 27 },
  sectionTitle: { fontSize: 20, lineHeight: 24, fontWeight: '900', letterSpacing: -0.4, color: COLORS.text },
  body: { marginTop: 12, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  amenities: { marginTop: 13, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: { minHeight: 42, width: '48%', paddingHorizontal: 12, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.background },
  amenityText: { flex: 1, fontSize: 11.5, color: COLORS.text },
  sectionHeader: { marginTop: 27, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allNeighbors: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 2 },
  allNeighborsText: { fontSize: 13, color: COLORS.accentBorder },
  people: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 9 },
  person: { width: 158, minHeight: 72, padding: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  personName: { maxWidth: 80, fontSize: 12, fontWeight: '800', color: COLORS.text },
  personMeta: { maxWidth: 80, marginTop: 1, fontSize: 9.5, color: COLORS.textMuted },
  online: { position: 'absolute', left: 40, bottom: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accentBorder, borderWidth: 2, borderColor: COLORS.surface },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', gap: 9, backgroundColor: COLORS.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  secondary: { flex: 0.9, minHeight: 52, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  primary: { flex: 1.15, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  primaryText: { fontSize: 14, fontWeight: '900', color: COLORS.text },
});
