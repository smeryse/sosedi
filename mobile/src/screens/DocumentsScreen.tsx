import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  FileText,
  ShieldCheck,
  DollarSign,
  Calendar,
  Download,
  Plus,
  ChevronRight,
  Trash2,
  Eye,
  Search,
  Filter,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

import { AppNavigation } from '../types/navigation';

interface DocumentsScreenProps { navigation: AppNavigation; }

const DOCUMENT_TYPES = [
  { key: 'contract', label: 'Договоры аренды', icon: FileText, color: COLORS.info, bg: COLORS.infoSoft },
  { key: 'receipt', label: 'Чеки и квитанции', icon: DollarSign, color: COLORS.accent, bg: COLORS.accentSoft },
  { key: 'id', label: 'Документы личности', icon: ShieldCheck, color: COLORS.success, bg: COLORS.successSoft },
  { key: 'utility', label: 'Коммунальные платежи', icon: Calendar, color: COLORS.warning, bg: COLORS.warningSoft },
  { key: 'other', label: 'Прочие', icon: Paperclip, color: COLORS.textMuted, bg: COLORS.surfaceMuted },
];

const mockDocuments = [
  {
    id: '1',
    type: 'contract',
    title: 'Договор аренды № 2024/07/001',
    subtitle: 'Евро-двушка на ул. Северной, 15',
    date: '15 июля 2024',
    status: 'active',
    size: '2.4 MB',
    pages: 12,
    tags: ['Аренда', 'Активно', 'Подписано'],
  },
  {
    id: '2',
    type: 'contract',
    title: 'Договор аренды № 2024/06/015',
    subtitle: 'Студия у парка, 45 000 ₽/мес',
    date: '20 июня 2024',
    status: 'expired',
    size: '1.8 MB',
    pages: 10,
    tags: ['Аренда', 'Истёк', 'Архив'],
  },
  {
    id: '3',
    type: 'receipt',
    title: 'Квитанция за июль 2024',
    subtitle: 'Оплата аренды + коммуналка',
    date: '01 августа 2024',
    status: 'paid',
    size: '450 KB',
    pages: 2,
    tags: ['Оплачено', 'Авто'],
  },
  {
    id: '4',
    type: 'receipt',
    title: 'Чек за интернет (Ростелеком)',
    subtitle: 'Абонентская плата за июль',
    date: '28 июля 2024',
    status: 'paid',
    size: '120 KB',
    pages: 1,
    tags: ['Интернет', 'Ежемесячно'],
  },
  {
    id: '5',
    type: 'id',
    title: 'Паспорт РФ (скан)',
    subtitle: 'Для верификации профиля',
    date: '10 марта 2024',
    status: 'verified',
    size: '3.2 MB',
    pages: 4,
    tags: ['Верифицировано', 'Личное'],
  },
  {
    id: '6',
    type: 'utility',
    title: 'ПДВ за июль 2024',
    subtitle: 'Электричество, вода, отопление',
    date: '25 июля 2024',
    status: 'pending',
    size: '380 KB',
    pages: 3,
    tags: ['К оплате', 'До 25 числа'],
  },
  {
    id: '7',
    type: 'other',
    title: 'Справка с места работы',
    subtitle: 'Для собственника квартиры',
    date: '05 июля 2024',
    status: 'draft',
    size: '650 KB',
    pages: 2,
    tags: ['В работе', 'Нужно обновить'],
  },
  {
    id: '8',
    type: 'other',
    title: 'Страховой полис квартиры',
    subtitle: 'ОСАГО недвижимости на год',
    date: '01 января 2024',
    status: 'active',
    size: '1.1 MB',
    pages: 8,
    tags: ['Страховка', 'До 01.01.2025'],
  },
];

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Активно', color: COLORS.success, bg: COLORS.successSoft };
      case 'paid': return { label: 'Оплачено', color: COLORS.success, bg: COLORS.successSoft };
      case 'pending': return { label: 'Ожидает', color: COLORS.warning, bg: COLORS.warningSoft };
      case 'verified': return { label: 'Верифицировано', color: COLORS.info, bg: COLORS.infoSoft };
      case 'expired': return { label: 'Истёк', color: COLORS.textMuted, bg: COLORS.surfaceMuted };
      case 'draft': return { label: 'Черновик', color: COLORS.textMuted, bg: COLORS.surfaceMuted };
      default: return { label: status, color: COLORS.textMuted, bg: COLORS.surfaceMuted };
    }
  };

  const [activeType, setActiveType] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [documents, setDocuments] = useState(mockDocuments);
  const [newDoc, setNewDoc] = useState({ title: '', type: 'other', fileAttached: false });

  const filteredDocs = documents.filter((doc) => {
    const matchesType = activeType === 'all' || doc.type === activeType;
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Документы</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск документов..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterContent}>
        <TouchableOpacity
          style={[styles.typeChip, activeType === 'all' && styles.typeChipActive]}
          onPress={() => setActiveType('all')}
        >
          <Text style={[styles.typeChipText, activeType === 'all' && styles.typeChipTextActive]}>Все</Text>
        </TouchableOpacity>
        {DOCUMENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.typeChip, activeType === type.key && styles.typeChipActive]}
            onPress={() => setActiveType(type.key)}
          >
            <type.icon size={12} color={activeType === type.key ? COLORS.text : type.color} />
            <Text style={[styles.typeChipText, activeType === type.key && styles.typeChipTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Documents List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Документов не найдено</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первый документ'}
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyActionBtnText}>Добавить документ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocs.map((doc) => {
            const typeConfig = DOCUMENT_TYPES.find((t) => t.key === doc.type) || DOCUMENT_TYPES[4];
            const statusConfig = getStatusConfig(doc.status);

            return (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                onPress={() => navigation.navigate('DocumentDetail', { doc })}
                activeOpacity={0.9}
              >
                <View style={styles.docHeader}>
                  <View style={[styles.docTypeBadge, { backgroundColor: typeConfig.bg }]}>
                    <typeConfig.icon size={16} color={typeConfig.color} />
                  </View>

                  <View style={styles.docTitleBox}>
                    <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                    <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
                  </View>

                  <View style={styles.docStatusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <View style={styles.docMeta}>
                  <View style={styles.metaRow}>
                    <Calendar size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{doc.date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <FileText size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{doc.size} • {doc.pages} стр.</Text>
                  </View>
                </View>

                <View style={styles.docTags}>
                  {doc.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.docActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DocumentDetail', { doc })} activeOpacity={0.8}>
                    <Eye size={14} color={COLORS.textMuted} />
                    <Text style={styles.actionBtnText}>Открыть</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => Alert.alert('Скачивание началось', `${doc.title} будет сохранён в файлах устройства.`)} activeOpacity={0.8}>
                    <Download size={14} color={COLORS.accent} />
                    <Text style={styles.actionBtnTextSecondary}>Скачать</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnDanger} onPress={() => Alert.alert('Удалить документ?', doc.title, [{ text: 'Отмена', style: 'cancel' }, { text: 'Удалить', style: 'destructive', onPress: () => setDocuments((items) => items.filter((item) => item.id !== doc.id)) }])} activeOpacity={0.8}>
                    <Trash2 size={14} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Document Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить документ</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Название документа</Text>
            <TextInput
              style={styles.textInput}
              value={newDoc.title}
              onChangeText={(text) => setNewDoc({ ...newDoc, title: text })}
              placeholder="Например, Договор аренды, Квитанция за июль"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>Тип документа</Text>
            <View style={styles.typeSelector}>
              {DOCUMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typeSelectorItem, newDoc.type === type.key && styles.typeSelectorItemActive]}
                  onPress={() => setNewDoc({ ...newDoc, type: type.key })}
                >
                  <type.icon size={16} color={newDoc.type === type.key ? COLORS.text : type.color} />
                  <Text style={[styles.typeSelectorItemText, newDoc.type === type.key && styles.typeSelectorItemTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Файл</Text>
            <TouchableOpacity style={styles.fileUploadArea} onPress={() => setNewDoc({ ...newDoc, fileAttached: true })} activeOpacity={0.8}>
              <Paperclip size={24} color={COLORS.textMuted} />
              <View style={styles.fileUploadText}>
                <Text style={styles.fileUploadTitle}>{newDoc.fileAttached ? 'Файл выбран' : 'Выберите файл'}</Text>
                <Text style={styles.fileUploadSubtitle}>{newDoc.fileAttached ? 'document.pdf · 1,2 МБ' : 'PDF, JPG, PNG до 50 МБ'}</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => {
              if (!newDoc.title.trim() || !newDoc.fileAttached) {
                Alert.alert('Добавьте данные', 'Укажите название и выберите файл.');
                return;
              }
              setDocuments((items) => [{ id: `doc-${Date.now()}`, type: newDoc.type, title: newDoc.title.trim(), subtitle: 'Добавлено вручную', date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), status: 'draft', size: '1.2 MB', pages: 1, tags: ['Новый', 'Черновик'] }, ...items]);
              setModalVisible(false);
              setNewDoc({ title: '', type: 'other', fileAttached: false });
            }}>
              <Text style={styles.modalSaveBtnText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingHorizontal: 10,
  },
  typeFilterContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentBorder,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  typeChipTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    marginTop: 16,
    ...SHADOWS.glow,
  },
  emptyActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  docCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  docTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  docTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  docSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  docStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docMeta: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  docTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  docActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceMuted,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  actionBtnDanger: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    height: 48,
    color: COLORS.text,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeSelectorItemActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentBorder,
  },
  typeSelectorItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeSelectorItemTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  fileUploadArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
  },
  fileUploadText: {
    flex: 1,
  },
  fileUploadTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  fileUploadSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...SHADOWS.glow,
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
});
