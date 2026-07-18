import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Camera, Building2, ChevronRight } from 'lucide-react-native';
import { Property } from '../types';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { CompatibilityBadge } from './CompatibilityBadge';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const pricePerPerson = Math.round(property.price / 2);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.image }} style={styles.image} />
        
        <View style={styles.photoBadge}>
          <Camera size={12} color={COLORS.textInverted} />
          <Text style={styles.photoCountText}>{property.photosCount}</Text>
        </View>

        <View style={styles.matchBadgePos}>
          <CompatibilityBadge score={property.match} size="sm" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            {property.price.toLocaleString('ru-RU')} ₽ / мес
          </Text>
          <Text style={styles.perPersonText}>
            ({pricePerPerson.toLocaleString('ru-RU')} ₽/чел)
          </Text>
        </View>

        <Text style={styles.titleText} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.addressRow}>
          <MapPin size={14} color={COLORS.textMuted} />
          <Text style={styles.addressText} numberOfLines={1}>
            {property.address}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Building2 size={13} color={COLORS.textMuted} />
            <Text style={styles.statText}>{property.floor} этаж</Text>
          </View>
          <View style={styles.statDot} />
          <Text style={styles.statText}>{property.area} м²</Text>
          <View style={styles.statDot} />
          <Text style={styles.statText}>{property.rooms}-комн.</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {property.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.fitText}>Group Fit: {property.match}% подходит</Text>
          <ChevronRight size={18} color={COLORS.text} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(17, 18, 15, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoCountText: {
    fontSize: 11,
    color: COLORS.textInverted,
    fontWeight: '600',
  },
  matchBadgePos: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  content: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  perPersonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagPill: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  fitText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});
