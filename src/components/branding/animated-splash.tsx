import { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type AnimatedSplashProps = {
  onComplete: () => void;
};

function ShardMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Defs>
        <LinearGradient id="splash-accent" x1="60" y1="24" x2="84" y2="46" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#E7EDF5" />
          <Stop offset="1" stopColor="#B3C4DA" />
        </LinearGradient>
      </Defs>
      <Path d="M24 48L40 48L51 35H35L24 48Z" fill="#F4F7FB" />
      <Path d="M33 72L50 72L74 42H57L46 55H37L33 72Z" fill="#F4F7FB" />
      <Path d="M59 42L77 42L85 31H67L59 42Z" fill="url(#splash-accent)" />
    </Svg>
  );
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const shardOpacity = useSharedValue(0);
  const shardScale = useSharedValue(0.7);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const ringRadius = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Phase 1: Shard mark animates in (0-500ms)
    shardOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    shardScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) });

    // Phase 2: Ring pulse radiates out (400-900ms)
    ringRadius.value = withDelay(
      350,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Phase 3: Text fades in (500-800ms)
    textOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // Phase 4: Everything fades out (1700-2200ms)
    fadeOut.value = withDelay(
      1700,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      })
    );
  }, [fadeOut, finish, ringRadius, shardOpacity, shardScale, textOpacity, textTranslateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));

  const shardContainerStyle = useAnimatedStyle(() => ({
    opacity: shardOpacity.value,
    transform: [{ scale: shardScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => {
    const size = interpolate(ringRadius.value, [0, 1], [80, 220]);

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: interpolate(ringRadius.value, [0, 0.3, 1], [0, 0.3, 0]),
      borderWidth: interpolate(ringRadius.value, [0, 1], [3, 1]),
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Ambient glow orbs that drift subtly
  const glowAStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shardOpacity.value, [0, 1], [0, 0.2]),
    transform: [{ scale: interpolate(ringRadius.value, [0, 1], [0.8, 1.2]) }],
  }));

  const glowBStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shardOpacity.value, [0, 1], [0, 0.12]),
    transform: [{ scale: interpolate(ringRadius.value, [0, 1], [1, 1.3]) }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Gradient Background */}
      <View style={styles.backgroundGradient} />

      {/* Ambient Glow Orbs */}
      <Animated.View style={[styles.glowOrbA, glowAStyle]} />
      <Animated.View style={[styles.glowOrbB, glowBStyle]} />

      {/* Expanding Ring Pulse */}
      <Animated.View style={[styles.ringPulse, ringStyle]} />

      {/* Shard Mark */}
      <Animated.View style={[styles.shardWrap, shardContainerStyle]}>
        <ShardMark size={120} />
      </Animated.View>

      {/* Brand Text */}
      <Animated.View style={[styles.textWrap, textStyle]}>
        <Animated.Text style={styles.brandName}>YeetFiles</Animated.Text>
        <Animated.Text style={styles.tagline}>Cleanup with momentum</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1220',
    // A subtle gradient feel via overlapping layers
  },
  glowOrbA: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(60, 145, 230, 0.18)',
    top: SCREEN_HEIGHT * 0.22,
    right: -40,
  },
  glowOrbB: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(243, 180, 63, 0.12)',
    bottom: SCREEN_HEIGHT * 0.25,
    left: -30,
  },
  ringPulse: {
    position: 'absolute',
    borderColor: 'rgba(244, 247, 251, 0.3)',
  },
  shardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#F4F7FB',
    letterSpacing: 1.5,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(244, 247, 251, 0.6)',
    letterSpacing: 0.5,
  },
});
