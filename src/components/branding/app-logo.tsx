import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type AppLogoProps = {
  size?: number;
};

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Defs>
        <LinearGradient id="yeetfiles-logo-bg" x1="12" y1="10" x2="84" y2="86" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#0B1220" />
          <Stop offset="1" stopColor="#17263B" />
        </LinearGradient>
        <LinearGradient id="yeetfiles-logo-accent" x1="60" y1="24" x2="84" y2="46" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#E7EDF5" />
          <Stop offset="1" stopColor="#B3C4DA" />
        </LinearGradient>
      </Defs>
      <Rect x="8" y="8" width="80" height="80" rx="24" fill="url(#yeetfiles-logo-bg)" />
      <Path d="M24 48L40 48L51 35H35L24 48Z" fill="#F4F7FB" />
      <Path d="M33 72L50 72L74 42H57L46 55H37L33 72Z" fill="#F4F7FB" />
      <Path d="M59 42L77 42L85 31H67L59 42Z" fill="url(#yeetfiles-logo-accent)" />
    </Svg>
  );
}
