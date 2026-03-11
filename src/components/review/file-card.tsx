import { memo } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, shadows, spacing, typography } from '../../constants/ui-tokens';
import { formatBytes, formatCompactDate } from '../../lib/format';
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
};

function FileCardComponent({
  current,
  nextItems,
  disabled = false,
  showHints = true,
  onPress,
  onKeepGesture,
  onDeleteGesture,
}: FileCardProps) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
  }));

  const tintStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ['rgba(231,111,81,0.32)', 'rgba(0,0,0,0)', 'rgba(46,194,126,0.32)']
    );

    return {
      backgroundColor,
      opacity: interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0, 1]),
    };
  });

  const gesture = Gesture.Pan()
    .enabled(Boolean(current) && !disabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = interpolate(event.translationX, [-width, 0, width], [-12, 0, 12]);
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width * 1.05, { duration: 180 }, (finished) => {
          if (finished) {
            translateX.value = 0;
            rotate.value = 0;
            runOnJS(onKeepGesture)();
          }
        });
        return;
      }

      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width * 0.25, { duration: 140 }, () => {
          translateX.value = withSpring(0);
          rotate.value = withSpring(0);
        });
        runOnJS(onDeleteGesture)();
        return;
      }

      translateX.value = withSpring(0);
      rotate.value = withSpring(0);
    });

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
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable onPress={onPress} style={styles.pressable}>
            <Image source={{ uri: current.previewUri }} style={styles.image} resizeMode="cover" />
            <Animated.View pointerEvents="none" style={[styles.tint, tintStyle]} />
            {showHints ? (
              <View style={styles.hintRow}>
                <Text style={styles.hintLeft}>Delete</Text>
                <Text style={styles.hintRight}>Keep</Text>
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
