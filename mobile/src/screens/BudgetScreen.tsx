import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { ArrowLeft, Plus, CheckCircle2, Circle, DollarSign, Wallet, X } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { useGlobalState } from '../data/stateStore';

interface BudgetScreenProps {
  navigation: any;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({ navigation }) => {
  const { expenses, addExpense, toggleExpensePaid } = useGlobalState();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Аренда' | 'Коммуналка' | 'Продукты' | 'Бытовые мелочи'>('Бытовые мелочи');
  const [paidBy, setPaidBy] = useState('Артём С.');

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addExpense(title.trim(), category, numAmount, paidBy);
    setTitle('');
    setAmount('');
    setCategory('Бытовые мелочи');
    setPaidBy('Артём С.');
    setModalVisible(false);
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Бюджет & Расходы группы</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Plus size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Wallet size={24} color={COLORS.text} />
            <Text style={styles.summaryLabel}>Расходы группы за Июль</Text>
          </View>

          <Text style={styles.summaryAmount}>
            {totalSpent.toLocaleString('ru-RU')} ₽
          </Text>

          <View style={styles.settlementBox}>
            <Text style={styles.settlementText}>
              Баланс: <Text style={styles.boldText}>Артём С.</Text> переводит <Text style={styles.accentText}>900 ₽</Text> Марии К.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>История счетов и разделение (Sharely)</Text>

        {/* Expenses List */}
        {expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseSub}>
                  Оплатил(а): {expense.paidBy} • {expense.date}
                </Text>
              </View>

              <Text style={styles.expenseAmount}>
                {expense.totalAmount.toLocaleString('ru-RU')} ₽
              </Text>
            </View>

            <View style={styles.sharesList}>
              {expense.shares.map((share, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.shareRow}
                  onPress={() => toggleExpensePaid(expense.id, share.memberName)}
                  activeOpacity={0.8}
                >
                  <View style={styles.shareInfo}>
                    {share.isPaid ? (
                      <CheckCircle2 size={18} color={COLORS.success} />
                    ) : (
                      <Circle size={18} color={COLORS.textMuted} />
                    )}
                    <Text style={styles.shareName}>{share.memberName}</Text>
                  </View>

                  <View style={styles.shareRight}>
                    <Text style={styles.shareAmount}>
                      {share.amount.toLocaleString('ru-RU')} ₽
                    </Text>
                    <Text style={[styles.statusText, share.isPaid ? styles.statusPaid : styles.statusUnpaid]}>
                      {share.isPaid ? 'Оплачено' : 'К оплате'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить расход</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Название покупки</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Например, Интернет, Стиральный порошок"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>Сумма (₽)</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0 ₽"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>Категория</Text>
            <View style={styles.categoryRow}>
              {(['Аренда', 'Коммуналка', 'Продукты', 'Бытовые мелочи'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Кто оплатил</Text>
            <View style={styles.categoryRow}>
              {['Мария К.', 'Артём С.', 'Екатерина В.'].map((person) => (
                <TouchableOpacity
                  key={person}
                  style={[styles.categoryChip, paidBy === person && styles.categoryChipActive]}
                  onPress={() => setPaidBy(person)}
                >
                  <Text style={[styles.categoryChipText, paidBy === person && styles.categoryChipTextActive]}>
                    {person}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Сохранить и разделить</Text>
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 24,
    ...SHADOWS.glow,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  settlementBox: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    marginTop: 14,
  },
  settlementText: {
    fontSize: 13,
    color: COLORS.text,
  },
  boldText: {
    fontWeight: '700',
  },
  accentText: {
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  expenseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  expenseSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  sharesList: {
    marginTop: 10,
    gap: 8,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareRight: {
    alignItems: 'flex-end',
  },
  shareAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPaid: {
    color: COLORS.success,
  },
  statusUnpaid: {
    color: COLORS.warning,
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
