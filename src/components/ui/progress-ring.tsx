import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';
import { useAppStore } from '../../store/app-store';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  progress: number;
  reviewedCount: number;
};

export function ProgressRing({ progress, reviewedCount }: ProgressRingProps) {
  const { colors, isNightMode } = useAppTheme();
  const animationsEnabled = useAppStore((state) => state.settings.animationsEnabled);
  const size = 82;
  const strokeWidth = 8;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const safeProgress = Math.max(0, Math.min(progress, 1));

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animationsEnabled) {
      animatedProgress.value = withTiming(safeProgress, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = safeProgress;
    }
  }, [animatedProgress, animationsEnabled, safeProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - animatedProgress.value * circumference,
  }));

  return (
    <View style={styles.wrap}>
      {/* Outer glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            borderColor: safeProgress > 0
              ? (isNightMode ? 'rgba(76,151,232,0.12)' : 'rgba(60,145,230,0.16)')
              : 'transparent',
          },
        ]}
      />
      <Svg height={size} width={size}>
        <Defs>
          <LinearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentGradientStart} />
            <Stop offset="1" stopColor={colors.accentGradientEnd} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.value, { color: colors.white }]}>{reviewedCount}</Text>
        <Text style={[styles.label, { color: isNightMode ? 'rgba(245,247,250,0.7)' : 'rgba(249,250,251,0.78)' }]}>done</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  labelWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    fontFamily: typography.display,
    fontSize: 22,
  },
  label: {
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
