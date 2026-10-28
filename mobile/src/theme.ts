// Nexo panel palette, as used by the design.
export const C = {
  bg: '#f7f8fa',
  white: '#fff',
  text: '#24252b',
  heading: '#202128',
  title: '#262830',
  body: '#626672',
  muted: '#737785',
  subtle: '#8a8e98',
  faint: '#9599a2',
  label: '#4f5260',
  strong: '#33343e',
  value: '#22242b',
  secondary: '#6c707c',
  eyebrow: '#727582',
  border: '#e6e7ec',
  borderSoft: '#eceef2',
  borderInput: '#e3e3eb',
  borderButton: '#dedfe6',
  primary: '#7435d5',
  primaryPressed: '#6024be',
  primaryDisabled: '#c4b5e8',
  violet: '#7c3aed',
  violetText: '#7132ce',
  violetSoft: '#f1ebfb',
  violetBorder: '#c9b3e5',
  chipBorder: '#e7dcef',
  segmentBg: '#eef0f3',
  panel: '#f8f9fb',
  panelBorder: '#e8eaf0',
  danger: '#ca6464',
  warning: '#b6683e',
  success: '#399470',
  emptyIcon: '#c5b6d0',
  backdrop: 'rgba(24,24,27,0.32)',
};

export const F = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
} as const;
export type Weight = keyof typeof F;

// Diagonal hatch used for closed hours and breaks.
export const HATCH = { a: '#f1edf3', b: '#faf7fc', border: '#e7dced' };
