import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type AppLogoProps = {
  size?: number;
};

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Defs>
        <LinearGradient id="yeetfiles-logo-bg" x1="10" y1="8" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#F3B43F" />
          <Stop offset="0.52" stopColor="#E76F51" />
          <Stop offset="1" stopColor="#2F7EDB" />
        </LinearGradient>
      </Defs>
      <Rect x="8" y="8" width="80" height="80" rx="24" fill="url(#yeetfiles-logo-bg)" />
      <Rect x="24" y="22" width="33" height="42" rx="9" fill="rgba(255,255,255,0.22)" />
      <Path d="M45 22L57 34H45V22Z" fill="rgba(255,255,255,0.36)" />
      <Rect x="34" y="30" width="38" height="46" rx="10" fill="#F8FAFC" />
      <Path d="M58 30L72 44H58V30Z" fill="#D9E5F4" />
      <Path d="M36 69L50 52L44 45H52L61 32H72L58 52L65 59H56L48 69H36Z" fill="#0F172A" />
    </Svg>
  );
}
