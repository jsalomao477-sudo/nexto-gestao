import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

// Scrollable tab screen that starts below the status bar.
export function Screen({ children, contentStyle, bg = C.bg }: { children: ReactNode; contentStyle?: StyleProp<ViewStyle>; bg?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={[{ paddingTop: insets.top, paddingBottom: 24 }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  );
}
