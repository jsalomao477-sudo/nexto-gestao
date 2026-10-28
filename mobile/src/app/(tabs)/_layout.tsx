import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, LayoutDashboard, Plus, Users, Wallet } from 'lucide-react-native';
import { Btn, T, s, type IconType } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

// Início · Agenda · + · CRM · Financeiro. Avisos is a tab too, reached from the bell on Início.
const LEFT: [string, string, IconType][] = [['inicio', 'Início', LayoutDashboard], ['agenda', 'Agenda', CalendarDays]];
const RIGHT: [string, string, IconType][] = [['crm', 'CRM', Users], ['financeiro', 'Financeiro', Wallet]];

function TabBar({ state, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { openNew } = useStore();
  const current = state.routes[state.index].name;
  const item = ([name, label, Icon]: [string, string, IconType]) => {
    const on = current === name;
    const key = state.routes.find(r => r.name === name)?.key;
    return (
      <Btn key={name} onPress={() => key && navigateToTab(key)} pressedStyle={{ opacity: 0.6 }} accessibilityRole="tab" accessibilityState={{ selected: on }}
        style={[styles.tab, on && { backgroundColor: '#f6effd' }]}>
        <Icon size={20} color={on ? C.violet : C.subtle} />
        <T size={10} color={on ? C.violet : C.subtle} lh={1.2}>{label}</T>
      </Btn>
    );
  };
  return (
    <View style={[s.row, styles.bar, { paddingBottom: Math.max(insets.bottom - 4, 12) }]}>
      {LEFT.map(item)}
      <Btn onPress={() => openNew()} accessibilityLabel="Novo agendamento" style={styles.plus} pressedStyle={{ backgroundColor: C.primaryPressed }}>
        <Plus size={22} color="#fff" />
      </Btn>
      {RIGHT.map(item)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg }, animation: 'none' }}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="crm" />
      <Tabs.Screen name="financeiro" />
      <Tabs.Screen name="avisos" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { justifyContent: 'space-around', paddingTop: 8, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.98)', borderTopWidth: 1, borderColor: '#e8e9ed' },
  tab: { alignItems: 'center', gap: 4, minWidth: 58, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 7 },
  plus: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
});
