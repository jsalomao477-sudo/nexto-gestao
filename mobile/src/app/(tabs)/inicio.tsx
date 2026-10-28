import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowUpRight, Bell, CalendarDays, Plus, Receipt, Store, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react-native';
import { TODAY } from '../../data/mock';
import { money } from '../../lib/format';
import { todaySummary } from '../../lib/selectors';
import { Screen } from '../../components/Screen';
import { Avatar, Btn, Card, Eyebrow, H1, IconTile, T, s, type IconType } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

function Metric({ label, icon, value, note, noteColor = C.eyebrow, accent }: {
  label: string; icon: IconType; value: string; note: string; noteColor?: string; accent?: boolean;
}) {
  return (
    <Card style={styles.metric} border={accent ? '#ded5ee' : C.border}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <T size={12} w={500} color={C.body}>{label}</T>
        <IconTile icon={icon} bg={accent ? C.violetSoft : '#f5f4f8'} fg={accent ? '#7143b3' : '#786b8c'} />
      </View>
      <T size={22} w={600} ls={-0.9} lh={1.2} tabular color={accent ? C.violet : C.value} style={{ marginTop: 12, marginBottom: 6 }} numberOfLines={1} adjustsFontSizeToFit>{value}</T>
      <T size={11} color={noteColor}>{note}</T>
    </Card>
  );
}

export default function Inicio() {
  const router = useRouter();
  const st = useStore();
  const { live, revenue, completed, ticket } = todaySummary(st.s);
  const unread = st.s.notifs.some(n => !n.read);
  const goAgenda = () => { st.setAgenda({ agendaDay: TODAY, agendaView: 'Dia' }); router.navigate('/agenda'); };
  const quick: [string, IconType, () => void][] = [
    ['Novo agendamento', CalendarDays, () => st.openNew()],
    ['Novo cliente', UserPlus, () => st.flash('Cadastro de cliente disponível no painel completo.')],
    ['Abrir CRM', Users, () => router.navigate('/crm')],
    ['Registrar venda', Receipt, () => st.flash('Registro de venda disponível no painel completo.')],
  ];

  return (
    <Screen>
      <View style={[s.row, { justifyContent: 'space-between', paddingTop: 6, paddingHorizontal: 18 }]}>
        <View style={[s.row, { gap: 9, minWidth: 0 }]}>
          <IconTile icon={Store} size={32} iconSize={17} radius={8} bg="#7c3aed16" fg={C.violet} />
          <View>
            <T size={12} w={700} lh={1.3}>Studio Aurora</T>
            <T size={11} color="#767987" lh={1.3}>Salão de beleza</T>
          </View>
        </View>
        <View style={[s.row, { gap: 6 }]}>
          <Btn onPress={() => router.navigate('/avisos')} accessibilityLabel="Avisos" style={styles.bell} pressedStyle={{ backgroundColor: C.violetSoft }}>
            <Bell size={20} color="#626674" />
            {unread && <View style={styles.dot} />}
          </Btn>
          <Avatar label="MC" size={32} radius={16} font={10} bg="#7C3AED13" fg="#7C3AED" />
        </View>
      </View>

      <View style={{ paddingTop: 22, paddingHorizontal: 18 }}>
        <Eyebrow style={{ marginBottom: 6 }}>SEU NEGÓCIO EM DIA</Eyebrow>
        <H1>Bom dia, Marina</H1>
        <T size={13} color={C.secondary} style={{ marginTop: 6 }}>Veja como está o seu negócio hoje.</T>

        <View style={styles.grid}>
          <Metric accent label="Faturamento" icon={Wallet} value={money(revenue)} note="Recebido hoje" noteColor="#39a17e" />
          <Metric label="Agendamentos" icon={CalendarDays} value={String(live.length)} note={completed + ' atendimentos concluídos'} />
          <Metric label="Ticket médio" icon={TrendingUp} value={money(ticket)} note="Atendimentos pagos" />
          <Metric label="Clientes atendidos" icon={Users} value={String(completed)} note="Pessoas que passaram por aqui" />
        </View>

        <Card style={{ overflow: 'hidden' }}>
          <View style={[s.row, { justifyContent: 'space-between', paddingTop: 18, paddingHorizontal: 18, paddingBottom: 8 }]}>
            <View>
              <View style={[s.row, { gap: 7 }]}>
                <T size={15} w={600} color={C.title}>Agenda de hoje</T>
                <View style={{ backgroundColor: '#f0eafa', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5 }}><T size={10} w={500} color={C.violet} lh={1.3}>{live.length}</T></View>
              </View>
              <T size={12} color={C.muted} style={{ marginTop: 4 }}>terça-feira, 27 de outubro</T>
            </View>
            <Btn onPress={goAgenda} accessibilityLabel="Abrir agenda" style={styles.iconBtn} pressedStyle={{ backgroundColor: '#f2eefb' }}><ArrowUpRight size={19} color="#7a7689" /></Btn>
          </View>
          <View style={{ paddingHorizontal: 17 }}>
            {live.slice(0, 5).map(a => (
              <Btn key={a.id} onPress={() => st.openDetail(a.id)} style={[s.row, { gap: 9, borderBottomWidth: 1, borderColor: '#f2edf7', paddingVertical: 14 }]}>
                <View style={{ width: 40 }}>
                  <T size={13} w={600} ls={-0.4} color={C.strong} lh={1.3}>{a.time}</T>
                  <T size={10} color={C.subtle} style={{ marginTop: 2 }} lh={1.2}>{a.durLabel}</T>
                </View>
                <View style={{ width: 2, height: 29, borderRadius: 5, opacity: 0.6, backgroundColor: a.color }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T size={13} w={600} lh={1.3}>{a.clientName}</T>
                  <T size={11} color={C.muted} style={{ marginTop: 3 }} numberOfLines={1} lh={1.3}>{a.svcName} · {a.proFirst}</T>
                </View>
                <View style={[s.row, { gap: 4, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 5, backgroundColor: a.sBg }]}>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: a.sFg }} />
                  <T size={10} w={500} color={a.sFg} lh={1.2}>{a.status}</T>
                </View>
              </Btn>
            ))}
          </View>
          <Btn onPress={goAgenda} style={[s.row, { justifyContent: 'center', gap: 7, padding: 14, borderTopWidth: 1, borderColor: '#eee8f6', marginTop: -1 }]} pressedStyle={{ backgroundColor: '#faf7ff' }}>
            <T size={12} w={500} color={C.primary}>Ver agenda completa</T>
            <ArrowRight size={15} color={C.primary} />
          </Btn>
        </Card>

        <View style={{ marginTop: 20, marginBottom: 4 }}>
          <T size={13} w={600} color={C.title}>Ações rápidas</T>
          <T size={11} color={C.muted} style={{ marginTop: 2, marginBottom: 12 }}>Um atalho para o seu dia.</T>
          <View style={[s.row, { flexWrap: 'wrap', gap: 10 }]}>
            {quick.map(([label, icon, go]) => (
              <Btn key={label} onPress={go} style={styles.quick} pressedStyle={{ borderColor: C.violetBorder, backgroundColor: '#fcfaff' }}>
                <IconTile icon={icon} size={28} iconSize={16} bg="#f5f3f8" fg="#776887" />
                <T size={12} color={C.label} lh={1.3} style={{ flex: 1 }}>{label}</T>
                <Plus size={12} color="#b9aec6" />
              </Btn>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 20, marginBottom: 18 },
  metric: { padding: 15, flexBasis: '47%', flexGrow: 1 },
  bell: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: C.violet, borderWidth: 1, borderColor: C.bg },
  iconBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quick: {
    flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1,
    borderColor: C.border, borderRadius: 9, paddingVertical: 11, paddingHorizontal: 9, minHeight: 50,
  },
});
