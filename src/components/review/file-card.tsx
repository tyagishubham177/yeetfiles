import { memo, useMemo, useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { colors, radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes, formatCompactDate } from '../../lib/format';
import { useAppStore } from '../../store/app-store';
import type { FileItem } from '../../types/file-item';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.28;

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
  const translateX = useRef(new Animated.Value(0)).current;
  const longPressTriggered = useRef(false);
  const rotate = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: animationsEnabled ? ['-12deg', '0deg', '12deg'] : ['0deg', '0deg', '0deg'],
    extrapolate: 'clamp',
  });

  const tintOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });

  const tintColor = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: ['rgba(231,111,81,0.32)', 'rgba(0,0,0,0)', 'rgba(46,194,126,0.32)'],
    extrapolate: 'clamp',
  });

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(Boolean(current) && !disabled)
        .onUpdate((event) => {
          translateX.setValue(event.translationX);
        })
        .onEnd((event) => {
          if (event.translationX > SWIPE_THRESHOLD) {
            if (!animationsEnabled) {
              translateX.setValue(0);
              onKeepGesture();
              return;
            }

            Animated.timing(translateX, {
              toValue: width * 1.05,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              onKeepGesture();
            });
            return;
          }

          if (event.translationX < -SWIPE_THRESHOLD) {
            if (!animationsEnabled) {
              translateX.setValue(0);
              onDeleteGesture();
              return;
            }

            Animated.sequence([
              Animated.timing(translateX, {
                toValue: -width * 0.25,
                duration: 140,
                useNativeDriver: true,
              }),
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }),
            ]).start();
            onDeleteGesture();
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
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.stackWrap}>
      {nextItems.slice(0, 2).reverse().map((item, index) => (
        <View key={item.id} style={[styles.peekCard, index === 0 ? styles.peekBack : styles.peekFront]}>
          <Image source={{ uri: item.previewUri }} style={styles.peekImage} resizeMode="cover" />
        </View>
      ))}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, { transform: [{ translateX }, { rotate }] }]}>
          <Pressable
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
            <Animated.View pointerEvents="none" style={[styles.tint, { opacity: tintOpacity, backgroundColor: tintColor }]} />
            {onOpenSecondaryActions ? (
              <Pressable
                accessibilityLabel="Open secondary actions"
                accessibilityRole="button"
                android_disableSound={!soundEnabled}
                hitSlop={10}
                onPress={onOpenSecondaryActions}
                style={styles.overflowButton}
              >
                <Text style={styles.overflowButtonLabel}>More</Text>
              </Pressable>
            ) : null}
            {showHints ? (
              <View style={styles.hintRow}>
                <Text style={styles.hintLeft}>Delete</Text>
                <Text style={styles.hintRight}>Keep</Text>
              </View>
            ) : null}
            {current.isNewSinceLastScan ? (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeLabel}>New since last scan</Text>
              </View>
            ) : null}
            <View style={styles.metaStrip}>
              <View style={styles.metaTextWrap}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {current.name}
                </Text>
                <Text style={styles.fileMeta}>
                  {formatCompactDate(current.createdAt)} · {formatBytes(current.sizeBytes)}
                </Text>
              </View>
              <Text style={styles.bucket}>{current.bucketType}</Text>
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
    backgroundColor: colors.stageCard,
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
    backgroundColor: colors.stageCard,
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
    color: colors.white,
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
    color: colors.white,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  fileMeta: {
    color: 'rgba(249,250,251,0.76)',
    fontFamily: typography.body,
    fontSize: 13,
  },
  bucket: {
    color: colors.white,
    fontFamily: typography.medium,
    fontSize: 12,
    textTransform: 'capitalize',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
