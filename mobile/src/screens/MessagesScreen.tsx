import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { ArrowLeft, Send, CheckCheck, Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';

import { AppNavigation } from '../types/navigation';
import { SafeImage } from '../components/SafeImage';
import { PEOPLE_IMAGES } from '../data/peopleAssets';

interface MessagesScreenProps { navigation: AppNavigation; }

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { chats, sendChatMessage } = useGlobalState();
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack} activeOpacity={0.75}>
          <ArrowLeft size={19} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.chatAvatarBox}>
          <SafeImage
            uri={PEOPLE_IMAGES.maria}
            label="Мария"
            style={styles.chatAvatar}
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.chatHeaderTitleBox}>
          <Text style={styles.chatTitle}>Группа «Центр 2026»</Text>
          <Text style={styles.chatSub}>Мария К. и Артём С. • В сети</Text>
        </View>
      </View>

      {/* Messages Feed */}
      <ScrollView contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        <View style={styles.dateNotice}>
          <Text style={styles.dateNoticeText}>Сегодня, 18 июля 2026</Text>
        </View>

        {chats.map((msg) => {
          if (msg.type === 'system') {
            return (
              <View key={msg.id} style={styles.systemBubble}>
                <Sparkles size={16} color={COLORS.text} />
                <Text style={styles.systemText}>{msg.text}</Text>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[styles.messageRow, msg.isMe ? styles.messageRowMe : styles.messageRowOther]}
            >
              {!msg.isMe && (
                <SafeImage uri={msg.senderAvatar} label={msg.senderName} style={styles.senderAvatar} />
              )}

              <View
                style={[
                  styles.bubble,
                  msg.isMe ? styles.bubbleMe : styles.bubbleOther,
                ]}
              >
                {!msg.isMe && <Text style={styles.senderName}>{msg.senderName}</Text>}
                <Text style={[styles.msgText, msg.isMe && styles.msgTextMe]}>{msg.text}</Text>
                
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, msg.isMe && styles.timeTextMe]}>{msg.time}</Text>
                  {msg.isMe && <CheckCheck size={14} color={COLORS.text} />}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Presets Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow} contentContainerStyle={styles.presetsContainer}>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => setInputText('Привет! Ищу соседа с совпадающим бюджетом')}
          activeOpacity={0.8}
        >
          <Text style={styles.presetChipText}>👋 Совпали по графику</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => setInputText('Здравствуйте! Когда возможен просмотр?')}
          activeOpacity={0.8}
        >
          <Text style={styles.presetChipText}>🏠 Запросить просмотр</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => setInputText('Привет! Готов обсудить правила проживания')}
          activeOpacity={0.8}
        >
          <Text style={styles.presetChipText}>✨ Обсудить быт</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Напишите сообщение группе..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
          <Send size={18} color={COLORS.text} />
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarBox: {
    position: 'relative',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  chatHeaderTitleBox: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  chatSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateNotice: {
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 16,
  },
  dateNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  systemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: RADIUS.xl,
    padding: 14,
    ...SHADOWS.card,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleMe: {
    backgroundColor: COLORS.accent,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  msgTextMe: {
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  timeTextMe: {
    color: COLORS.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 80,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsRow: {
    maxHeight: 44,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  presetsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
});
