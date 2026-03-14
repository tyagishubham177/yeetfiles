import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes, formatCompactDate } from '../../lib/format';
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
  showHints?: boolean;
  onPress: () => void;
  onKeepGesture: () => void;
  onDeleteGesture: () => void;
  onOpenSecondaryActions?: () => void;
};

function FileCardComponent({
  current,
  nextItems,
  disabled = false,
  showHints = true,
  onPress,
  onKeepGesture,
  onDeleteGesture,
  onOpenSecondaryActions,
}: FileCardProps) {
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const soundEnabled = useAppStore((state) => state.settings.soundEnabled);
  const { colors, isNightMode } = useAppTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const longPressTriggered = useRef(false);
  const interactionLocked = useRef(false);
  const rotate = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: animationsEnabled ? ['-12deg', '0deg', '12deg'] : ['0deg', '0deg', '0deg'],
    extrapolate: 'clamp',
  });

  const deleteTintOpacity = translateX.interpolate({
    inputRange: [-SWIPE_VISUAL_LIMIT, -SWIPE_TRIGGER_DISTANCE, 0],
    outputRange: [0.46, 0.26, 0],
    extrapolate: 'clamp',
  });

  const keepTintOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_TRIGGER_DISTANCE, SWIPE_VISUAL_LIMIT],
    outputRange: [0, 0.26, 0.46],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
    interactionLocked.current = false;
    longPressTriggered.current = false;
  }, [current?.id, translateX]);

  const finishSwipe = (direction: 'left' | 'right', onComplete: () => void) => {
    interactionLocked.current = true;

    if (!animationsEnabled) {
      translateX.setValue(0);
      interactionLocked.current = false;
      onComplete();
      return;
    }

    Animated.timing(translateX, {
      toValue: direction === 'left' ? -SWIPE_COMPLETE_DISTANCE : SWIPE_COMPLETE_DISTANCE,
      duration: 170,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      interactionLocked.current = false;
      onComplete();
    });
  };

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(Boolean(current) && !disabled)
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
          if (interactionLocked.current) {
            return;
          }

          const clampedTranslation = Math.max(Math.min(event.translationX, SWIPE_VISUAL_LIMIT), -SWIPE_VISUAL_LIMIT);
          translateX.setValue(clampedTranslation);
        })
        .onEnd((event) => {
          if (interactionLocked.current) {
            return;
          }

          const absTranslationX = Math.abs(event.translationX);
          const absVelocityX = Math.abs(event.velocityX);
          const hasIntentionalVelocity = absTranslationX >= SWIPE_ESCAPE_DISTANCE && absVelocityX >= SWIPE_VELOCITY_TRIGGER;
          const crossedTriggerDistance = absTranslationX >= SWIPE_TRIGGER_DISTANCE;

          if (crossedTriggerDistance || hasIntentionalVelocity) {
            const direction = event.translationX < 0 || (event.translationX === 0 && event.velocityX < 0) ? 'left' : 'right';
            finishSwipe(direction, direction === 'left' ? onDeleteGesture : onKeepGesture);
            return;
          }

          if (!animationsEnabled) {
            translateX.setValue(0);
            return;
          }

          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }),
    [animationsEnabled, current, disabled, onDeleteGesture, onKeepGesture, translateX]
  );

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
        <Animated.View style={[styles.card, { backgroundColor: colors.stageCard, transform: [{ translateX }, { rotate }] }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${current.name}, ${current.bucketType}, ${current.isNewSinceLastScan ? 'new since last scan, ' : ''}tap for preview`}
            android_disableSound={!soundEnabled}
            delayLongPress={280}
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
            <Image source={{ uri: current.previewUri }} style={styles.image} resizeMode="cover" />
            <Animated.View pointerEvents="none" style={[styles.tint, styles.deleteTint, { opacity: deleteTintOpacity }]} />
            <Animated.View pointerEvents="none" style={[styles.tint, styles.keepTint, { opacity: keepTintOpacity }]} />
            {onOpenSecondaryActions ? (
              <Pressable
                accessibilityLabel="Open secondary actions"
                accessibilityRole="button"
                android_disableSound={!soundEnabled}
                hitSlop={10}
                onPress={onOpenSecondaryActions}
                style={[styles.overflowButton, { backgroundColor: isNightMode ? 'rgba(2,5,10,0.72)' : 'rgba(8,12,20,0.58)' }]}
              >
                <Text style={[styles.overflowButtonLabel, { color: colors.white }]}>More</Text>
              </Pressable>
            ) : null}
            {showHints ? (
              <View style={styles.hintRow}>
                <Text style={styles.hintLeft}>Delete</Text>
                <Text style={styles.hintRight}>Keep</Text>
              </View>
            ) : null}
            {current.isNewSinceLastScan ? (
              <View style={[styles.newBadge, { backgroundColor: isNightMode ? 'rgba(217,162,59,0.82)' : 'rgba(243,180,63,0.9)' }]}>
                <Text style={styles.newBadgeLabel}>New since last scan</Text>
              </View>
            ) : null}
            <View style={[styles.metaStrip, { backgroundColor: isNightMode ? 'rgba(2,5,10,0.62)' : 'rgba(8,12,20,0.55)' }]}>
              <View style={styles.metaTextWrap}>
                <Text style={[styles.fileName, { color: colors.white }]} numberOfLines={1}>
                  {current.name}
                </Text>
                <Text style={[styles.fileMeta, { color: isNightMode ? 'rgba(245,247,250,0.68)' : 'rgba(249,250,251,0.76)' }]}>
                  {formatCompactDate(current.createdAt)} / {formatBytes(current.sizeBytes)}
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
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  deleteTint: {
    backgroundColor: 'rgba(231,111,81,0.56)',
  },
  keepTint: {
    backgroundColor: 'rgba(46,194,126,0.56)',
  },
  overflowButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,12,20,0.58)',
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
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
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
  newBadge: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(243,180,63,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  newBadgeLabel: {
    color: '#101418',
    fontFamily: typography.bold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaStrip: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(8,12,20,0.55)',
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
