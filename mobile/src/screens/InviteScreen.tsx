import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import {
  Share2,
  Copy,
  Link2,
  UserPlus,
  MessageSquare,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  QrCode,
  Download,
  ExternalLink,
  ChevronRight,
  Copy as CopyIcon,
  DollarSign,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';

import { AppNavigation } from '../types/navigation';

interface InviteScreenProps { navigation: AppNavigation; }

const INVITE_TEMPLATES = [
  {
    id: 'standard',
    label: 'Стандартное',
    preview: 'Привет! Приглашаю присоединиться к моей группе сожительства в приложении «Соседи». Мы ищем соседей для совместной аренды. Подробности по ссылке:',
  },
  {
    id: 'friendly',
    label: 'Дружеское',
    preview: 'Привет! 👋 Мы с ребятами собираем группу для совместной аренды крутой квартиры. Ты бы вписался? Загляни в приложение «Соседи», там вся инфа:',
  },
  {
    id: 'short',
    label: 'Краткое',
    preview: 'Ищем соседей для совместной аренды! Присоединяйся к группе в «Соседях»:',
  },
];

export const InviteScreen: React.FC<InviteScreenProps> = ({ navigation }) => {
  const { group } = useGlobalState();
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://sosedi.app/invite/${group.id}`;
  const fullMessage = `${INVITE_TEMPLATES.find(t => t.id === selectedTemplate)?.preview || ''}\n\n${customMessage}\n\n${inviteLink}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: fullMessage,
        title: 'Приглашение в группу «Соседи»',
        url: inviteLink,
      });
    } catch {
      return;
    }
  };

  const handleCopy = () => {
    Alert.alert('Ссылка скопирована', 'Пригласительная ссылка скопирована в буфер обмена');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    Alert.alert('Текст скопирован', 'Полное сообщение с ссылкой скопировано');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ChevronRight size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Пригласить в группу</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Invite Link Card */}
        <View style={styles.linkCard}>
          <View style={styles.linkCardHeader}>
            <View style={styles.linkIconBg}>
              <Link2 size={20} color={COLORS.text} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkCardTitle}>Ваша ссылка-приглашение</Text>
              <Text style={styles.linkCardSubtitle}>Уникальная для вашей группы</Text>
            </View>
          </View>

          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
          </View>

          <View style={styles.linkActions}>
            <TouchableOpacity style={[styles.linkActionBtn, { backgroundColor: COLORS.accent }]} onPress={handleCopy} activeOpacity={0.8}>
              <Copy size={16} color={COLORS.text} />
              <Text style={styles.linkActionBtnText}>{copied ? 'Скопировано!' : 'Копировать ссылку'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkActionBtn} onPress={handleShare} activeOpacity={0.8}>
              <Share2 size={16} color={COLORS.text} />
              <Text style={styles.linkActionBtnText}>Поделиться</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>QR-код для быстрого доступа</Text>
            <View style={styles.qrPlaceholder}>
              <QrCode size={48} color={COLORS.textMuted} />
              <Text style={styles.qrHint}>Нажмите для увеличения</Text>
            </View>
          </View>
        </View>

        {/* Message Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Шаблон сообщения</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
            {INVITE_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateCard, selectedTemplate === template.id && styles.templateCardActive]}
                onPress={() => setSelectedTemplate(template.id)}
              >
                <View style={styles.templateCardHeader}>
                  <Text style={[styles.templateCardLabel, selectedTemplate === template.id && styles.templateCardLabelActive]}>
                    {template.label}
                  </Text>
                  {selectedTemplate === template.id && (
                    <CheckCircle2 size={16} color={COLORS.accent} />
                  )}
                </View>
                <Text style={[styles.templateCardPreview, selectedTemplate === template.id && styles.templateCardPreviewActive]}>
                  {template.preview}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваше сообщение (необязательно)</Text>
          <TextInput
            style={styles.customMessageInput}
            placeholder="Добавьте личное сообщение..."
            placeholderTextColor={COLORS.textMuted}
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{customMessage.length}/500</Text>
        </View>

        {/* Full Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Превью полного сообщения</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>{fullMessage}</Text>
          </View>
          <TouchableOpacity style={styles.previewCopyBtn} onPress={handleCopyMessage} activeOpacity={0.8}>
            <CopyIcon size={14} color={COLORS.accent} />
            <Text style={styles.previewCopyBtnText}>Копировать всё сообщение</Text>
          </TouchableOpacity>
        </View>

        {/* Share Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Отправить через</Text>
          <View style={styles.shareOptions}>
            {[
              { icon: MessageSquare, label: 'В чат группы', color: '#0284C7', action: () => navigation.navigate('Messages') },
              { icon: Mail, label: 'Email', color: COLORS.warning, action: () => Share.share({ message: fullMessage, url: inviteLink, title: 'Приглашение в группу «Соседи»' }) },
              { icon: Share2, label: 'Системное меню', color: COLORS.accent, action: handleShare },
              { icon: Download, label: 'Сохранить как текст', color: COLORS.info, action: () => Alert.alert('Сохранено', 'Текст сохранен в заметках') },
            ].map((option, idx) => (
              <TouchableOpacity key={idx} style={styles.shareOptionBtn} onPress={option.action} activeOpacity={0.8}>
                <View style={[styles.shareOptionIcon, { backgroundColor: option.color + '20' }]}>
                  <option.icon size={20} color={option.color} />
                </View>
                <Text style={styles.shareOptionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Group Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о группе</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.accentSoft }]}>
                <Users size={18} color={COLORS.text} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Участников</Text>
                <Text style={styles.infoValue}>{group.members.length} из 3</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.infoSoft }]}>
                <Shield size={18} color={COLORS.info} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Совместимость</Text>
                <Text style={styles.infoValue}>{group.compatibilityScore}%</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.warningSoft }]}>
                <DollarSign size={18} color={COLORS.warning} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Целевой бюджет</Text>
                <Text style={styles.infoValue}>{group.targetBudget.toLocaleString('ru-RU')} ₽/мес</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.successSoft }]}>
                <Clock size={18} color={COLORS.success} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Статус заявки</Text>
                <Text style={styles.infoValue}>
                  {group.status === 'under_review' ? 'На рассмотрении' : 'Готова к отправке'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invite History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>История приглашений</Text>
          <View style={styles.historyList}>
            {[
              { name: 'Екатерина В.', date: '2 дня назад', status: 'accepted', method: 'Чат' },
              { name: 'Дмитрий К.', date: '5 дней назад', status: 'pending', method: 'Email' },
              { name: 'Анна С.', date: '1 неделя назад', status: 'declined', method: 'Ссылка' },
            ].map((invite, idx) => (
              <View key={idx} style={styles.historyItem}>
                <View style={styles.historyAvatar}>
                  <Text style={styles.historyAvatarText}>{invite.name.charAt(0)}</Text>
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{invite.name}</Text>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyDate}>{invite.date}</Text>
                    <Text style={styles.historyMethod}>• {invite.method}</Text>
                  </View>
                </View>
                <View style={[
                  styles.historyStatus,
                  invite.status === 'accepted' && styles.historyStatusAccepted,
                  invite.status === 'pending' && styles.historyStatusPending,
                  invite.status === 'declined' && styles.historyStatusDeclined,
                ]}>
                  <Text style={[
                    styles.historyStatusText,
                    invite.status === 'accepted' && styles.historyStatusTextAccepted,
                    invite.status === 'pending' && styles.historyStatusTextPending,
                    invite.status === 'declined' && styles.historyStatusTextDeclined,
                  ]}>
                    {invite.status === 'accepted' ? 'Присоединился' : invite.status === 'pending' ? 'Ожидает' : 'Отклонил'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Link Card
  linkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 20,
    ...SHADOWS.glow,
  },
  linkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  linkIconBg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  linkCardSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  linkBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  linkText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.text,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  linkActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  linkActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  qrSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  qrLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  // Templates
  templateScroll: {
    paddingHorizontal: 4,
    gap: 10,
  },
  templateCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  templateCardActive: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentSoft,
    ...SHADOWS.glow,
  },
  templateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  templateCardLabelActive: {
    color: COLORS.text,
  },
  templateCardPreview: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  templateCardPreviewActive: {
    color: COLORS.textSecondary,
  },
  // Custom Message
  customMessageInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    marginRight: 4,
  },
  // Preview
  previewBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  previewCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  previewCopyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Share Options
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shareOptionBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  shareOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Info Card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  // History
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  historyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  historyInfo: {
    flex: 1,
    minWidth: 0,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  historyMethod: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  historyStatusAccepted: {
    backgroundColor: COLORS.successSoft,
  },
  historyStatusPending: {
    backgroundColor: COLORS.warningSoft,
  },
  historyStatusDeclined: {
    backgroundColor: COLORS.dangerSoft,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  historyStatusTextAccepted: {
    color: COLORS.success,
  },
  historyStatusTextPending: {
    color: COLORS.warning,
  },
  historyStatusTextDeclined: {
    color: COLORS.danger,
  },
});
