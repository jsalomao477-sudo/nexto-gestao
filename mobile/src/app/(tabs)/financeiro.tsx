import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowDownLeft, ArrowUp, Clock, Inbox, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react-native';
import { STATUS_COLORS } from '../../data/mock';
import { compactMoney, money } from '../../lib/format';
import { finance, type Period } from '../../lib/selectors';
import { Screen } from '../../components/Screen';
import { Btn, Card, Chips, Empty, Eyebrow, H1, IconTile, Segmented, T, s, type IconType } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

const PERIODS = { Hoje: 'hoje', Semana: 'semana', 'Mês': 'mes' } as const satisfies Record<string, Period>;
type PeriodLabel = keyof typeof PERIODS;

function Metric({ label, icon, value, children, accent }: { label: string; icon: IconType; value: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <Card style={styles.metric} border={accent ? '#ded5ee' : C.border}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <T size={12} w={500} color={C.body}>{label}</T>
        <IconTile icon={icon} bg={accent ? C.violetSoft : '#f5f4f8'} fg={accent ? '#7143b3' : '#786b8c'} />
      </View>
      <T size={20} w={600} ls={-0.9} lh={1.2} tabular color={accent ? C.violet : C.value} numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 12, marginBottom: 6 }}>{value}</T>
      {children}
    </Card>
  );
}

export default function Financeiro() {
  const st = useStore();
  const [periodLabel, setPeriodLabel] = useState<PeriodLabel>('Semana');
  const [filter, setFilter] = useState<'Todos' | 'Receita' | 'Despesa'>('Todos');
  const f = finance(st.s, PERIODS[periodLabel]);
  const bmax = Math.max(...f.bars.map(b => b.v), 1);
  const rows = f.rows.filter(r => filter === 'Todos' || r.type === filter);
  const newTx = () => st.openTx({ id: null, type: 'Despesa', desc: '', amount: '', method: 'Pix', status: 'Pago' });

  return (
    <Screen>
      <View style={{ paddingTop: 14, paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <View><Eyebrow style={{ marginBottom: 6 }}>STUDIO AURORA</Eyebrow><H1>Financeiro</H1></View>
          <Btn onPress={newTx} accessibilityLabel="Nova movimentação" style={styles.plus} pressedStyle={{ backgroundColor: C.primaryPressed }}><Plus size={20} color="#fff" /></Btn>
        </View>
        <T size={13} color={C.secondary} style={{ marginTop: 6 }}>Uma visão clara das entradas e saídas do seu negócio.</T>
        <Segmented options={Object.keys(PERIODS) as PeriodLabel[]} value={periodLabel} onChange={setPeriodLabel} style={{ marginTop: 14 }} />

        <View style={styles.grid}>
          <Metric accent label="Faturamento" icon={Wallet} value={money(f.revenue)}><T size={11} color={C.eyebrow}>Receitas pagas</T></Metric>
          <Metric label="Custos + despesas" icon={Receipt} value={money(f.costs + f.expenses)}><T size={11} color={C.eyebrow}>Serviços: {money(f.costs)}</T></Metric>
          <Metric label="Lucro estimado" icon={TrendingUp} value={money(f.revenue - f.costs - f.expenses)}>
            <Btn onPress={() => st.flash('Estimativa: receitas menos custos dos serviços e despesas pagas.')}><T size={11} color={C.primary}>Entenda a estimativa</T></Btn>
          </Metric>
          <Metric label="A receber" icon={Clock} value={money(f.receivable)}><T size={11} color={C.eyebrow}>Previsão futura: {money(f.forecast)}</T></Metric>
        </View>

        <Card style={{ overflow: 'hidden' }}>
          <View style={[s.row, { justifyContent: 'space-between', paddingTop: 18, paddingHorizontal: 18, paddingBottom: 4 }]}>
            <View>
              <T size={15} w={600} color={C.title}>Faturamento por período</T>
              <T size={12} color={C.muted} style={{ marginTop: 4 }}>{f.chartTitle}</T>
            </View>
            <View style={[s.row, { gap: 6 }]}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#9371d0' }} /><T size={10} color={C.muted}>Receita</T></View>
          </View>
          <View style={[s.row, { alignItems: 'flex-end', gap: 8, height: 160, paddingTop: 12, paddingHorizontal: 18 }]}>
            {f.bars.map(b => (
              <View key={b.label} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <T size={9} color={C.subtle} numberOfLines={1} lh={1.3}>{b.v ? compactMoney(b.v) : ' '}</T>
                <View style={{ width: '100%', maxWidth: 30, flex: 1, justifyContent: 'flex-end', backgroundColor: '#f4edfa', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{ width: '100%', height: `${b.v ? Math.max(b.v / bmax * 100, 4) : 0}%`, backgroundColor: b.cur ? C.violet : '#b095d8', borderRadius: 5 }} />
                </View>
              </View>
            ))}
          </View>
          <View style={[s.row, { gap: 8, paddingTop: 7, paddingHorizontal: 18, paddingBottom: 16 }]}>
            {f.bars.map(b => <T key={b.label} size={10} center color={b.cur ? C.violetText : C.subtle} style={{ flex: 1 }}>{b.label}</T>)}
          </View>
        </Card>

        <Card style={{ marginTop: 14, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 4 }}>
          <T size={15} w={600} color={C.title} style={{ marginBottom: 14 }}>Formas de pagamento</T>
          {f.payList.map(p => (
            <View key={p.name} style={{ marginBottom: 16 }}>
              <View style={[s.row, { justifyContent: 'space-between' }]}>
                <T size={13} color={C.body}>{p.name}</T>
                <T size={13} w={500} color={C.strong} tabular>{p.value}</T>
              </View>
              <View style={{ height: 7, borderRadius: 5, backgroundColor: '#f4edfa', marginTop: 8 }}>
                <View style={{ height: '100%', width: `${p.pct}%`, borderRadius: 5, backgroundColor: '#b095d8' }} />
              </View>
            </View>
          ))}
          {!f.payList.length && <T size={12} color={C.muted} style={{ marginBottom: 16 }}>Sem receitas no período.</T>}
        </Card>

        <Card style={{ marginTop: 14, overflow: 'hidden' }}>
          <View style={[s.row, { justifyContent: 'space-between', gap: 10, paddingTop: 18, paddingHorizontal: 18 }]}>
            <View>
              <T size={15} w={600} color={C.title}>Movimentações</T>
              <T size={11} color={C.muted} style={{ marginTop: 4 }}>{f.txCount} movimentações no período</T>
            </View>
            <Btn onPress={newTx} style={[s.row, s.outline, { gap: 6, paddingVertical: 7, paddingHorizontal: 10, minHeight: 34 }]} pressedStyle={{ backgroundColor: '#f7f5ff' }}>
              <Plus size={14} color={C.label} /><T size={12} w={600} color={C.label}>Registrar despesa</T>
            </Btn>
          </View>
          <View style={{ paddingTop: 12, paddingHorizontal: 18, paddingBottom: 4 }}>
            <Chips options={['Todos', 'Receita', 'Despesa'] as const} value={filter} onChange={setFilter} padV={6} />
          </View>
          <View style={{ paddingHorizontal: 18 }}>
            {rows.map(r => {
              const inc = r.type === 'Receita';
              const [sFg, sBg] = STATUS_COLORS[r.status] || STATUS_COLORS['Pendente'];
              const open = () => r.agenda && r.apptId
                ? st.openDetail(r.apptId)
                : st.openTx({ id: r.id, type: r.type, desc: r.desc, amount: (r.amount / 100).toFixed(2).replace('.', ','), method: r.method, status: r.status === 'Pago' ? 'Pago' : 'Pendente' });
              return (
                <Btn key={r.id} onPress={open} style={[s.row, { gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f1eaf7' }]}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: inc ? '#edf9f1' : '#fef0f0' }}>
                    {inc ? <ArrowDownLeft size={16} color="#79bb97" /> : <ArrowUp size={16} color="#d897a1" />}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T size={13} w={600} color={C.strong}>{r.desc}</T>
                    <T size={11} color={C.subtle} numberOfLines={1} style={{ marginTop: 2 }}>{(r.who || r.type) + ' · ' + r.date + ' · ' + r.method}</T>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <T size={13} w={600} tabular color={inc ? '#399c7b' : C.strong}>{(inc ? '' : '− ') + money(r.amount)}</T>
                    <View style={[s.row, { gap: 4 }]}>
                      {r.agenda && <View style={{ backgroundColor: '#f5eefc', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 5 }}><T size={9} color="#835aaf" lh={1.3}>Agenda</T></View>}
                      <View style={{ paddingVertical: 3, paddingHorizontal: 6, borderRadius: 5, backgroundColor: sBg }}><T size={10} w={500} color={sFg} lh={1.2}>{r.status}</T></View>
                    </View>
                  </View>
                </Btn>
              );
            })}
            {!rows.length && <Empty icon={Inbox} pad={34} title="Nenhuma movimentação encontrada" text="Ajuste o período ou registre uma movimentação." />}
          </View>
          <T size={11} color="#858994" lh={1.7} style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 16 }}>Atendimentos concluídos e pagos geram uma única receita. O financeiro mostra estimativas, sem substituir a contabilidade.</T>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plus: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 14, marginBottom: 16 },
  metric: { padding: 15, flexBasis: '47%', flexGrow: 1 },
});
