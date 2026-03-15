import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { Button } from '../ui/button';

type GestureTutorialCardProps = {
  onContinue: () => void;
};

const PRACTICE_STEPS = [
  {
    actionLabel: 'Practice keep',
    helper: 'Right swipe or Keep keeps a photo out of the deletion path.',
    cardTone: 'keep' as const,
    title: 'Try the keep move first',
  },
  {
    actionLabel: 'Practice delete',
    helper: 'Left swipe or Delete is the fast path when you are sure.',
    cardTone: 'delete' as const,
    title: 'Now rehearse the delete move',
  },
  {
    actionLabel: 'Practice skip',
    helper: 'Skip is your safe “not now” option. It comes back later.',
    cardTone: 'skip' as const,
    title: 'Finish with the skip move',
  },
];

export function GestureTutorialCard({ onContinue }: GestureTutorialCardProps) {
  const { colors, isNightMode } = useAppTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const step = PRACTICE_STEPS[stepIndex];
  const done = stepIndex >= PRACTICE_STEPS.length;
  const dummyStatus = useMemo(
    () =>
      step?.cardTone === 'keep' ? 'Kept' : step?.cardTone === 'delete' ? 'Deleted' : step?.cardTone === 'skip' ? 'Skipped' : 'Ready',
    [step?.cardTone]
  );

  if (done) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : colors.cardGlass,
            borderColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.highlight }]}>Practice complete</Text>
        <Text style={[styles.title, { color: colors.white }]}>You know the loop now.</Text>
        <Text style={[styles.hint, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
          Keep stays safe, Delete stays honest, and Skip keeps momentum without forcing a decision too early.
        </Text>
        <Button label="Start with real photos" onPress={onContinue} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : colors.cardGlass,
          borderColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: colors.highlight }]}>Interactive practice</Text>
      <Text style={[styles.title, { color: colors.white }]}>{step.title}</Text>

      <View style={[styles.dummyCard, { backgroundColor: colors.stageCard }]}>
        <View style={[styles.dummyPhoto, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)' }]} />
        <View style={styles.dummyMeta}>
          <Text style={[styles.dummyTitle, { color: colors.white }]}>Practice photo</Text>
          <Text style={[styles.dummyBody, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' }]}>
            Status: {dummyStatus}
          </Text>
        </View>
      </View>

      <Text style={[styles.hint, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>{step.helper}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setStepIndex((value) => value + 1)}
        style={[
          styles.practiceButton,
          {
            backgroundColor:
              step.cardTone === 'keep'
                ? colors.keep
                : step.cardTone === 'delete'
                  ? colors.delete
                  : isNightMode
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.12)',
          },
        ]}
      >
        <Text style={[styles.practiceButtonLabel, { color: step.cardTone === 'skip' ? colors.white : '#08111D' }]}>{step.actionLabel}</Text>
      </Pressable>
      <Text style={[styles.progress, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.72)' }]}>
        Step {stepIndex + 1} of {PRACTICE_STEPS.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 460,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 40,
  },
  dummyCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  dummyPhoto: {
    minHeight: 180,
    borderRadius: radius.md,
  },
  dummyMeta: {
    gap: 4,
  },
  dummyTitle: {
    fontFamily: typography.bold,
    fontSize: 18,
  },
  dummyBody: {
    fontFamily: typography.body,
    fontSize: 14,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 24,
  },
  practiceButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  practiceButtonLabel: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  progress: {
    fontFamily: typography.medium,
    fontSize: 13,
    textAlign: 'center',
  },
});
