import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Building2,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Phone,
  ExternalLink,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { CompatibilityBadge } from '../components/CompatibilityBadge';
import { useGlobalState } from '../data/stateStore';

interface HousingDetailScreenProps {
  route: any;
  navigation: any;
}

export const HousingDetailScreen: React.FC<HousingDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { properties, group, submitGroupApplication } = useGlobalState();
  const propertyId = route.params?.id || 'center-loft';
  const property = properties.find((p) => p.id === propertyId) || properties[0];
  const pricePerPerson = Math.round(property.price / 2);
  const isSubmitted = group.status === 'under_review';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle} numberOfLines={1}>
          {property.district}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Photo Banner */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: property.image }} style={styles.image} />
          <View style={styles.matchBadgePos}>
            <CompatibilityBadge score={property.match} size="lg" />
          </View>
        </View>

        {/* Header Details */}
        <View style={styles.section}>
          <Text style={styles.titleText}>{property.title}</Text>

          <View style={styles.addressRow}>
            <MapPin size={16} color={COLORS.textMuted} />
            <Text style={styles.addressText}>{property.address}</Text>
          </View>

          {/* Pricing Card */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Общая аренда</Text>
              <Text style={styles.priceValue}>
                {property.price.toLocaleString('ru-RU')} ₽ / мес
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View>
              <Text style={styles.priceLabel}>На человека (для 2)</Text>
              <Text style={styles.priceValueAccent}>
                {pricePerPerson.toLocaleString('ru-RU')} ₽ / мес
              </Text>
            </View>
          </View>

          {/* Key Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Building2 size={18} color={COLORS.textMuted} />
              <Text style={styles.statLabel}>Комнаты</Text>
              <Text style={styles.statVal}>{property.rooms}-комнатная</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Площадь</Text>
              <Text style={styles.statVal}>{property.area} м²</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Этаж</Text>
              <Text style={styles.statVal}>{property.floor}</Text>
            </View>
          </View>
        </View>

        {/* Group Fit Card */}
        <View style={styles.fitCard}>
          <View style={styles.fitHeader}>
            <Sparkles size={20} color={COLORS.text} />
            <Text style={styles.fitTitle}>Совместимость вашей группы: {property.match}%</Text>
          </View>
          <Text style={styles.fitSub}>
            Бюджет группы (53 000 ₽) полностью покрывает аренду объекта. Район совпадает с предпочтениями Марии и Артёма.
          </Text>
        </View>

        {/* Description & Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание объекта</Text>
          <Text style={styles.descriptionText}>{property.description}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Удобства и оснащение</Text>
          <View style={styles.amenitiesList}>
            {property.amenities?.map((item, idx) => (
              <View key={idx} style={styles.amenityRow}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Landlord Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Собственник</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>СБ</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{property.ownerName}</Text>
              <Text style={styles.ownerSub}>Проверен через Госуслуги / ЦИАН</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatLandlordBtn}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.8}
        >
          <MessageSquare size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyGroupBtn, isSubmitted && { backgroundColor: COLORS.surfaceMuted, borderWidth: 1, borderColor: COLORS.border }]}
          onPress={() => {
            if (!isSubmitted) {
              submitGroupApplication();
            }
            navigation.navigate('Group');
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.applyGroupBtnText, isSubmitted && { color: COLORS.textMuted }]}>
            {isSubmitted ? 'Заявка отправлена' : 'Подать заявку от группы'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  matchBadgePos: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  priceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  priceValueAccent: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  priceDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.borderLight,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  fitCard: {
    backgroundColor: COLORS.surfaceCard,
    margin: 20,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    ...SHADOWS.glow,
  },
  fitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  fitSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  amenitiesList: {
    gap: 10,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amenityText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  ownerSub: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    ...SHADOWS.card,
  },
  chatLandlordBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  applyGroupBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyGroupBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
});
