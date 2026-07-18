import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ArrowLeft, CheckCircle2, Circle, Sparkles, CalendarCheck, Plus, X } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';

interface ChoresScreenProps {
  navigation: any;
}

export const ChoresScreen: React.FC<ChoresScreenProps> = ({ navigation }) => {
  const { chores, addChore, toggleChoreCompleted } = useGlobalState();
  const [modalVisible, setModalVisible] = useState(false);
  const [zone, setZone] = useState<'Кухня' | 'Ванная' | 'Гостиная' | 'Мусор & Коридор'>('Кухня');
  const [assignee, setAssignee] = useState('Артём С.');
  const [frequency, setFrequency] = useState<'Ежедневно' | 'Еженедельно'>('Еженедельно');

  const handleSave = () => {
    addChore(zone, assignee, frequency);
    setZone('Кухня');
    setAssignee('Артём С.');
    setFrequency('Еженедельно');
    setModalVisible(false);
  };

  const completedCount = chores.filter((c) => c.isCompleted).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>График уборки и дежурств</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CalendarCheck size={24} color={COLORS.text} />
            <Text style={styles.statusTitle}>Чистота в доме на этой неделе</Text>
          </View>
          <Text style={styles.statusSub}>
            Выполнено {completedCount} из {chores.length} задач. Скоро дежурство Артёма в ванной!
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / chores.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Дежурства по зонам (График)</Text>

        {chores.map((chore) => (
          <TouchableOpacity
            key={chore.id}
            style={[styles.choreCard, chore.isCompleted && styles.choreCardCompleted]}
            onPress={() => toggleChoreCompleted(chore.id)}
            activeOpacity={0.88}
          >
            <View style={styles.choreHeader}>
              <View style={styles.choreTitleRow}>
                {chore.isCompleted ? (
                  <CheckCircle2 size={20} color={COLORS.success} />
                ) : (
                  <Circle size={20} color={COLORS.textMuted} />
                )}
                <Text style={[styles.choreZone, chore.isCompleted && styles.textCompleted]}>
                  {chore.zone}
                </Text>
              </View>

              <View style={styles.freqPill}>
                <Text style={styles.freqText}>{chore.frequency}</Text>
              </View>
            </View>

            <View style={styles.choreFooter}>
              <Text style={styles.assigneeText}>
                Дежурный: <Text style={styles.boldText}>{chore.assignee}</Text>
              </Text>
              <Text style={styles.dueDateText}>{chore.dueDate}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Chore Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая задача уборки</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Зона уборки</Text>
            <View style={styles.categoryRow}>
              {(['Кухня', 'Ванная', 'Гостиная', 'Мусор & Коридор'] as const).map((z) => (
                <TouchableOpacity
                  key={z}
                  style={[styles.categoryChip, zone === z && styles.categoryChipActive]}
                  onPress={() => setZone(z)}
                >
                  <Text style={[styles.categoryChipText, zone === z && styles.categoryChipTextActive]}>
                    {z}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Дежурный</Text>
            <View style={styles.categoryRow}>
              {['Мария К.', 'Артём С.', 'Екатерина В.'].map((person) => (
                <TouchableOpacity
                  key={person}
                  style={[styles.categoryChip, assignee === person && styles.categoryChipActive]}
                  onPress={() => setAssignee(person)}
                >
                  <Text style={[styles.categoryChipText, assignee === person && styles.categoryChipTextActive]}>
                    {person}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Периодичность</Text>
            <View style={styles.categoryRow}>
              {(['Ежедневно', 'Еженедельно'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.categoryChip, frequency === f && styles.categoryChipActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.categoryChipText, frequency === f && styles.categoryChipTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Создать задачу</Text>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 24,
    ...SHADOWS.glow,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  choreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  choreCardCompleted: {
    backgroundColor: COLORS.surfaceMuted,
    opacity: 0.85,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choreTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  choreZone: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  freqPill: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  freqText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  choreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  assigneeText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Modal styles
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentBorder,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...SHADOWS.glow,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
});
