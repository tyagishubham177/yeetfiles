import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, spacing, typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';
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
    icon: '→',
  },
  {
    actionLabel: 'Practice delete',
    helper: 'Left swipe or Delete is the fast path when you are sure.',
    cardTone: 'delete' as const,
    title: 'Now rehearse the delete move',
    icon: '←',
  },
  {
    actionLabel: 'Practice skip',
    helper: 'Skip is your safe "not now" option. It comes back later.',
    cardTone: 'skip' as const,
    title: 'Finish with the skip move',
    icon: '↓',
  },
];

export function GestureTutorialCard({ onContinue }: GestureTutorialCardProps) {
  const { colors, isNightMode } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
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
      <Animated.View
        entering={animationsEnabled ? FadeInDown.duration(400) : undefined}
        style={[
          styles.card,
          {
            backgroundColor: isNightMode ? 'rgba(255,255,255,0.05)' : colors.cardGlass,
            borderColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View style={[styles.completeBadge, { backgroundColor: colors.keep }]}>
          <Text style={styles.completeBadgeIcon}>✓</Text>
        </View>
        <Text style={[styles.eyebrow, { color: colors.highlight }]}>Practice complete</Text>
        <Text style={[styles.title, { color: colors.white }]}>You know the loop now.</Text>
        <Text style={[styles.hint, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>
          Keep stays safe, Delete stays honest, and Skip keeps momentum without forcing a decision too early.
        </Text>
        <Button label="Start with real photos" onPress={onContinue} />
      </Animated.View>
    );
  }

  const toneColor = step.cardTone === 'keep' ? colors.keep : step.cardTone === 'delete' ? colors.delete : colors.skip;

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
      {/* Top accent line matching the action tone */}
      <View style={[styles.accentLine, { backgroundColor: toneColor }]} />

      <Text style={[styles.eyebrow, { color: colors.highlight }]}>Interactive practice</Text>
      <Text style={[styles.title, { color: colors.white }]}>{step.title}</Text>

      <View style={[styles.dummyCard, { backgroundColor: colors.stageCard }]}>
        <View style={[styles.dummyPhoto, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)' }]}>
          <Text style={[styles.dummyArrow, { color: toneColor }]}>{step.icon}</Text>
        </View>
        <View style={styles.dummyMeta}>
          <Text style={[styles.dummyTitle, { color: colors.white }]}>Practice photo</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: toneColor }]} />
            <Text style={[styles.dummyBody, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.74)' }]}>
              Status: {dummyStatus}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.hint, { color: isNightMode ? 'rgba(245,247,250,0.76)' : 'rgba(249,250,251,0.8)' }]}>{step.helper}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setStepIndex((value) => value + 1)}
        style={({ pressed }) => [
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
          pressed && styles.practiceButtonPressed,
        ]}
      >
        <Text style={[styles.practiceButtonLabel, { color: step.cardTone === 'skip' ? colors.white : '#08111D' }]}>{step.actionLabel}</Text>
      </Pressable>

      {/* Step indicator dots */}
      <View style={styles.dotsRow}>
        {PRACTICE_STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === stepIndex
                  ? toneColor
                  : (isNightMode ? 'rgba(245,247,250,0.2)' : 'rgba(249,250,251,0.3)'),
                width: i === stepIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
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
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  completeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  completeBadgeIcon: {
    color: '#08111D',
    fontFamily: typography.bold,
    fontSize: 22,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  dummyArrow: {
    fontFamily: typography.display,
    fontSize: 48,
    opacity: 0.5,
  },
  dummyMeta: {
    gap: 4,
  },
  dummyTitle: {
    fontFamily: typography.bold,
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  practiceButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  practiceButtonLabel: {
    fontFamily: typography.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
