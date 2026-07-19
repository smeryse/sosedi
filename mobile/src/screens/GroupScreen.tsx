import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarCheck, Check, ChevronRight, CircleDollarSign, FileText, MessageCircle, Plus, RefreshCw, Settings, Sparkles, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { mockProperties } from '../data/mockData';
import { useGlobalState } from '../data/stateStore';
import { AppNavigation } from '../types/navigation';
import { COLORS } from '../theme/colors';

interface Props { navigation: AppNavigation }

export const GroupScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { group, submitGroupApplication } = useGlobalState();
  const property = mockProperties[0];
  const submitted = group.status === 'under_review' || group.status === 'application_sent';

  const openApplication = () => {
    if (!submitted) submitGroupApplication();
    navigation.navigate('Applications');
  };

  return (
    <ScreenTransition style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <View><Text style={styles.eyebrow}>СОВМЕСТНАЯ АРЕНДА</Text><Text style={styles.title}>Наша группа.</Text></View>
        <TouchableOpacity accessibilityLabel="Настройки группы" style={styles.settings} onPress={() => navigation.navigate('Settings')}><Settings size={21} color={COLORS.text} /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 116 + insets.bottom }]}>
        <View style={styles.summary}>
          <View style={styles.summaryTop}><View><Text style={styles.summaryLabel}>{submitted ? 'ЗАЯВКА ОТПРАВЛЕНА' : 'ГРУППА ГОТОВА'}</Text><Text style={styles.groupName}>{group.name}</Text></View><View style={styles.score}><Text style={styles.scoreValue}>{group.compatibilityScore}%</Text><Text style={styles.scoreLabel}>совпадение</Text></View></View>
          <View style={styles.summaryBottom}><View style={styles.avatarStack}>{group.members.map((member, index) => <SafeImage key={member.id} uri={member.avatar} label={member.name} style={[styles.stackAvatar, { marginLeft: index === 0 ? 0 : -10, zIndex: group.members.length - index }]} />)}<TouchableOpacity accessibilityLabel="Пригласить участника" style={styles.stackAdd} onPress={() => navigation.navigate('Roommates')}><Plus size={16} color={COLORS.text} /></TouchableOpacity></View><Text style={styles.summaryMeta}>{group.members.length} участника · {group.currentTotalBudget.toLocaleString('ru-RU')} ₽</Text></View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: submitted ? '100%' : '68%' }]} /></View>
          <View style={styles.steps}>
            <Step label="Группа" state="done" />
            <Step label="Проверка" state="done" />
            <Step label="Заявка" state={submitted ? 'done' : 'current'} />
          </View>
        </View>

        <SectionHeader title="Выбранное жильё" action="Сменить" onPress={() => navigation.navigate('Housing')} />
        <TouchableOpacity style={styles.property} onPress={() => navigation.navigate('HousingDetail', { id: property.id })} activeOpacity={0.9}>
          <SafeImage uri={property.image} label={property.title} style={styles.propertyImage} />
          <View style={styles.propertyBody}><Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text><Text style={styles.propertyPrice}>{property.price.toLocaleString('ru-RU')} ₽ / мес.</Text><View style={styles.fit}><Sparkles size={12} color={COLORS.text} /><Text style={styles.fitText}>{property.match}% для группы</Text></View></View>
          <ChevronRight size={19} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Всё для совместной жизни</Text>
        <View style={styles.tools}>
          <Tool icon={<CircleDollarSign size={23} color={COLORS.text} />} title="Бюджет" sub="90 000 ₽ собрано" accent onPress={() => navigation.navigate('Budget')} />
          <Tool icon={<CalendarCheck size={23} color={COLORS.text} />} title="Дела" sub="2 задачи сегодня" onPress={() => navigation.navigate('Chores')} />
          <Tool icon={<MessageCircle size={23} color={COLORS.text} />} title="Чат" sub="3 новых сообщения" onPress={() => navigation.navigate('Messages')} />
          <Tool icon={<FileText size={23} color={COLORS.text} />} title="Документы" sub="Договор и файлы" onPress={() => navigation.navigate('Documents')} />
        </View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Участники</Text><TouchableOpacity onPress={() => navigation.navigate('Roommates')}><Text style={styles.invite}>+ Пригласить</Text></TouchableOpacity></View>
        {group.members.map((member, index) => <AnimatedListItem key={member.id} index={index}><TouchableOpacity style={styles.member} onPress={() => navigation.navigate('RoommateDetail', { id: member.id })} activeOpacity={0.85}><SafeImage uri={member.avatar} label={member.name} style={styles.memberAvatar} /><View style={styles.memberCopy}><View style={styles.memberNameRow}><Text style={styles.memberName}>{member.name}</Text>{index === 0 ? <View style={styles.owner}><Text style={styles.ownerText}>организатор</Text></View> : null}</View><Text style={styles.memberJob}>{member.job}</Text></View><View style={styles.memberScore}><Text style={styles.memberScoreValue}>{member.compatibility}%</Text><Text style={styles.memberScoreLabel}>match</Text></View></TouchableOpacity></AnimatedListItem>)}

        <View style={styles.manage}>
          <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate('GroupCreate')}><Plus size={17} color={COLORS.text} /><Text style={styles.manageText}>Новая группа</Text></TouchableOpacity>
          <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate('GroupReplacement')}><RefreshCw size={17} color={COLORS.text} /><Text style={styles.manageText}>Найти замену</Text></TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 12) }]}><TouchableOpacity style={styles.applicationButton} onPress={openApplication} activeOpacity={0.85}><Text style={styles.applicationText}>{submitted ? 'Открыть заявку' : 'Отправить общую заявку'}</Text><ChevronRight size={20} color={COLORS.text} /></TouchableOpacity></View>
    </ScreenTransition>
  );
};

function Step({ label, state }: { label: string; state: 'done' | 'current' }) {
  return <View style={styles.step}><View style={[styles.stepDot, state === 'current' && styles.stepDotCurrent]}>{state === 'done' ? <Check size={12} strokeWidth={3} color={COLORS.text} /> : <View style={styles.stepDotInner} />}</View><Text style={[styles.stepLabel, state === 'current' && styles.stepLabelCurrent]}>{label}</Text></View>;
}

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return <View style={styles.sectionHead}><Text style={styles.sectionTitle}>{title}</Text><TouchableOpacity onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity></View>;
}

function Tool({ icon, title, sub, accent, onPress }: { icon: React.ReactNode; title: string; sub: string; accent?: boolean; onPress: () => void }) {
  return <TouchableOpacity style={[styles.tool, accent && styles.toolAccent]} onPress={onPress} activeOpacity={0.85}><View style={styles.toolTop}><View style={[styles.toolIcon, accent && styles.toolIconAccent]}>{icon}</View><ChevronRight size={17} color={COLORS.textMuted} /></View><Text style={styles.toolTitle}>{title}</Text><Text style={styles.toolSub}>{sub}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  header: { minHeight: 92, paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: COLORS.surface },
  eyebrow: { marginBottom: 3, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: COLORS.textMuted },
  title: { fontSize: 29, lineHeight: 32, fontWeight: '900', letterSpacing: -1.1, color: COLORS.text },
  settings: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  content: { paddingHorizontal: 16, paddingTop: 13 },
  summary: { padding: 18, borderRadius: 22, backgroundColor: COLORS.accent },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.2, color: COLORS.text },
  groupName: { maxWidth: 230, marginTop: 6, fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.6, color: COLORS.text },
  score: { width: 65, height: 65, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  scoreValue: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  scoreLabel: { marginTop: -1, fontSize: 8, color: COLORS.textMuted },
  summaryBottom: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 37, height: 37, borderRadius: 19, borderWidth: 2, borderColor: COLORS.accent },
  stackAdd: { width: 37, height: 37, marginLeft: -8, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.accent },
  summaryMeta: { fontSize: 11, fontWeight: '800', color: COLORS.text },
  progressCard: { marginTop: 11, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  progressTrack: { height: 4, marginHorizontal: 30, borderRadius: 2, backgroundColor: COLORS.surfaceMuted, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.accentBorder },
  steps: { marginTop: -9, flexDirection: 'row', justifyContent: 'space-between' },
  step: { width: 76, alignItems: 'center' },
  stepDot: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  stepDotCurrent: { backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.accentBorder },
  stepDotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accentBorder },
  stepLabel: { marginTop: 6, fontSize: 9.5, fontWeight: '800', color: COLORS.textMuted },
  stepLabelCurrent: { color: COLORS.text },
  sectionHead: { marginTop: 24, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3, color: COLORS.text },
  sectionAction: { fontSize: 12, fontWeight: '800', color: COLORS.accentBorder },
  property: { minHeight: 104, padding: 10, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  propertyImage: { width: 88, height: 82, borderRadius: 14 },
  propertyBody: { flex: 1 },
  propertyTitle: { fontSize: 12.5, lineHeight: 16, fontWeight: '800', color: COLORS.text },
  propertyPrice: { marginTop: 5, fontSize: 12.5, fontWeight: '900', color: COLORS.text },
  fit: { alignSelf: 'flex-start', marginTop: 7, paddingHorizontal: 7, minHeight: 23, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.accentSoft },
  fitText: { fontSize: 9.5, fontWeight: '800', color: COLORS.text },
  tools: { marginTop: 11, marginBottom: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { width: '48.4%', minHeight: 132, padding: 14, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  toolAccent: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accentBorder },
  toolTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  toolIconAccent: { backgroundColor: COLORS.accent },
  toolTitle: { marginTop: 13, fontSize: 15, fontWeight: '900', color: COLORS.text },
  toolSub: { marginTop: 4, fontSize: 10.5, lineHeight: 14, color: COLORS.textMuted },
  invite: { fontSize: 12, fontWeight: '900', color: COLORS.accentBorder },
  member: { minHeight: 70, marginBottom: 9, padding: 10, borderRadius: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  memberAvatar: { width: 49, height: 49, borderRadius: 25 },
  memberCopy: { flex: 1, marginLeft: 11 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  memberName: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  owner: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7, backgroundColor: COLORS.accentSoft },
  ownerText: { fontSize: 8.5, fontWeight: '800', color: COLORS.text },
  memberJob: { marginTop: 4, fontSize: 11, color: COLORS.textMuted },
  memberScore: { minWidth: 45, alignItems: 'center' },
  memberScoreValue: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  memberScoreLabel: { fontSize: 8.5, color: COLORS.textMuted },
  manage: { marginTop: 12, flexDirection: 'row', gap: 9 },
  manageButton: { flex: 1, minHeight: 47, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  manageText: { fontSize: 11.5, fontWeight: '800', color: COLORS.text },
  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  applicationButton: { minHeight: 55, paddingHorizontal: 19, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.accent },
  applicationText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
});
