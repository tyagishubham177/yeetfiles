import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '../../constants/ui-tokens';

type ProgressRingProps = {
  progress: number;
  reviewedCount: number;
};

export function ProgressRing({ progress, reviewedCount }: ProgressRingProps) {
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
          stroke="rgba(255,255,255,0.12)"
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
        <Text style={styles.value}>{reviewedCount}</Text>
        <Text style={styles.label}>done</Text>
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
    color: colors.white,
    fontFamily: typography.display,
    fontSize: 22,
  },
  label: {
    color: 'rgba(249,250,251,0.78)',
    fontFamily: typography.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
