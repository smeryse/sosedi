import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronRight, MessageCircle, Search, Users } from 'lucide-react-native';
import { COLORS, RADIUS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';
import { SafeImage } from '../components/SafeImage';
import { AnimatedListItem, ScreenTransition } from '../components/ScreenTransition';

interface ChatListScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const DIRECT_CHATS = [
  {
    id: 'owner',
    title: 'Алексей, собственник',
    subtitle: 'Документы получил, отвечу сегодня',
    time: '12:40',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    online: true,
  },
  {
    id: 'maria',
    title: 'Мария К.',
    subtitle: 'Да, район мне подходит 👍',
    time: '11:18',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    online: true,
  },
  {
    id: 'ekaterina',
    title: 'Екатерина В.',
    subtitle: 'Посмотрела договор, всё понятно',
    time: 'Вчера',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    online: false,
  },
];

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const { chats } = useGlobalState();
  const lastGroupMessage = chats[chats.length - 1]?.text ?? 'Обсудите квартиру и общую заявку';
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = DIRECT_CHATS.filter((chat) => chat.title.toLowerCase().includes(normalizedQuery));

  return (
    <ScreenTransition style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Чаты</Text>
        <View style={styles.unreadPill}><Text style={styles.unreadText}>2 новых</Text></View>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по сообщениям"
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ГРУППА</Text>
        <TouchableOpacity style={styles.groupChat} onPress={() => navigation.navigate('Messages')} activeOpacity={0.85}>
          <View style={styles.groupIcon}><Users size={22} color={COLORS.text} /></View>
          <View style={styles.chatCopy}>
            <View style={styles.chatTitleRow}>
              <Text style={styles.chatTitle}>Центр 2026</Text>
              <Text style={styles.chatTime}>12:46</Text>
            </View>
            <Text numberOfLines={1} style={styles.chatSubtitle}>{lastGroupMessage}</Text>
            <View style={styles.membersRow}>
              <Text style={styles.membersText}>3 участника</Text>
              <View style={styles.dot} />
              <Text style={styles.membersText}>заявка готова</Text>
            </View>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>ЛИЧНЫЕ СООБЩЕНИЯ</Text>
        <View style={styles.directList}>
          {visibleChats.map((chat, index) => (
            <AnimatedListItem key={chat.id} index={index}>
              <TouchableOpacity style={styles.chatRow} onPress={() => navigation.navigate('Messages')} activeOpacity={0.8}>
                <View style={styles.avatarWrap}>
                  <SafeImage uri={chat.image} label={chat.title} style={styles.avatar} />
                  {chat.online && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.chatCopy}>
                  <View style={styles.chatTitleRow}>
                    <Text style={styles.chatTitle}>{chat.title}</Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <Text style={styles.chatSubtitle} numberOfLines={1}>{chat.subtitle}</Text>
                </View>
              </TouchableOpacity>
            </AnimatedListItem>
          ))}
          {visibleChats.length === 0 && (
            <View style={styles.emptyState}>
              <MessageCircle size={26} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Чаты не найдены</Text>
              <Text style={styles.emptyText}>Попробуйте другое имя</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenTransition>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 27, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  unreadPill: { backgroundColor: COLORS.accent, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 6 },
  unreadText: { fontSize: 11, fontWeight: '900', color: COLORS.text },
  searchBox: { marginHorizontal: 20, height: 48, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 9, marginTop: 8 },
  groupChat: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 24 },
  groupIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  chatCopy: { flex: 1, minWidth: 0 },
  chatTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chatTitle: { flex: 1, fontSize: 14, fontWeight: '900', color: COLORS.text },
  chatTime: { fontSize: 10, color: COLORS.textMuted },
  chatSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 },
  membersText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textSecondary },
  directList: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 14 },
  chatRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  avatarWrap: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  onlineDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent, right: 0, bottom: 0, borderWidth: 2, borderColor: COLORS.surface },
  emptyState: { alignItems: 'center', paddingVertical: 34 },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  emptyText: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
});
