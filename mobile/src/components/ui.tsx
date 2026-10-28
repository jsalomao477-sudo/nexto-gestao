import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
  Animated, BackHandler, Easing, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, Line, Path, Pattern, Rect } from 'react-native-svg';
import type { LucideProps } from 'lucide-react-native';
import { C, F, HATCH, type Weight } from '../theme';

export type IconType = ComponentType<LucideProps>;

type TProps = TextProps & {
  size?: number; w?: Weight; color?: string; ls?: number; lh?: number; tabular?: boolean; center?: boolean;
};

// Inter text. Letter spacing defaults to the design's -0.015em and line height to 1.5.
export function T({ size = 14, w = 400, color = C.text, ls, lh = 1.5, tabular, center, style, ...rest }: TProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[{
        fontFamily: F[w], fontSize: size, color, letterSpacing: ls ?? -0.015 * size, lineHeight: size * lh,
        fontVariant: tabular ? ['tabular-nums'] : undefined, textAlign: center ? 'center' : undefined, includeFontPadding: false,
      }, style]}
    />
  );
}

type BtnProps = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; pressedStyle?: StyleProp<ViewStyle> };

// Android gets the platform ripple on top of the pressed style.
const RIPPLE = { color: 'rgba(116,53,213,0.12)' };

export function Btn({ style, pressedStyle = { opacity: 0.7 }, ...rest }: BtnProps) {
  return <Pressable android_ripple={RIPPLE} {...rest} style={({ pressed }) => [style, pressed && pressedStyle]} />;
}

export function PrimaryButton({ label, icon: Icon, iconAfter, onPress, style, height = 48, size = 14, radius = 9, bg = C.primary }: {
  label: string; icon?: IconType; iconAfter?: IconType; onPress?: () => void; style?: StyleProp<ViewStyle>;
  height?: number; size?: number; radius?: number; bg?: string;
}) {
  const After = iconAfter;
  return (
    <Btn
      onPress={onPress}
      style={[s.row, { minHeight: height, borderRadius: radius, backgroundColor: bg, justifyContent: 'center', gap: 9, paddingHorizontal: 16 }, style]}
      pressedStyle={{ backgroundColor: bg === C.primary ? C.primaryPressed : bg }}
    >
      {Icon && <Icon size={size + 2} color="#fff" />}
      <T size={size} w={600} color="#fff">{label}</T>
      {After && <After size={size + 3} color="#fff" />}
    </Btn>
  );
}

export function OutlineButton({ label, icon: Icon, onPress, style, height = 44 }: {
  label: string; icon?: IconType; onPress?: () => void; style?: StyleProp<ViewStyle>; height?: number;
}) {
  return (
    <Btn onPress={onPress} style={[s.row, s.outline, { minHeight: height, justifyContent: 'center', gap: 8, paddingHorizontal: 14 }, style]} pressedStyle={{ backgroundColor: '#f7f5ff' }}>
      {Icon && <Icon size={15} color={C.label} />}
      <T size={13} w={600} color={C.label}>{label}</T>
    </Btn>
  );
}

export function Badge({ label, fg, bg, dot = true, size = 10, padV = 4, padH = 6, style }: {
  label: string; fg: string; bg: string; dot?: boolean; size?: number; padV?: number; padH?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.row, { gap: 4, paddingVertical: padV, paddingHorizontal: padH, borderRadius: 5, backgroundColor: bg, alignSelf: 'flex-start' }, style]}>
      {dot && <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: fg }} />}
      <T size={size} w={500} color={fg} lh={1.2} numberOfLines={1}>{label}</T>
    </View>
  );
}

// iOS-style segmented control on a grey track.
export function Segmented<V extends string>({ options, value, onChange, size = 12, padV = 8, style, flex = true }: {
  options: readonly V[]; value: V; onChange: (v: V) => void; size?: number; padV?: number; style?: StyleProp<ViewStyle>; flex?: boolean;
}) {
  return (
    <View style={[s.row, { backgroundColor: C.segmentBg, borderRadius: 9, padding: 3 }, style]}>
      {options.map(o => {
        const sel = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[{ paddingVertical: padV, paddingHorizontal: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' }, flex && { flex: 1 }, sel && s.segSel]}>
            <T size={size} w={500} color={sel ? C.heading : C.muted} lh={1.3}>{o}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

// Filled-violet selectable chips (payment methods, interaction kinds, filters).
export function Chips<V extends string>({ options, value, onChange, size = 12, padV = 8, padH = 11, gap = 7 }: {
  options: readonly V[]; value: V; onChange: (v: V) => void; size?: number; padV?: number; padH?: number; gap?: number;
}) {
  return (
    <View style={[s.row, { flexWrap: 'wrap', gap }]}>
      {options.map(o => {
        const sel = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={{ paddingVertical: padV, paddingHorizontal: padH, borderRadius: 6, borderWidth: 1, borderColor: sel ? C.violet : C.chipBorder, backgroundColor: sel ? C.violet : '#fff' }}>
            <T size={size} color={sel ? '#fff' : C.body} lh={1.3}>{o}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

// Text input with the panel's violet focus ring.
export function Input({ style, wrapStyle, bare, ...rest }: TextInputProps & { wrapStyle?: StyleProp<ViewStyle>; bare?: boolean }) {
  const [focus, setFocus] = useState(false);
  const field = (
    <TextInput
      placeholderTextColor="#a1a1aa"
      allowFontScaling={false}
      underlineColorAndroid="transparent"
      cursorColor={C.violet}
      selectionColor="rgba(124,58,237,0.3)"
      {...rest}
      onFocus={e => { setFocus(true); rest.onFocus?.(e); }}
      onBlur={e => { setFocus(false); rest.onBlur?.(e); }}
      style={[{ fontFamily: F[400], fontSize: 16, color: '#18181b', includeFontPadding: false, textAlignVertical: 'center' }, bare ? { padding: 0 } : s.input, !bare && focus && s.inputFocus, style as StyleProp<TextStyle>]}
    />
  );
  return wrapStyle ? <View style={wrapStyle}>{field}</View> : field;
}

export function Field({ label, children, size = 13, w = 500, color = C.label, gap = 7 }: {
  label: string; children: ReactNode; size?: number; w?: Weight; color?: string; gap?: number;
}) {
  return (
    <View style={{ gap }}>
      <T size={size} w={w} color={color}>{label}</T>
      {children}
    </View>
  );
}

export function Eyebrow({ children, color = C.eyebrow, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <T size={10} w={700} color={color} ls={1.25} lh={1.3} style={style}>{children}</T>;
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T size={26} w={600} color={C.heading} ls={-1} lh={1.3} style={style}>{children}</T>;
}

export function Card({ children, style, border = C.border }: { children: ReactNode; style?: StyleProp<ViewStyle>; border?: string }) {
  return <View style={[{ backgroundColor: '#fff', borderWidth: 1, borderColor: border, borderRadius: 12 }, style]}>{children}</View>;
}

export function IconTile({ icon: Icon, size = 26, iconSize = 15, bg, fg, radius = 7 }: {
  icon: IconType; size?: number; iconSize?: number; bg: string; fg: string; radius?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={iconSize} color={fg} />
    </View>
  );
}

export function Avatar({ label, size = 36, radius = 10, bg = '#f0edf6', fg = '#847397', font = 11 }: {
  label: string; size?: number; radius?: number; bg?: string; fg?: string; font?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T size={font} w={600} color={fg} lh={1.2}>{label}</T>
    </View>
  );
}

export function Empty({ icon: Icon, title, text, pad = 36 }: { icon: IconType; title: string; text: string; pad?: number }) {
  return (
    <View style={{ paddingVertical: pad, paddingHorizontal: 10, alignItems: 'center' }}>
      <Icon size={28} color={C.emptyIcon} />
      <T size={14} w={600} color={C.label} style={{ marginTop: 8, marginBottom: 4 }}>{title}</T>
      <T size={12} color={C.muted} center>{text}</T>
    </View>
  );
}

// 45° stripes, the design's "closed / break" fill.
export function Hatch({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="hatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={10} height={10} fill={HATCH.b} />
            <Line x1={2.5} y1={0} x2={2.5} y2={10} stroke={HATCH.a} strokeWidth={5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hatch)" />
      </Svg>
    </View>
  );
}

export function NexoMark({ size = 34, radius = 9 }: { size?: number; radius?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Rect width={40} height={40} rx={10} fill="#7c3aed" />
        <Path d="M12 28V12l16 16V12" fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={28} cy={12} r={3} fill="#d8c4ff" />
      </Svg>
    </View>
  );
}

export function Grabber() {
  return <View style={{ alignSelf: 'center', width: 38, height: 5, borderRadius: 5, backgroundColor: '#e1e3e8', marginBottom: 14 }} />;
}

// Bottom sheet over a dimmed backdrop. Stays mounted while it animates out.
export function Sheet({ visible, onClose, children, z = 40, maxHeight = '88%', height, padded = true, backdropCloses = true }: {
  visible: boolean; onClose: () => void; children: ReactNode; z?: number;
  maxHeight?: ViewStyle['maxHeight']; height?: ViewStyle['height']; padded?: boolean; backdropCloses?: boolean;
}) {
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;
  const last = useRef<ReactNode>(children);
  if (visible) last.current = children;

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: visible ? 280 : 200, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      .start(({ finished }) => { if (finished && !visible) setMounted(false); });
  }, [visible, anim]);

  // Android back button closes the sheet instead of leaving the screen.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!mounted) return null;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  return (
    <KeyboardAvoidingView behavior="padding" style={[StyleSheet.absoluteFill, { zIndex: z, justifyContent: 'flex-end' }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.backdrop, opacity: anim }]}>
        <Pressable accessibilityLabel="Fechar" style={StyleSheet.absoluteFill} onPress={backdropCloses ? onClose : undefined} />
      </Animated.View>
      <Animated.View style={[{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight, height, transform: [{ translateY }] }, padded && { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 40 }]}>
        {visible ? children : last.current}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  outline: { borderWidth: 1, borderColor: C.borderButton, borderRadius: 8, backgroundColor: '#fff' },
  segSel: { backgroundColor: '#fff', shadowColor: '#18181b', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  input: { borderWidth: 1, borderColor: C.borderInput, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff' },
  inputFocus: { borderColor: '#9f7aea', shadowColor: '#7c3aed', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } },
  divider: { height: 1, backgroundColor: C.borderSoft },
});
