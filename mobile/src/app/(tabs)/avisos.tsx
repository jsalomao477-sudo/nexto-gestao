import { View } from 'react-native';
import { Bell, CalendarPlus, CalendarX, CircleCheck } from 'lucide-react-native';
import type { NotifIcon } from '../../data/mock';
import { Screen } from '../../components/Screen';
import { Btn, Eyebrow, H1, T, s, type IconType } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

const ICONS: Record<NotifIcon, IconType> = { 'calendar-plus': CalendarPlus, 'circle-check': CircleCheck, 'bell': Bell, 'calendar-x': CalendarX };

export default function Avisos() {
  const st = useStore();
  return (
    <Screen>
      <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
        <View style={[s.row, { alignItems: 'flex-end', justifyContent: 'space-between' }]}>
          <View><Eyebrow style={{ marginBottom: 6 }}>NOTIFICAÇÕES</Eyebrow><H1>Avisos</H1></View>
          <Btn onPress={st.markAllRead} style={{ paddingBottom: 4 }}><T size={12} w={600} color={C.primary}>Marcar todas como lidas</T></Btn>
        </View>
        <View style={{ marginTop: 10 }}>
          {st.s.notifs.map(n => {
            const Icon = ICONS[n.icon];
            return (
              <Btn key={n.id} onPress={() => { st.readNotif(n.id); st.openDetail(n.appt); }} style={[s.row, { gap: 12, alignItems: 'flex-start', paddingVertical: 18, borderBottomWidth: 1, borderColor: C.borderSoft }]}>
                <View style={{ padding: 9, borderRadius: 8, backgroundColor: n.read ? '#f4f4f6' : C.violetSoft }}><Icon size={17} color={n.read ? C.faint : C.primary} /></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T size={14} w={600} color={n.read ? C.label : C.heading} style={{ marginBottom: 2 }}>{n.title}</T>
                  <T size={13} color={C.body}>{n.text}</T>
                  <T size={11} color={C.faint} style={{ marginTop: 4 }}>{n.time}</T>
                </View>
                {!n.read && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.violet, marginTop: 8 }} />}
              </Btn>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
