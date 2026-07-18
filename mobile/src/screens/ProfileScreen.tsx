import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  User,
  Heart,
  FileText,
  MessageSquare,
  DollarSign,
  CalendarCheck,
  Settings,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  LogOut,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>Профиль и настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>Артём Смирнов</Text>
              <ShieldCheck size={18} color={COLORS.success} />
            </View>
            <Text style={styles.userSub}>Senior Frontend Dev • 27 лет</Text>
            
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationText}>Профиль верифицирован</Text>
            </View>
          </View>
        </View>

        {/* Compatibility Test Banner */}
        <TouchableOpacity
          style={styles.quizBanner}
          onPress={() => navigation.navigate('Compatibility')}
          activeOpacity={0.9}
        >
          <View style={styles.quizIconBg}>
            <Sparkles size={20} color={COLORS.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quizTitle}>Анкета совместимости</Text>
            <Text style={styles.quizSub}>Заполнено 20 из 20 вопросов (100%)</Text>
          </View>
          <ChevronRight size={18} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Разделы и сервисы</Text>

        {/* Menu Items */}
        <View style={styles.menuBox}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Group')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: COLORS.accentSoft }]}>
              <User size={18} color={COLORS.text} />
            </View>
            <Text style={styles.menuLabel}>Моя группа сожительства</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Housing')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Heart size={18} color="#0284C7" />
            </View>
            <Text style={styles.menuLabel}>Избранное жильё и соседи</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Messages')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
              <MessageSquare size={18} color="#D97706" />
            </View>
            <Text style={styles.menuLabel}>Сообщения и чаты</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Budget')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: COLORS.accentSoft }]}>
              <DollarSign size={18} color={COLORS.text} />
            </View>
            <Text style={styles.menuLabel}>Бюджет и совместные расходы</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Chores')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#FEE2E2' }]}>
              <CalendarCheck size={18} color="#DC2626" />
            </View>
            <Text style={styles.menuLabel}>График уборки и дежурств</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconBg, { backgroundColor: COLORS.accentSoft }]}>
              <Sparkles size={18} color={COLORS.text} />
            </View>
            <Text style={styles.menuLabel}>Пройти знакомство заново (Onboarding)</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.navigate('Auth')}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  topNavTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    ...SHADOWS.card,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  userSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verificationBadge: {
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  verificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  quizBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    marginBottom: 24,
    gap: 12,
    ...SHADOWS.glow,
  },
  quizIconBg: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  quizSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  menuBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSoft,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
