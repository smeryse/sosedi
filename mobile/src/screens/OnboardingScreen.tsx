import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { ArrowRight, Sparkles, Users, Home, ShieldCheck, Check } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const SLIDES = [
  {
    id: 1,
    title: 'Идеальные соседи по алгоритму совместимости',
    subtitle: 'Пройдите анкету из 20 вопросов. Умный алгоритм подберёт сожителей с похожим графиком сна, отношением к уборке и гостям.',
    tag: 'Анализ привычек',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 2,
    title: 'Выгоднее на 30–50%: Совместная аренда',
    subtitle: 'Объединяйтесь в группы до 3 человек и подавайте коллективные заявки на проверенные квартиры в Краснодаре напрямую ЦИАН.',
    tag: 'Экономия и безопасность',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 3,
    title: 'Прозрачный сплит расходов и график уборки',
    subtitle: 'Делите счета за аренду и коммунальные услуги в один клик. Автоматический график дежурств избавит от бытовых споров.',
    tag: 'Удобный быт',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>С</Text>
          </View>
          <Text style={styles.brandName}>Соседи</Text>
          <View style={styles.greenDot} />
        </View>

        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Пропустить</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View style={styles.slideCardContainer}>
        <View style={styles.imageBox}>
          <Image source={{ uri: currentSlide.image }} style={styles.slideImg} />
          <View style={styles.tagBadge}>
            <IconComponent size={14} color={COLORS.text} />
            <Text style={styles.tagText}>{currentSlide.tag}</Text>
          </View>
        </View>

        <View style={styles.textBox}>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideSub}>{currentSlide.subtitle}</Text>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Начать использование' : 'Далее'}
          </Text>
          <ArrowRight size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  slideCardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  imageBox: {
    width: '100%',
    height: 260,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  slideImg: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  textBox: {
    marginTop: 24,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 32,
  },
  slideSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.accent,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.border,
  },
  nextBtn: {
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.glow,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
