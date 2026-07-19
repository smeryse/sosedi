import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenTransition, AnimatedListItem } from '../components/ScreenTransition';
import { SafeImage } from '../components/SafeImage';
import { useGlobalState } from '../data/stateStore';
import { AppNavigation, IdRoute } from '../types/navigation';

type Props = { navigation: AppNavigation; route?: IdRoute };

const statusMeta = {
  draft: ['Черновик', COLORS.surfaceMuted],
  sent: ['Отправлена', COLORS.accentSoft],
  viewing: ['Выберите просмотр', '#FFF3D6'],
  approved: ['Одобрена', COLORS.successSoft],
  declined: ['Отклонена', COLORS.dangerSoft],
} as const;

export function ApplicationsScreen({ navigation }: Props) {
  const { applications, properties } = useGlobalState();
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Мои заявки" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}><Text style={styles.eyebrow}>ПРОЦЕСС АРЕНДЫ</Text><Text style={styles.title}>Все заявки под рукой</Text><Text style={styles.subtitle}>Ответы собственников, просмотры и решения группы.</Text></View>
          <TouchableOpacity style={styles.roundAction} onPress={() => navigation.navigate('Housing')}><Plus size={21} color={COLORS.text} /></TouchableOpacity>
        </View>
        {applications.map((application, index) => {
          const property = properties.find((item) => item.id === application.propertyId) ?? properties[0];
          const [label, backgroundColor] = statusMeta[application.status];
          return (
            <AnimatedListItem key={application.id} index={index}>
              <TouchableOpacity style={styles.applicationCard} onPress={() => navigation.navigate('ApplicationDetail', { id: application.id })} activeOpacity={0.88}>
                <SafeImage uri={property.image} label={property.title} style={styles.applicationImage} />
                <View style={{ flex: 1 }}>
                  <View style={[styles.statusPill, { backgroundColor }]}><Text style={styles.statusPillText}>{label}</Text></View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{property.title}</Text>
                  <Text style={styles.cardMeta}>{application.groupName} · {application.sentAt}</Text>
                  <Text style={styles.cardPrice}>{property.price.toLocaleString('ru-RU')} ₽ / мес</Text>
                </View>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </AnimatedListItem>
          );
        })}
        <TouchableOpacity style={styles.tipCard} onPress={() => navigation.navigate('Recommendations')}>
          <Sparkles size={20} color={COLORS.text} />
          <View style={{ flex: 1 }}><Text style={styles.tipTitle}>Нужен запасной вариант?</Text><Text style={styles.tipText}>Мы подобрали ещё несколько квартир для вашей группы.</Text></View>
          <ArrowRight size={18} color={COLORS.text} />
        </TouchableOpacity>
      </ScrollView>
    </ScreenTransition>
  );
}

export function ApplicationDetailScreen({ navigation, route }: Props) {
  const { applications, properties, chooseViewing } = useGlobalState();
  const application = applications.find((item) => item.id === route?.params?.id) ?? applications[0];
  const property = properties.find((item) => item.id === application?.propertyId) ?? properties[0];
  const [slot, setSlot] = useState(application?.viewingSlot ?? '');
  const selectSlot = (value: string) => { setSlot(value); chooseViewing(application.id, value); };
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title={`Заявка #${application.id}`} subtitle={application.groupName} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.propertyStrip}><SafeImage uri={property.image} label={property.title} style={styles.stripImage} /><View style={{ flex: 1 }}><Text style={styles.cardTitle} numberOfLines={2}>{property.title}</Text><Text style={styles.cardMeta}>{property.address}</Text></View></View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Статус заявки</Text>
          {[['Заявка отправлена', true], ['Собственник ответил', true], ['Выберите время просмотра', Boolean(slot)], ['Решение по заявке', false]].map(([label, done], index) => (
            <View key={String(label)} style={styles.timelineRow}>
              <View style={[styles.timelineDot, done && styles.timelineDone]}>{done ? <Check size={14} color={COLORS.text} /> : <Clock3 size={14} color={COLORS.textMuted} />}</View>
              <View style={{ flex: 1 }}><Text style={[styles.timelineTitle, !done && { color: COLORS.textMuted }]}>{label}</Text><Text style={styles.cardMeta}>{index < 2 ? '12 мая · завершено' : index === 2 ? 'Ждём вашего ответа' : 'После просмотра'}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Выберите просмотр</Text>
          <Text style={styles.subtitle}>Все участники группы получат уведомление.</Text>
          {['Четверг, 16 мая · 18:30', 'Пятница, 17 мая · 19:00'].map((value) => (
            <TouchableOpacity key={value} style={[styles.optionRow, slot === value && styles.optionSelected]} onPress={() => selectSlot(value)}>
              <CalendarDays size={19} color={COLORS.text} /><Text style={styles.optionText}>{value}</Text><View style={[styles.radio, slot === value && styles.radioSelected]}>{slot === value ? <Check size={11} color={COLORS.text} /> : null}</View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Messages')}><MessageCircle size={18} color={COLORS.text} /><Text style={styles.secondaryButtonText}>Ответить собственнику</Text></TouchableOpacity>
      </ScrollView>
    </ScreenTransition>
  );
}

export function RecommendationsScreen({ navigation }: Props) {
  const { roommates, properties } = useGlobalState();
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Рекомендации" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.recommendHero}><Sparkles size={23} color={COLORS.text} /><Text style={styles.recommendScore}>96%</Text><Text style={styles.recommendTitle}>Подборка стала точнее</Text><Text style={styles.recommendText}>Учли вашу анкету, бюджет и текущую группу.</Text></View>
        <Text style={styles.sectionTitle}>Соседи</Text>
        {roommates.slice(0, 3).map((person, index) => <AnimatedListItem key={person.id} index={index}><TouchableOpacity style={styles.personRow} onPress={() => navigation.navigate('RoommateDetail', { id: person.id })}><SafeImage uri={person.image} label={person.name} style={styles.personAvatar} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{person.name}, {person.age}</Text><Text style={styles.cardMeta}>{person.job} · {person.district}</Text></View><Text style={styles.scoreText}>{person.compatibility}%</Text><ChevronRight size={17} color={COLORS.textMuted} /></TouchableOpacity></AnimatedListItem>)}
        <TouchableOpacity style={styles.compareButton} onPress={() => navigation.navigate('RoommateCompare')}><Users size={18} color={COLORS.text} /><Text style={styles.compareText}>Сравнить кандидатов</Text><ArrowRight size={17} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.sectionTitle}>Жильё для группы</Text>
        {properties.slice(0, 2).map((property, index) => <AnimatedListItem key={property.id} index={index}><TouchableOpacity style={styles.propertyStrip} onPress={() => navigation.navigate('HousingDetail', { id: property.id })}><SafeImage uri={property.image} label={property.title} style={styles.stripImage} /><View style={{ flex: 1 }}><Text style={styles.cardTitle} numberOfLines={2}>{property.title}</Text><Text style={styles.cardPrice}>{property.price.toLocaleString('ru-RU')} ₽ · {property.match}% группе</Text></View><ChevronRight size={18} color={COLORS.textMuted} /></TouchableOpacity></AnimatedListItem>)}
      </ScrollView>
    </ScreenTransition>
  );
}

export function RoommateCompareScreen({ navigation }: Props) {
  const { roommates } = useGlobalState();
  const candidates = roommates.slice(0, 3);
  const dimensions = ['Совместимость', 'Бюджет', 'Режим дня', 'Чистота', 'Общение'];
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Сравнение" subtitle="3 кандидата" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {candidates.map((person) => <TouchableOpacity key={person.id} style={styles.comparePerson} onPress={() => navigation.navigate('RoommateDetail', { id: person.id })}><SafeImage uri={person.image} label={person.name} style={styles.compareAvatar} /><Text style={styles.compareName}>{person.name}</Text><Text style={styles.scoreText}>{person.compatibility}%</Text></TouchableOpacity>)}
        </ScrollView>
        <View style={styles.compareTable}>
          {dimensions.map((label, row) => <View key={label} style={styles.compareTableRow}><Text style={styles.compareLabel}>{label}</Text><View style={styles.compareValues}>{candidates.map((person, index) => <Text key={person.id} style={styles.compareValue}>{row === 0 ? `${person.compatibility}%` : row === 1 ? `${Math.round(person.budget / 1000)}k` : `${Math.max(82, person.compatibility - row - index)}%`}</Text>)}</View></View>)}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('GroupCreate')}><Text style={styles.primaryText}>Собрать группу</Text><ArrowRight size={18} color={COLORS.text} /></TouchableOpacity>
      </ScrollView>
    </ScreenTransition>
  );
}

export function GroupCreateScreen({ navigation }: Props) {
  const { createGroup } = useGlobalState();
  const [name, setName] = useState('Квартира в центре');
  const [budget, setBudget] = useState('90000');
  const [date, setDate] = useState('15 августа 2026');
  const submit = () => { createGroup(name.trim() || 'Моя группа', Number(budget) || 90000, date); navigation.replace('Group'); };
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Создать группу" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Сначала договоримся о главном</Text><Text style={styles.subtitle}>Название, общий бюджет и дата переезда будут видны приглашённым.</Text>
        <View style={styles.formPanel}>
          <Field label="Название группы" value={name} onChangeText={setName} placeholder="Например, Центр 2026" />
          <Field label="Общий бюджет, ₽" value={budget} onChangeText={setBudget} placeholder="90000" keyboardType="number-pad" />
          <Field label="Дата переезда" value={date} onChangeText={setDate} placeholder="15 августа 2026" />
        </View>
        <View style={styles.tipCard}><Users size={20} color={COLORS.text} /><View style={{ flex: 1 }}><Text style={styles.tipTitle}>До четырёх участников</Text><Text style={styles.tipText}>После создания можно отправить ссылку или выбрать людей из рекомендаций.</Text></View></View>
        <TouchableOpacity style={styles.primaryButton} onPress={submit}><Text style={styles.primaryText}>Создать группу</Text><ArrowRight size={18} color={COLORS.text} /></TouchableOpacity>
      </ScrollView>
    </ScreenTransition>
  );
}

export function GroupReplacementScreen({ navigation }: Props) {
  const { group, roommates, replaceGroupMember } = useGlobalState();
  const member = group.members[group.members.length - 1];
  const candidates = roommates.filter((person) => !group.members.some((item) => item.id === person.id));
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Найти замену" subtitle={`Вместо ${member?.name ?? 'участника'}`} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tipCard}><Sparkles size={20} color={COLORS.text} /><View style={{ flex: 1 }}><Text style={styles.tipTitle}>История группы сохранится</Text><Text style={styles.tipText}>Бюджет, чат и выбранное жильё не изменятся.</Text></View></View>
        {candidates.map((person, index) => <AnimatedListItem key={person.id} index={index}><View style={styles.personRow}><SafeImage uri={person.image} label={person.name} style={styles.personAvatar} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{person.name}, {person.age}</Text><Text style={styles.cardMeta}>{person.job} · {person.compatibility}%</Text></View><TouchableOpacity style={styles.miniPrimary} onPress={() => { replaceGroupMember(member.id, person.id); navigation.replace('Group'); }}><Text style={styles.miniPrimaryText}>Выбрать</Text></TouchableOpacity></View></AnimatedListItem>)}
      </ScrollView>
    </ScreenTransition>
  );
}

export function AssistantScreen({ navigation }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ id: 'hello', from: 'bot', text: 'Привет! Помогу обсудить правила дома, бюджет, договор или конфликт в группе.' }]);
  const send = (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `me-${Date.now()}`, from: 'me', text }, { id: `bot-${Date.now()}`, from: 'bot', text: 'Разложу ситуацию по шагам. Сначала зафиксируйте общий факт, затем предложите два конкретных варианта решения и согласуйте срок.' }]);
    setInput('');
  };
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="AI-помощник" subtitle="Женя · онлайн" onBack={navigation.goBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { gap: 10 }]}>
        <View style={styles.assistantIntro}><View style={styles.botIcon}><Bot size={25} color={COLORS.text} /></View><Text style={styles.recommendTitle}>Женя рядом</Text><Text style={styles.recommendText}>Советы не заменяют договорённости группы, но помогают начать разговор.</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['Составить правила дома', 'Разделить расходы', 'Проверить договор'].map((item) => <TouchableOpacity key={item} style={styles.suggestionChip} onPress={() => send(item)}><Text style={styles.suggestionText}>{item}</Text></TouchableOpacity>)}</ScrollView>
        {messages.map((message) => <View key={message.id} style={[styles.bubble, message.from === 'me' ? styles.myBubble : styles.botBubble]}><Text style={styles.bubbleText}>{message.text}</Text></View>)}
      </ScrollView>
      <View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Напишите вопрос…" placeholderTextColor={COLORS.textMuted} style={styles.composerInput} multiline /><TouchableOpacity style={styles.sendButton} onPress={() => send()}><Send size={18} color={COLORS.text} /></TouchableOpacity></View>
    </ScreenTransition>
  );
}

export function SimulatorScreen({ navigation }: Props) {
  const scenarios = [
    { question: 'Сосед оставил посуду на ночь. Что вы сделаете?', options: ['Спокойно напомню о правиле', 'Уберу сам и промолчу', 'Напишу резкое сообщение'] },
    { question: 'В общий чат пришёл неожиданный счёт. Ваш ход?', options: ['Проверю детали и предложу деление', 'Сразу переведу свою долю', 'Проигнорирую'] },
    { question: 'Гости задержались после тихого часа.', options: ['Обсудим границы на следующий день', 'Потребую уйти немедленно', 'Ничего не скажу'] },
  ];
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const done = step >= scenarios.length;
  const choose = (index: number) => { setScore((current) => current + (index === 0 ? 33 : index === 1 ? 21 : 8)); setStep((current) => current + 1); };
  return (
    <ScreenTransition style={styles.screen}>
      <ScreenHeader title="Симулятор быта" subtitle="3 ситуации" onBack={navigation.goBack} />
      <View style={styles.simulatorContent}>
        {!done ? <>
          <View style={styles.simulatorProgress}><View style={[styles.simulatorProgressFill, { width: `${(step / scenarios.length) * 100}%` }]} /></View>
          <Text style={styles.eyebrow}>СИТУАЦИЯ {step + 1} ИЗ {scenarios.length}</Text><Text style={styles.simulatorTitle}>{scenarios[step].question}</Text>
          <View style={{ gap: 10 }}>{scenarios[step].options.map((option, index) => <TouchableOpacity key={option} style={styles.simulatorOption} onPress={() => choose(index)}><Text style={styles.optionText}>{option}</Text><ArrowRight size={17} color={COLORS.textMuted} /></TouchableOpacity>)}</View>
        </> : <View style={styles.resultCard}><View style={styles.resultIcon}><Check size={30} color={COLORS.text} /></View><Text style={styles.resultScore}>{Math.min(score, 99)}%</Text><Text style={styles.recommendTitle}>Вы умеете договариваться</Text><Text style={styles.recommendText}>Ваш стиль — спокойное обсуждение и конкретные правила. Добавим это в профиль совместимости.</Text><TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Group')}><Text style={styles.primaryText}>Перейти к группе</Text><ArrowRight size={18} color={COLORS.text} /></TouchableOpacity></View>}
      </View>
    </ScreenTransition>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return <View style={{ gap: 7 }}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...inputProps} placeholderTextColor={COLORS.textMuted} style={styles.fieldInput} /></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 42 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, color: COLORS.textMuted },
  title: { marginTop: 7, fontSize: 29, lineHeight: 32, fontWeight: '900', letterSpacing: -0.8, color: COLORS.text },
  subtitle: { marginTop: 7, fontSize: 13, lineHeight: 19, color: COLORS.textMuted },
  roundAction: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  applicationCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 12, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  applicationImage: { width: 86, height: 108, borderRadius: RADIUS.md },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  statusPillText: { fontSize: 9, fontWeight: '900', color: COLORS.text },
  cardTitle: { marginTop: 7, fontSize: 14, lineHeight: 18, fontWeight: '900', color: COLORS.text },
  cardMeta: { marginTop: 4, fontSize: 11, color: COLORS.textMuted },
  cardPrice: { marginTop: 7, fontSize: 13, fontWeight: '900', color: COLORS.text },
  tipCard: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.accentSoft },
  tipTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  tipText: { marginTop: 3, fontSize: 11, lineHeight: 16, color: COLORS.textSecondary },
  propertyStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, marginBottom: 12, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  stripImage: { width: 76, height: 76, borderRadius: RADIUS.md },
  panel: { padding: 18, marginTop: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  panelTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, marginBottom: 14 },
  timelineRow: { minHeight: 58, flexDirection: 'row', gap: 12 },
  timelineDot: { width: 31, height: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted },
  timelineDone: { backgroundColor: COLORS.accent },
  timelineTitle: { fontSize: 13, fontWeight: '900', color: COLORS.text },
  optionRow: { minHeight: 52, marginTop: 9, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  optionSelected: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accentBorder },
  optionText: { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.text },
  radio: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  radioSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  secondaryButton: { minHeight: 50, marginTop: 14, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryButtonText: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  recommendHero: { alignItems: 'center', padding: 24, borderRadius: RADIUS.xl, backgroundColor: COLORS.accent },
  recommendScore: { marginTop: 12, fontSize: 48, lineHeight: 50, fontWeight: '900', color: COLORS.text, letterSpacing: -1.8 },
  recommendTitle: { marginTop: 6, fontSize: 18, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  recommendText: { marginTop: 5, fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { marginTop: 24, marginBottom: 11, fontSize: 19, fontWeight: '900', color: COLORS.text },
  personRow: { minHeight: 76, marginBottom: 10, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  personAvatar: { width: 52, height: 52, borderRadius: 18 },
  scoreText: { fontSize: 14, fontWeight: '900', color: COLORS.accentHover },
  compareButton: { minHeight: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: RADIUS.full, backgroundColor: COLORS.accentSoft },
  compareText: { flex: 1, fontSize: 13, fontWeight: '900', color: COLORS.text },
  comparePerson: { width: 108, padding: 10, alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  compareAvatar: { width: 76, height: 84, borderRadius: RADIUS.md },
  compareName: { marginTop: 8, fontSize: 13, fontWeight: '900', color: COLORS.text },
  compareTable: { marginTop: 18, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  compareTableRow: { minHeight: 62, padding: 13, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  compareLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted },
  compareValues: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-around' },
  compareValue: { width: '30%', textAlign: 'center', fontSize: 14, fontWeight: '900', color: COLORS.text },
  primaryButton: { minHeight: 53, marginTop: 18, paddingHorizontal: 20, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  formPanel: { marginTop: 22, gap: 18, padding: 18, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { fontSize: 11, fontWeight: '900', color: COLORS.textSecondary },
  fieldInput: { minHeight: 48, paddingHorizontal: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceMuted, fontSize: 14, fontWeight: '700', color: COLORS.text },
  miniPrimary: { minHeight: 38, paddingHorizontal: 13, borderRadius: RADIUS.full, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  miniPrimaryText: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  assistantIntro: { alignItems: 'center', padding: 20, borderRadius: RADIUS.xl, backgroundColor: COLORS.accentSoft },
  botIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  suggestionChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  suggestionText: { fontSize: 11, fontWeight: '800', color: COLORS.text },
  bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.surface },
  myBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.accent },
  bubbleText: { fontSize: 13, lineHeight: 19, color: COLORS.text },
  composer: { padding: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 8, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  composerInput: { flex: 1, maxHeight: 100, minHeight: 44, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 22, backgroundColor: COLORS.surfaceMuted, fontSize: 14, color: COLORS.text },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  simulatorContent: { flex: 1, padding: 20 },
  simulatorProgress: { height: 6, borderRadius: 3, backgroundColor: COLORS.surfaceMuted, overflow: 'hidden', marginBottom: 34 },
  simulatorProgressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.accentHover },
  simulatorTitle: { marginTop: 10, marginBottom: 28, fontSize: 28, lineHeight: 33, fontWeight: '900', color: COLORS.text, letterSpacing: -0.7 },
  simulatorOption: { minHeight: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  resultCard: { alignItems: 'center', marginTop: 50, padding: 26, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface },
  resultIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent },
  resultScore: { marginTop: 18, fontSize: 50, fontWeight: '900', color: COLORS.text },
});
