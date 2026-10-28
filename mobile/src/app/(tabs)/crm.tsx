import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Inbox, Search } from 'lucide-react-native';
import { STAGES } from '../../data/mock';
import { crmTotals, enrichClient } from '../../lib/selectors';
import { Screen } from '../../components/Screen';
import { Avatar, Btn, Card, Empty, Eyebrow, H1, Input, T, s } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

export default function Crm() {
  const router = useRouter();
  const { s: S } = useStore();
  const [stage, setStage] = useState('Todos');
  const [q, setQ] = useState('');
  const { dueCount, pendingTotal, overdueTotal } = crmTotals(S);
  const nq = q.trim().toLowerCase();
  const rows = S.clients
    .filter(c => (stage === 'Todos' || STAGES[c.stage] === stage) && (!nq || c.name.toLowerCase().includes(nq) || c.phone.includes(nq) || c.company.toLowerCase().includes(nq)))
    .map(c => enrichClient(S, c));

  return (
    <Screen>
      <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
        <Eyebrow style={{ marginBottom: 6 }}>RELACIONAMENTOS</Eyebrow>
        <H1>Clientes e CRM</H1>
        <T size={13} color={C.secondary} style={{ marginTop: 6 }}>Relacionamentos, atendimentos e recebimentos em um só lugar.</T>
        <View style={[s.row, { gap: 10, marginTop: 16, marginBottom: 14, alignItems: 'stretch' }]}>
          <Card style={styles.stat}>
            <T size={12} color={C.body}>Contatos para hoje</T>
            <T size={20} w={600} color={C.value} lh={1.3} style={{ marginTop: 4 }}>{dueCount}</T>
            <T size={10} color={C.eyebrow}>Inclui retornos em atraso</T>
          </Card>
          <Card style={styles.stat}>
            <T size={12} color={C.body}>Em aberto</T>
            <T size={20} w={600} color={C.value} lh={1.3} tabular style={{ marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>{pendingTotal}</T>
            <T size={10} color={C.warning}>{overdueTotal} em atraso</T>
          </Card>
        </View>
        <View style={[s.row, styles.search]}>
          <Search size={17} color={C.subtle} />
          <Input bare value={q} onChangeText={setQ} placeholder="Buscar nome, empresa ou telefone..." style={{ flex: 1, fontSize: 14, color: C.text }} returnKeyType="search" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ gap: 18, paddingHorizontal: 18 }}>
        {['Todos', ...STAGES].map(x => {
          const sel = stage === x;
          const n = x === 'Todos' ? S.clients.length : S.clients.filter(c => STAGES[c.stage] === x).length;
          return (
            <Btn key={x} onPress={() => setStage(x)} pressedStyle={{}} style={[s.row, { gap: 7, paddingTop: 12, paddingBottom: 13, borderBottomWidth: 2, borderColor: sel ? C.violet : 'transparent' }]}>
              <T size={12} w={sel ? 600 : 400} color={sel ? '#7030cc' : '#787b87'}>{x}</T>
              <View style={{ borderRadius: 5, minWidth: 20, paddingVertical: 1, paddingHorizontal: 5, alignItems: 'center', backgroundColor: sel ? '#f0e9fc' : '#f4f4f7' }}>
                <T size={10} color={sel ? C.violet : '#81808b'} lh={1.4}>{n}</T>
              </View>
            </Btn>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 18 }}>
        {rows.map(r => (
          <Btn key={r.id} onPress={() => router.push(`/cliente/${r.id}`)} style={{ gap: 12, paddingVertical: 18, borderBottomWidth: 1, borderColor: C.borderSoft }}>
            <View style={[s.row, { gap: 11 }]}>
              <Avatar label={r.ini} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T size={14} w={600} color={C.strong}>{r.name}</T>
                <T size={12} color={C.subtle}>{r.sub}</T>
              </View>
              <ArrowUpRight size={18} color={C.faint} />
            </View>
            <View style={[s.row, { alignSelf: 'flex-start', gap: 6, borderWidth: 1, borderColor: r.stBorder, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 7, backgroundColor: r.stBg }]}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: r.stFg }} />
              <T size={10} w={500} color={r.stFg} lh={1.2}>{r.stageName}</T>
            </View>
            <View style={[s.row, { gap: 10, alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <T size={11} color={C.muted}>Próximo contato</T>
                <T size={13} w={600} color={r.nextFg} style={{ marginTop: 2 }}>{r.next}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T size={11} color={C.muted}>Em aberto</T>
                <T size={13} w={600} color="#343741" tabular style={{ marginTop: 2 }}>{r.pending}</T>
                {r.hasOverdue && <T size={10} color={C.warning}>Há valores em atraso</T>}
              </View>
            </View>
          </Btn>
        ))}
        {!rows.length && <Empty icon={Inbox} pad={40} title="Nenhum cliente nesta seleção" text="Ajuste os filtros para encontrar um contato." />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, paddingVertical: 13, paddingHorizontal: 14 },
  search: { gap: 9, borderWidth: 1, borderColor: '#e1e3e8', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 42 },
  tabs: { marginTop: 10, borderBottomWidth: 1, borderColor: '#e8e9ed', flexGrow: 0 },
});
