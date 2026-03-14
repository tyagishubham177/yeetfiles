import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { typography } from '../../constants/ui-tokens';
import { useAppTheme } from '../../lib/theme';

type ProgressRingProps = {
  progress: number;
  reviewedCount: number;
};

export function ProgressRing({ progress, reviewedCount }: ProgressRingProps) {
  const { colors, isNightMode } = useAppTheme();
  const size = 82;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.max(0, Math.min(progress, 1));
  const dashOffset = circumference - safeProgress * circumference;

  return (
    <View style={styles.wrap}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isNightMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.progress}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
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
