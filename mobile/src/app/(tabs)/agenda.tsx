import { Pressable, StyleSheet, View } from 'react-native';
import { Moon } from 'lucide-react-native';
import { DAYS, FULL_DAYS, NOW, PROS, SERVICES, TODAY } from '../../data/mock';
import { hhmm, initials } from '../../lib/format';
import { allAppts } from '../../lib/selectors';
import { Screen } from '../../components/Screen';
import { Avatar, Btn, Card, Eyebrow, H1, Hatch, Segmented, T, s } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

const HOUR = 64, WEEK_HOUR = 44, HOURS = 12, START = 480;

export default function Agenda() {
  const st = useStore();
  const { agendaDay: day, agendaView: view } = st.s;
  const all = allAppts(st.s);
  const dayAppts = all.filter(a => a.day === day);
  const isDay = view === 'Dia';
  const count = isDay ? dayAppts.filter(a => !a.cancelled).length + ' atendimentos' : all.filter(a => !a.cancelled).length + ' atendimentos na semana';

  return (
    <Screen>
      <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
        <View style={[s.row, { alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }]}>
          <View><Eyebrow style={{ marginBottom: 6 }}>STUDIO AURORA</Eyebrow><H1>Agenda</H1></View>
          <Segmented options={['Dia', 'Semana'] as const} value={view} onChange={v => st.setAgenda({ agendaView: v })} flex={false} padV={0} style={{ height: 36 }} />
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 14, marginBottom: 10 }]}>
          <T size={15} w={600} color={C.title}>{isDay ? FULL_DAYS[day] : '26 out – 1 nov'}</T>
          <T size={11} color={C.muted}>{count}</T>
        </View>
        <View style={[s.row, { gap: 4 }]}>
          {DAYS.map((d, i) => {
            const sel = i === day, has = all.some(a => a.day === i && !a.cancelled);
            return (
              <Btn key={i} onPress={() => st.setAgenda({ agendaDay: i })} pressedStyle={{}} style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 8, paddingBottom: 7, borderRadius: 10, backgroundColor: sel ? C.violetSoft : 'transparent', opacity: i === 6 ? 0.45 : 1 }}>
                <T size={10} color={sel ? C.violetText : C.muted} lh={1.3}>{d[0]}</T>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: i === TODAY ? C.primary : 'transparent' }}>
                  <T size={16} w={600} lh={1.2} color={i === TODAY ? '#fff' : sel ? C.violetText : C.strong}>{d[1]}</T>
                </View>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: has ? (sel ? C.primary : C.emptyIcon) : 'transparent' }} />
              </Btn>
            );
          })}
        </View>
      </View>

      {isDay ? <DayGrid day={day} appts={dayAppts} /> : <WeekGrid all={all} />}

      <View style={[s.row, { flexWrap: 'wrap', columnGap: 16, rowGap: 8, paddingTop: 14, paddingHorizontal: 18 }]}>
        {SERVICES.map(x => (
          <View key={x.id} style={[s.row, { gap: 6 }]}>
            <View style={{ width: 7, height: 7, borderRadius: 3, backgroundColor: x.color }} />
            <T size={11} color={C.body}>{x.name}</T>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function DayGrid({ day, appts }: { day: number; appts: ReturnType<typeof allAppts> }) {
  const st = useStore();
  return (
    <Card style={{ marginTop: 12, marginHorizontal: 12, overflow: 'hidden' }}>
      <View style={[s.row, { borderBottomWidth: 1, borderColor: '#e9ebef', alignItems: 'stretch' }]}>
        <View style={{ width: 38, alignItems: 'center', justifyContent: 'center' }}><T size={9} color={C.faint}>GMT-3</T></View>
        {PROS.map(p => (
          <View key={p.id} style={styles.colHead}>
            <Avatar label={initials(p.name)} size={26} radius={13} font={9} bg={p.color + '13'} fg={p.color} />
            <T size={11} w={500} color={C.label} style={{ marginTop: 5 }} lh={1.3}>{p.first}</T>
          </View>
        ))}
      </View>

      {day === 6 ? (
        <View style={{ paddingVertical: 50, paddingHorizontal: 20, alignItems: 'center' }}>
          <Moon size={28} color={C.emptyIcon} style={{ marginBottom: 10 }} />
          <T size={13} color={C.muted}>Fechado aos domingos.</T>
        </View>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 38, height: HOUR * HOURS }}>
            {Array.from({ length: HOURS }, (_, i) => (
              <T key={i} size={9} color={C.faint} lh={1.2} style={{ position: 'absolute', right: 6, top: i === 0 ? 3 : i * HOUR - 6 }}>{hhmm(START + i * 60)}</T>
            ))}
          </View>
          {PROS.map(p => (
            <View key={p.id} style={styles.col}>
              {Array.from({ length: HOURS }, (_, i) => {
                const h = START + i * 60;
                const hatched = (day === 5 && h >= 17 * 60) || h === 720;
                const past = day < TODAY || (day === TODAY && h + 60 <= NOW);
                return (
                  <Pressable key={i} accessibilityLabel="Agendar" disabled={hatched || past}
                    onPress={() => st.openNew({ pro: p.id, day, slot: h })}
                    style={({ pressed }) => [styles.cell, past && !hatched && { backgroundColor: '#fafbfc' }, pressed && { backgroundColor: '#f7f0ff' }]}>
                    {hatched && <Hatch />}
                  </Pressable>
                );
              })}
              {appts.filter(a => a.pro === p.id).map(a => (
                <Btn key={a.id} onPress={() => st.openDetail(a.id)}
                  style={[styles.event, { top: (a.start - START) / 60 * HOUR, height: a.dur / 60 * HOUR - 2, borderLeftColor: a.color, backgroundColor: a.color + '14', opacity: a.cancelled ? 0.4 : 1 }]}>
                  <T size={10} w={600} color={a.color} numberOfLines={1} style={styles.noShrink}>{a.clientShort}</T>
                  <T size={9} color={a.color} numberOfLines={1} style={styles.noShrink}>{a.svcName}</T>
                  <T size={9} color={a.color} style={[styles.noShrink, { opacity: 0.75 }]}>{a.time}</T>
                </Btn>
              ))}
            </View>
          ))}
          {day === TODAY && (
            <View pointerEvents="none" style={[styles.now, { top: (NOW - START) / 60 * HOUR }]}>
              <View style={styles.nowDot} />
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

function WeekGrid({ all }: { all: ReturnType<typeof allAppts> }) {
  const st = useStore();
  return (
    <>
      <Card style={{ marginTop: 12, marginHorizontal: 12, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 30, height: WEEK_HOUR * HOURS }}>
            {Array.from({ length: HOURS }, (_, i) => (
              <T key={i} size={9} color={C.faint} lh={1.2} style={{ position: 'absolute', right: 4, top: i === 0 ? 3 : i * WEEK_HOUR - 6 }}>{String(8 + i)}</T>
            ))}
          </View>
          {DAYS.map((_, i) => (
            <Pressable key={i} onPress={() => st.setAgenda({ agendaDay: i, agendaView: 'Dia' })} accessibilityLabel={'Ver ' + DAYS[i][2]}
              style={[styles.weekCol, { backgroundColor: i === TODAY ? '#fcf8ff' : i === 6 ? '#fafbfc' : 'transparent' }]}>
              {all.filter(a => a.day === i).map(a => (
                <View key={a.id} style={{
                  position: 'absolute', top: (a.start - START) / 60 * WEEK_HOUR, height: a.dur / 60 * WEEK_HOUR - 2,
                  left: `${PROS.findIndex(p => p.id === a.pro) * 33 + 2}%`, width: '30%', borderRadius: 3,
                  backgroundColor: a.color, opacity: a.cancelled ? 0.3 : 0.85,
                }} />
              ))}
            </Pressable>
          ))}
        </View>
      </Card>
      <T size={11} color={C.muted} style={{ marginTop: 10, marginHorizontal: 18 }}>Toque em um dia para ver os atendimentos.</T>
    </>
  );
}

const styles = StyleSheet.create({
  colHead: { flex: 1, minWidth: 0, paddingTop: 10, paddingBottom: 9, paddingHorizontal: 3, alignItems: 'center', borderLeftWidth: 1, borderColor: '#eef0f3' },
  col: { flex: 1, minWidth: 0, height: HOUR * HOURS, borderLeftWidth: 1, borderColor: '#eef0f3' },
  cell: { height: HOUR, borderBottomWidth: 1, borderColor: '#f1f2f5', overflow: 'hidden' },
  event: { position: 'absolute', left: 3, right: 3, borderLeftWidth: 3, borderRadius: 5, gap: 1, overflow: 'hidden', paddingVertical: 5, paddingHorizontal: 5, zIndex: 2 },
  now: { position: 'absolute', left: 34, right: 0, height: 2, backgroundColor: C.primary, zIndex: 4 },
  nowDot: { position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  noShrink: { flexShrink: 0 },
  weekCol: { flex: 1, height: WEEK_HOUR * HOURS, borderLeftWidth: 1, borderColor: '#eef0f3' },
});
