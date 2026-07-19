import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../theme/colors';
import { mockQuizQuestions } from '../data/mockData';
import { useGlobalState } from '../data/stateStore';

import { AppNavigation } from '../types/navigation';

interface CompatibilityScreenProps { navigation: AppNavigation; }

export const CompatibilityScreen: React.FC<CompatibilityScreenProps> = ({ navigation }) => {
  const { completeQuiz } = useGlobalState();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const question = mockQuizQuestions[currentStep];
  const progressPercent = ((currentStep + 1) / mockQuizQuestions.length) * 100;
  const selectedOptionValue = answers[question.key];

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const handleNext = () => {
    if (currentStep < mockQuizQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeQuiz(answers);
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <View style={styles.completedCard}>
          <View style={styles.sparkleBg}>
            <Sparkles size={36} color={COLORS.text} />
          </View>
          <Text style={styles.completedTitle}>Анкета успешно заполнена!</Text>
          <Text style={styles.completedSub}>
            Ваш индивидуальный алгоритм совместимости «Соседей» рассчитан. Теперь вы видите реальный процент совпадения со всеми кандидатами и квартирами!
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Roommates')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Смотреть лучших соседей (96%)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={currentStep === 0 ? () => navigation.goBack() : handlePrev}
        >
          <ArrowLeft size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.stepTitle}>
          Вопрос {currentStep + 1} из {mockQuizQuestions.length}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question Header */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{question.category}</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>
        {question.subtitle && <Text style={styles.subtitleText}>{question.subtitle}</Text>}

        {/* Option Cards */}
        <View style={styles.optionsList}>
          {question.options.map((opt) => {
            const isSelected = selectedOptionValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelectOption(opt.value)}
                activeOpacity={0.88}
              >
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && <CheckCircle2 size={20} color={COLORS.text} />}
                </View>

                {opt.description && (
                  <Text style={[styles.optionDesc, isSelected && styles.optionDescSelected]}>
                    {opt.description}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedOptionValue && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selectedOptionValue}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentStep === mockQuizQuestions.length - 1 ? 'Завершить анкету' : 'Далее'}
          </Text>
          <ArrowRight size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceMuted,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 32,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
    marginTop: 10,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  optionCardSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentBorder,
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionLabelSelected: {
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  optionDescSelected: {
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextBtn: {
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.glow,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  completedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    ...SHADOWS.glow,
  },
  sparkleBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  completedSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    marginTop: 20,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
});
