import { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { triggerInteractionFeedback } from '../../features/feedback/interaction-feedback';
import { formatBytes, formatCompactDate, formatRelativeDate } from '../../lib/format';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';
import type { FileItem } from '../../types/file-item';

const { width } = Dimensions.get('window');
const SWIPE_TRIGGER_DISTANCE = Math.max(72, width * 0.18);
const SWIPE_ESCAPE_DISTANCE = Math.max(32, width * 0.08);
const SWIPE_VELOCITY_TRIGGER = 820;
const SWIPE_VISUAL_LIMIT = width * 0.34;
const SWIPE_COMPLETE_DISTANCE = width * 1.05;

type FileCardProps = {
  current: FileItem | null;
  nextItems: FileItem[];
  disabled?: boolean;
  pendingAction?: 'delete' | 'move' | null;
  showHints?: boolean;
  onPress: () => void;
  onKeepGesture: () => void;
  onDeleteGesture: () => void;
  onOpenSecondaryActions?: () => void;
};

function clamp(value: number, min: number, max: number): number {
  'worklet';

  return Math.min(Math.max(value, min), max);
}

function OverlayChip({ label }: { label: string }) {
  return (
    <View style={styles.overlayChip}>
      <Text style={styles.overlayChipLabel}>{label}</Text>
    </View>
  );
}

function FileCardComponent({
  current,
  nextItems,
  disabled = false,
  pendingAction = null,
  showHints = true,
  onPress,
  onKeepGesture,
  onDeleteGesture,
  onOpenSecondaryActions,
}: FileCardProps) {
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const soundEnabled = useAppStore((state) => state.settings.soundEnabled);
  const hapticsEnabled = useAppStore((state) => state.settings.hapticsEnabled);
  const { colors, isNightMode } = useAppTheme();
  const translateX = useSharedValue(0);
  const thresholdCrossed = useSharedValue(false);
  const shimmerOpacity = useSharedValue(0.2);
  const pendingBadgeScale = useSharedValue(1);
  const pendingBadgeOpacity = useSharedValue(0);
  const longPressTriggered = useRef(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    translateX.value = 0;
    thresholdCrossed.value = false;
    longPressTriggered.current = false;
  }, [current?.id, thresholdCrossed, translateX]);

  useEffect(() => {
    setImageLoaded(false);
  }, [current?.id]);

  useEffect(() => {
    if (imageLoaded) {
      shimmerOpacity.value = withTiming(0, {
        duration: 180,
      });
      return;
    }

    shimmerOpacity.value = withRepeat(
      withTiming(0.58, {
        duration: 850,
      }),
      -1,
      true
    );
  }, [imageLoaded, shimmerOpacity]);

  useEffect(() => {
    if (!pendingAction) {
      pendingBadgeOpacity.value = withTiming(0, { duration: 120 });
      pendingBadgeScale.value = 1;
      return;
    }

    if (!animationsEnabled) {
      pendingBadgeOpacity.value = 1;
      pendingBadgeScale.value = 1;
      return;
    }

    pendingBadgeOpacity.value = withTiming(1, { duration: 140 });
    pendingBadgeScale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 420 }), withTiming(0.98, { duration: 420 })),
      -1,
      false
    );
  }, [animationsEnabled, pendingAction, pendingBadgeOpacity, pendingBadgeScale]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = animationsEnabled ? `${translateX.value / 18}deg` : '0deg';

    return {
      transform: [{ translateX: translateX.value }, { rotate }],
    };
  });

  const deleteTintStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(Math.abs(Math.min(translateX.value, 0)) / SWIPE_VISUAL_LIMIT, 1)) * 0.48,
  }));

  const keepTintStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(Math.max(translateX.value, 0) / SWIPE_VISUAL_LIMIT, 1)) * 0.48,
  }));

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const pendingBadgeStyle = useAnimatedStyle(() => ({
    opacity: pendingBadgeOpacity.value,
    transform: [{ scale: pendingBadgeScale.value }],
  }));

  const finishSwipe = (direction: 'left' | 'right') => {
    'worklet';

    const completeGesture = direction === 'left' ? onDeleteGesture : onKeepGesture;

    if (!animationsEnabled) {
      translateX.value = 0;
      runOnJS(completeGesture)();
      return;
    }

    translateX.value = withTiming(direction === 'left' ? -SWIPE_COMPLETE_DISTANCE : SWIPE_COMPLETE_DISTANCE, { duration: 180 }, (finished) => {
      if (!finished) {
        return;
      }

      translateX.value = 0;
      thresholdCrossed.value = false;
      runOnJS(completeGesture)();
    });
  };

  const gesture = Gesture.Pan()
    .enabled(Boolean(current) && !disabled)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const clampedTranslation = clamp(event.translationX, -SWIPE_VISUAL_LIMIT, SWIPE_VISUAL_LIMIT);
      translateX.value = clampedTranslation;

      const crossedThreshold = Math.abs(clampedTranslation) >= SWIPE_TRIGGER_DISTANCE;
      if (crossedThreshold && !thresholdCrossed.value) {
        thresholdCrossed.value = true;
        runOnJS(triggerInteractionFeedback)('swipe_threshold', hapticsEnabled);
      }

      if (!crossedThreshold && thresholdCrossed.value) {
        thresholdCrossed.value = false;
      }
    })
    .onEnd((event) => {
      const absTranslationX = Math.abs(event.translationX);
      const absVelocityX = Math.abs(event.velocityX);
      const hasIntentionalVelocity = absTranslationX >= SWIPE_ESCAPE_DISTANCE && absVelocityX >= SWIPE_VELOCITY_TRIGGER;
      const crossedTriggerDistance = absTranslationX >= SWIPE_TRIGGER_DISTANCE;

      if (crossedTriggerDistance || hasIntentionalVelocity) {
        const direction = event.translationX < 0 || (event.translationX === 0 && event.velocityX < 0) ? 'left' : 'right';
        finishSwipe(direction);
        return;
      }

      thresholdCrossed.value = false;
      translateX.value = withSpring(0);
    });

  if (!current) {
    return <View style={[styles.placeholder, { backgroundColor: isNightMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)' }]} />;
  }

  return (
    <View style={styles.stackWrap}>
      {nextItems.slice(0, 2).reverse().map((item, index) => (
        <View key={item.id} style={[styles.peekCard, { backgroundColor: colors.stageCard }, index === 0 ? styles.peekBack : styles.peekFront]}>
          <Image source={{ uri: item.previewUri }} style={styles.peekImage} resizeMode="cover" />
        </View>
      ))}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, { backgroundColor: colors.stageCard }, cardAnimatedStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${current.name}, ${current.bucketType}, ${current.isNewSinceLastScan ? 'new since last scan, ' : ''}tap for preview`}
            android_disableSound={!soundEnabled}
            delayLongPress={280}
            disabled={disabled}
            onLongPress={
              onOpenSecondaryActions
                ? () => {
                    longPressTriggered.current = true;
                    onOpenSecondaryActions();
                  }
                : undefined
            }
            onPress={() => {
              if (longPressTriggered.current) {
                longPressTriggered.current = false;
                return;
              }

              onPress();
            }}
            style={styles.pressable}
          >
            <Image source={{ uri: current.previewUri }} style={styles.image} resizeMode="cover" onLoadEnd={() => setImageLoaded(true)} />
            {!imageLoaded ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.skeleton,
                  {
                    backgroundColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                  },
                  skeletonStyle,
                ]}
              />
            ) : null}
            <Animated.View pointerEvents="none" style={[styles.tint, styles.deleteTint, deleteTintStyle]} />
            <Animated.View pointerEvents="none" style={[styles.tint, styles.keepTint, keepTintStyle]} />
            {pendingAction ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.pendingBadge,
                  {
                    backgroundColor: pendingAction === 'delete' ? 'rgba(231,111,81,0.92)' : 'rgba(76,151,232,0.92)',
                  },
                  pendingBadgeStyle,
                ]}
              >
                <Text style={styles.pendingBadgeLabel}>{pendingAction === 'delete' ? 'Deleting...' : 'Moving...'}</Text>
              </Animated.View>
            ) : null}

            <View style={styles.infoStackLeft}>
              <OverlayChip label={current.albumTitle ?? 'Library'} />
              {current.isNewSinceLastScan ? <OverlayChip label="New since last scan" /> : null}
            </View>
            <View style={styles.infoStackRight}>
              <OverlayChip label={formatBytes(current.sizeBytes)} />
              <OverlayChip label={formatRelativeDate(current.createdAt)} />
              {onOpenSecondaryActions ? (
                <Pressable
                  accessibilityLabel="Open secondary actions"
                  accessibilityRole="button"
                  android_disableSound={!soundEnabled}
                  disabled={disabled}
                  hitSlop={10}
                  onPress={onOpenSecondaryActions}
                  style={[styles.overflowButton, { backgroundColor: isNightMode ? 'rgba(2,5,10,0.76)' : 'rgba(8,12,20,0.62)' }]}
                >
                  <Text style={[styles.overflowButtonLabel, { color: colors.white }]}>More</Text>
                </Pressable>
              ) : null}
            </View>

            {showHints ? (
              <View style={styles.hintRow}>
                <Text style={styles.hintLeft}>Delete</Text>
                <Text style={styles.hintRight}>Keep</Text>
              </View>
            ) : null}

            <View style={[styles.metaStrip, { backgroundColor: isNightMode ? 'rgba(2,5,10,0.64)' : 'rgba(8,12,20,0.58)' }]}>
              <View style={styles.metaTextWrap}>
                <Text style={[styles.fileName, { color: colors.white }]} numberOfLines={1}>
                  {current.name}
                </Text>
                <Text style={[styles.fileMeta, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.76)' }]}>
                  {formatCompactDate(current.createdAt)} / {current.albumTitle ?? 'Unsorted folder'}
                </Text>
              </View>
              <Text style={[styles.bucket, { color: colors.white, backgroundColor: isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)' }]}>
                {current.bucketType}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export const FileCard = memo(FileCardComponent);

const styles = StyleSheet.create({
  stackWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 420,
  },
  placeholder: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  peekCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  peekBack: {
    transform: [{ scale: 0.92 }, { translateY: 26 }],
    opacity: 0.26,
  },
  peekFront: {
    transform: [{ scale: 0.96 }, { translateY: 14 }],
    opacity: 0.46,
  },
  peekImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...(shadows.card as object),
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  deleteTint: {
    backgroundColor: 'rgba(231,111,81,0.56)',
  },
  keepTint: {
    backgroundColor: 'rgba(46,194,126,0.56)',
  },
  infoStackLeft: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    gap: spacing.xs,
  },
  infoStackRight: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  overlayChip: {
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,12,20,0.58)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  overlayChipLabel: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 12,
  },
  pendingBadge: {
    position: 'absolute',
    top: '50%',
    left: spacing.lg,
    right: spacing.lg,
    marginTop: -22,
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pendingBadgeLabel: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  overflowButton: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  overflowButtonLabel: {
    fontFamily: typography.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hintRow: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 94,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hintLeft: {
    color: 'rgba(249,250,251,0.9)',
    fontFamily: typography.bold,
    fontSize: 13,
    backgroundColor: 'rgba(231,111,81,0.22)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  hintRight: {
    color: 'rgba(249,250,251,0.9)',
    fontFamily: typography.bold,
    fontSize: 13,
    backgroundColor: 'rgba(46,194,126,0.22)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  metaStrip: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaTextWrap: {
    flex: 1,
  },
  fileName: {
    fontFamily: typography.bold,
    fontSize: 16,
  },
  fileMeta: {
    fontFamily: typography.body,
    fontSize: 13,
  },
  bucket: {
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'capitalize',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
