import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Briefcase, CalendarDays, CheckCircle2, Clock3, Heart, MessageSquare, Moon, ShieldCheck, Sparkles, UserPlus, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeImage } from '../components/SafeImage';
import { ScreenTransition } from '../components/ScreenTransition';
import { useGlobalState } from '../data/stateStore';
import { AppNavigation, IdRoute } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { route: IdRoute; navigation: AppNavigation }

export const RoommateDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { roommates, group, inviteRoommate, toggleFavoriteRoommate } = useGlobalState();
  const roommate = roommates.find((item) => item.id === route.params?.id) ?? roommates[0];
  const isMember = group.members.some((item) => item.id === roommate.id);

  const invite = () => {
    if (!isMember) inviteRoommate(roommate.id);
    navigation.navigate('Group');
  };

  return (
    <ScreenTransition style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}>
        <View style={styles.hero}>
          <SafeImage uri={roommate.image} label={roommate.name} style={styles.heroImage} />
          <View style={[styles.heroControls, { top: Math.max(insets.top, 12) + 4 }]}>
            <TouchableOpacity accessibilityLabel="Назад" style={styles.round} onPress={navigation.goBack}><ArrowLeft size={22} color={COLORS.text} /></TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Избранное" style={styles.round} onPress={() => toggleFavoriteRoommate(roommate.id)}><Heart size={21} color={COLORS.text} fill={roommate.isFavorite ? COLORS.accent : 'transparent'} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.identityRow}>
            <View style={styles.identityCopy}>
              <View style={styles.nameRow}><Text style={styles.name}>{roommate.name}, {roommate.age}</Text><ShieldCheck size={18} color={COLORS.accentBorder} /><Text style={styles.verified}>Проверено</Text></View>
              <Text style={styles.role}>{roommate.job}</Text>
              <Text style={styles.district}>{roommate.district}, Краснодар</Text>
            </View>
            <View style={styles.score}><Text style={styles.scoreValue}>{roommate.compatibility}<Text style={styles.scorePercent}>%</Text></Text><Text style={styles.scoreLabel}>совместимость</Text></View>
          </View>

          <View style={styles.quickFacts}>
            <QuickFact icon={Wallet} label="Бюджет" value={`до ${roommate.budget.toLocaleString('ru-RU')} ₽/мес.`} />
            <QuickFact icon={CalendarDays} label="Заезд" value="с 1 августа" />
            <QuickFact icon={Clock3} label="График" value={roommate.workStyle ?? 'Учёба 5/2'} />
          </View>

          <Section title="О себе">
            <Text style={styles.body}>{roommate.bio} Спокойно отношусь к личному пространству, люблю порядок и заранее договариваться о бытовых вопросах.</Text>
          </Section>

          <Section title="Предпочтения">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {[roommate.petsHabit ?? 'Без животных', roommate.smokingHabit ?? 'Не курю', 'Тишина вечером', 'Гости редко'].map((item) => <View key={item} style={styles.chip}><Text style={styles.chipText}>{item}</Text></View>)}
            </ScrollView>
          </Section>

          <Section title="Образ жизни и привычки">
            <View style={styles.habits}>
              <Habit icon={Sparkles} title="Чистоплотность" value="Высокая" />
              <Habit icon={Moon} title="Режим сна" value={roommate.sleepHabit ?? '23:00–7:00'} />
              <Habit icon={Briefcase} title="Рабочая атмосфера" value="Предпочитаю" />
              <Habit icon={CheckCircle2} title="Алкоголь" value="Иногда" />
            </View>
          </Section>

          <Section title="Совместимость по критериям">
            <View style={styles.breakdown}>
              {([['Образ жизни', 95], ['Чистота и порядок', 98], ['Общение', 92], ['Интересы', 90]] as const).map(([label, value]) => <View key={label} style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><View style={styles.track}><View style={[styles.fill, { width: `${value}%` }]} /></View><Text style={styles.metricValue}>{value}%</Text></View>)}
            </View>
          </Section>

          <Section title="Отзывы от соседей">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviews}>
              {roommates.slice(0, 3).map((person, index) => <View key={person.id} style={styles.review}><View style={styles.reviewHead}><SafeImage uri={person.image} label={person.name} style={styles.reviewAvatar} /><Text style={styles.reviewName}>{person.name}</Text><Text style={styles.reviewRating}>★ {index === 2 ? '4.8' : '5.0'}</Text></View><Text style={styles.reviewText}>{index === 0 ? 'Уважает пространство и договорённости.' : index === 1 ? 'Аккуратная и приятная в общении.' : 'Лёгкая на подъём, дома спокойно.'}</Text></View>)}
            </ScrollView>
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.message} onPress={() => navigation.navigate('Messages')}><MessageSquare size={18} color={COLORS.text} /><Text style={styles.messageText}>Написать</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.invite, isMember && styles.inviteMuted]} onPress={invite}>{isMember ? <CheckCircle2 size={18} color={COLORS.text} /> : <UserPlus size={18} color={COLORS.text} />}<Text style={styles.inviteText}>{isMember ? 'Открыть группу' : 'Пригласить в группу'}</Text></TouchableOpacity>
      </View>
    </ScreenTransition>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function QuickFact({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  return <View style={styles.quickFact}><Icon size={18} color={COLORS.text} /><View><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickValue} numberOfLines={2}>{value}</Text></View></View>;
}

function Habit({ icon: Icon, title, value }: { icon: React.ComponentType<{ size?: number; color?: string }>; title: string; value: string }) {
  return <View style={styles.habit}><Icon size={24} color={COLORS.accentBorder} /><Text style={styles.habitTitle}>{title}</Text><Text style={styles.habitValue} numberOfLines={2}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.surface },
  hero: { height: 320, position: 'relative', backgroundColor: COLORS.surfaceMuted },
  heroImage: { width: '100%', height: '100%' },
  heroControls: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  round: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  sheet: { paddingTop: 18, backgroundColor: COLORS.surface },
  identityRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  identityCopy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  name: { fontSize: 27, lineHeight: 31, fontWeight: '900', letterSpacing: -0.9, color: COLORS.text },
  verified: { fontSize: 10.5, color: COLORS.accentBorder },
  role: { marginTop: 7, fontSize: 14, color: COLORS.text },
  district: { marginTop: 3, fontSize: 13, color: COLORS.textMuted },
  score: { alignItems: 'flex-end' },
  scoreValue: { fontSize: 43, lineHeight: 45, fontWeight: '900', letterSpacing: -2, color: COLORS.accentBorder },
  scorePercent: { fontSize: 22 },
  scoreLabel: { fontSize: 9.5, color: COLORS.accentBorder, textTransform: 'uppercase' },
  quickFacts: { marginHorizontal: 20, marginTop: 20, minHeight: 72, paddingVertical: 12, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border },
  quickFact: { flex: 1, paddingHorizontal: 8, flexDirection: 'row', gap: 7, alignItems: 'flex-start', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: COLORS.border },
  quickLabel: { fontSize: 10, color: COLORS.textMuted },
  quickValue: { maxWidth: 82, marginTop: 2, fontSize: 10.5, lineHeight: 14, fontWeight: '700', color: COLORS.text },
  section: { paddingHorizontal: 20, paddingTop: 25 },
  sectionTitle: { marginBottom: 12, fontSize: 19, lineHeight: 23, fontWeight: '900', letterSpacing: -0.35, color: COLORS.text },
  body: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  chips: { gap: 8 },
  chip: { minHeight: 36, paddingHorizontal: 13, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 11.5, color: COLORS.text },
  habits: { flexDirection: 'row', gap: 8 },
  habit: { flex: 1, minHeight: 128, padding: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  habitTitle: { marginTop: 9, fontSize: 9.5, lineHeight: 12, textAlign: 'center', color: COLORS.text },
  habitValue: { marginTop: 4, fontSize: 9.5, lineHeight: 12, textAlign: 'center', color: COLORS.textMuted },
  breakdown: { gap: 11 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { width: 112, fontSize: 10.5, color: COLORS.textSecondary },
  track: { flex: 1, height: 3, backgroundColor: COLORS.border },
  fill: { height: 3, backgroundColor: COLORS.accentBorder },
  metricValue: { width: 31, fontSize: 10.5, textAlign: 'right', color: COLORS.text },
  reviews: { gap: 8, paddingBottom: 4 },
  review: { width: 205, minHeight: 112, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reviewAvatar: { width: 28, height: 28, borderRadius: 14 },
  reviewName: { flex: 1, fontSize: 11, fontWeight: '800', color: COLORS.text },
  reviewRating: { fontSize: 10, color: COLORS.accentBorder },
  reviewText: { marginTop: 9, fontSize: 11, lineHeight: 15, color: COLORS.textSecondary },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', gap: 9, backgroundColor: COLORS.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  message: { flex: 0.86, minHeight: 52, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  messageText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  invite: { flex: 1.2, minHeight: 52, borderRadius: 18, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  inviteMuted: { backgroundColor: COLORS.accentSoft },
  inviteText: { fontSize: 13.5, fontWeight: '900', color: COLORS.text },
});
