import { Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type ZoomablePreviewImageProps = {
  uri: string;
  height?: number;
  onDismiss?: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DISMISS_THRESHOLD = 128;

function clamp(value: number, min: number, max: number): number {
  'worklet';

  return Math.min(Math.max(value, min), max);
}

export function ZoomablePreviewImage({ uri, height = 420, onDismiss }: ZoomablePreviewImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const dismissOffsetY = useSharedValue(0);

  const resetPreview = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    dismissOffsetY.value = withSpring(0);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      if (savedScale.value <= MIN_SCALE + 0.01) {
        resetPreview();
      }
    });

  const panGesture = Gesture.Pan()
    .minDistance(2)
    .onUpdate((event) => {
      if (scale.value > 1.02) {
        const maxOffset = 140 * (scale.value - 1);
        translateX.value = clamp(savedTranslateX.value + event.translationX, -maxOffset, maxOffset);
        translateY.value = clamp(savedTranslateY.value + event.translationY, -maxOffset, maxOffset);
        dismissOffsetY.value = 0;
        return;
      }

      translateX.value = event.translationX * 0.18;
      dismissOffsetY.value = Math.max(event.translationY, 0);
    })
    .onEnd(() => {
      if (scale.value > 1.02) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }

      if (dismissOffsetY.value >= DISMISS_THRESHOLD && onDismiss) {
        dismissOffsetY.value = withTiming(height, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        });
        return;
      }

      translateX.value = withSpring(0);
      dismissOffsetY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const clampedDismissRatio = clamp(dismissOffsetY.value / DISMISS_THRESHOLD, 0, 1);

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + dismissOffsetY.value },
        { scale: scale.value * (1 - clampedDismissRatio * 0.08) },
      ],
      opacity: 1 - clampedDismissRatio * 0.2,
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
      <View style={styles.wrap}>
        <Animated.View
          key={uri}
          style={[
            styles.imageWrap,
            {
              height,
            },
            animatedStyle,
          ]}
        >
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
