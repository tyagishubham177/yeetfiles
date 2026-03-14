import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type ZoomablePreviewImageProps = {
  uri: string;
  height?: number;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ZoomablePreviewImage({ uri, height = 420 }: ZoomablePreviewImageProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleRef = useRef(1);
  const pinchStartScaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    scaleRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
  }, [scale, translateX, translateY, uri]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin(() => {
          pinchStartScaleRef.current = scaleRef.current;
        })
        .onUpdate((event) => {
          const nextScale = clamp(pinchStartScaleRef.current * event.scale, MIN_SCALE, MAX_SCALE);
          scale.setValue(nextScale);
        })
        .onEnd(() => {
          const flattened = (scale as unknown as { __getValue?: () => number }).__getValue?.() ?? scaleRef.current;
          const nextScale = clamp(flattened, MIN_SCALE, MAX_SCALE);
          scaleRef.current = nextScale;

          if (nextScale <= MIN_SCALE + 0.01) {
            scaleRef.current = 1;
            offsetRef.current = { x: 0, y: 0 };
            Animated.parallel([
              Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
              Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            ]).start();
            return;
          }

          Animated.spring(scale, {
            toValue: nextScale,
            useNativeDriver: true,
          }).start();
        }),
    [scale, translateX, translateY]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(2)
        .onUpdate((event) => {
          if (scaleRef.current <= 1.01) {
            translateX.setValue(0);
            translateY.setValue(0);
            return;
          }

          const maxOffset = 120 * (scaleRef.current - 1);
          translateX.setValue(clamp(offsetRef.current.x + event.translationX, -maxOffset, maxOffset));
          translateY.setValue(clamp(offsetRef.current.y + event.translationY, -maxOffset, maxOffset));
        })
        .onEnd(() => {
          if (scaleRef.current <= 1.01) {
            return;
          }

          const nextX = (translateX as unknown as { __getValue?: () => number }).__getValue?.() ?? offsetRef.current.x;
          const nextY = (translateY as unknown as { __getValue?: () => number }).__getValue?.() ?? offsetRef.current.y;
          offsetRef.current = { x: nextX, y: nextY };
        }),
    [translateX, translateY]
  );

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
      <View style={styles.wrap}>
        <Animated.View
          style={[
            styles.imageWrap,
            { height },
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
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
