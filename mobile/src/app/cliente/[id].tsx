import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarPlus, ChevronLeft, Inbox, MessageCircle, MessageSquare, Pencil, Phone } from 'lucide-react-native';
import { KINDS, STAGES, STAGE_COLORS, STATUS_COLORS } from '../../data/mock';
import { money } from '../../lib/format';
import { enrichClient } from '../../lib/selectors';
import { Avatar, Badge, Btn, Chips, Empty, Input, T, s, type IconType } from '../../components/ui';
import { useStore } from '../../store';
import { C } from '../../theme';

export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useStore();
  const [tab, setTab] = useState<'inter' | 'pay'>('inter');
  const [kind, setKind] = useState('Observação');
  const [note, setNote] = useState('');
  const c = st.s.clients.find(x => x.id === id);
  if (!c) return null;
  const e = enrichClient(st.s, c);
  const inter = st.s.inter[c.id] || [];
  const pays = st.s.rc[c.id] || [];

  const action = (label: string, Icon: IconType, onPress: () => void) => (
    <Btn key={label} onPress={onPress} style={styles.action}>
      <Icon size={18} color={C.primary} />
      <T size={11} color={C.label}>{label}</T>
    </Btn>
  );
  const addNote = () => {
    if (note.trim().length < 2) return;
    st.addInteraction(c.id, kind, note.trim());
    setNote('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) + 20 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={[s.row, { justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 10 }]}>
        <Btn onPress={() => router.canGoBack() ? router.back() : router.replace('/crm')} style={[s.row, { gap: 4, padding: 8 }]}>
          <ChevronLeft size={20} color={C.primary} /><T size={14} w={500} color={C.primary}>CRM</T>
        </Btn>
        <Btn onPress={() => st.flash('Edição de cadastro disponível no painel completo.')} style={[s.row, { gap: 6, padding: 8 }]}>
          <Pencil size={14} color={C.label} /><T size={13} color={C.label}>Editar</T>
        </Btn>
      </View>

      <View style={{ paddingTop: 6, paddingHorizontal: 18, alignItems: 'center' }}>
        <Avatar label={e.ini} size={70} radius={18} font={22} />
        <T size={23} w={600} ls={-0.6} color={C.heading} center style={{ marginTop: 12, marginBottom: 2 }}>{c.name}</T>
        <T size={13} color={C.muted} center>{[c.type, c.company, c.phone].filter(Boolean).join(' · ')}</T>
      </View>

      <View style={[s.row, { gap: 8, paddingTop: 18, paddingHorizontal: 18 }]}>
        {action('Ligar', Phone, () => st.flash('Iniciando ligação...'))}
        {action('WhatsApp', MessageCircle, () => st.flash('Abrindo conversa no WhatsApp...'))}
        {action('Agendar', CalendarPlus, () => st.openNew({ client: c.id }))}
      </View>

      <View style={[s.row, styles.totals]}>
        <View style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16 }}>
          <T size={11} color={C.muted}>Recebido</T>
          <T size={17} w={600} color={C.success} tabular style={{ marginTop: 4 }}>{e.received}</T>
        </View>
        <View style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderLeftWidth: 1, borderColor: C.panelBorder }}>
          <T size={11} color={C.muted}>Em aberto</T>
          <T size={17} w={600} color="#343741" tabular style={{ marginTop: 4 }}>{e.pending}</T>
        </View>
      </View>

      <View style={styles.stagePanel}>
        <View style={[s.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }]}>
          <T size={12} color={C.body}>Etapa do relacionamento</T>
          <T size={12} color={C.body}>Próximo contato: <T size={12} w={600} color={e.nextFg}>{c.next}</T></T>
        </View>
        <View style={[s.row, { flexWrap: 'wrap', gap: 6, marginTop: 10 }]}>
          {STAGES.map((label, i) => {
            const sel = c.stage === i, [fg, bg, bd] = STAGE_COLORS[i];
            return (
              <Btn key={label} onPress={() => st.setStage(c.id, i)} style={{ borderWidth: 1, borderColor: sel ? bd : C.border, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8, backgroundColor: sel ? bg : '#fff' }}>
                <T size={11} w={500} color={sel ? fg : '#787b87'} lh={1.3}>{label}</T>
              </Btn>
            );
          })}
        </View>
      </View>

      <View style={[s.row, { gap: 22, paddingHorizontal: 18, marginTop: 18, borderBottomWidth: 1, borderColor: '#e8e9ed' }]}>
        {([['inter', 'Interações'], ['pay', 'Recebimentos']] as const).map(([k, l]) => (
          <Btn key={k} onPress={() => setTab(k)} pressedStyle={{}} style={{ paddingTop: 10, paddingBottom: 12, borderBottomWidth: 2, borderColor: tab === k ? C.violet : 'transparent' }}>
            <T size={13} w={tab === k ? 600 : 400} color={tab === k ? '#7030cc' : '#787b87'}>{l}</T>
          </Btn>
        ))}
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        {tab === 'inter' ? (
          <>
            <View style={{ marginTop: 14 }}><Chips options={KINDS} value={kind} onChange={setKind} size={11} padV={5} padH={9} gap={6} /></View>
            <View style={[s.row, { gap: 8, marginTop: 10 }]}>
              <Input value={note} onChangeText={setNote} placeholder="O que foi conversado?" style={{ flex: 1, minWidth: 0, fontSize: 14 }} onSubmitEditing={addNote} returnKeyType="done" />
              <Btn onPress={addNote} style={{ alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 14, borderRadius: 8, backgroundColor: C.primary }} pressedStyle={{ backgroundColor: C.primaryPressed }}>
                <T size={13} w={600} color="#fff">Registrar</T>
              </Btn>
            </View>
            <T size={11} color={C.faint} style={{ marginTop: 6 }}>Registro interno. Nenhuma mensagem será enviada.</T>
            <View style={{ marginTop: 8 }}>
              {inter.map((i, n) => (
                <View key={n} style={[s.row, { gap: 11, alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderColor: C.borderSoft }]}>
                  <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#f3effb', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={15} color="#835aaf" /></View>
                  <View style={{ flex: 1 }}>
                    <View style={[s.row, { justifyContent: 'space-between' }]}>
                      <T size={13} w={600} color={C.strong}>{i.kind}</T>
                      <T size={11} color={C.faint}>{i.date}</T>
                    </View>
                    <T size={13} color={C.body} lh={1.55} style={{ marginTop: 3 }}>{i.text}</T>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {pays.map(r => {
              const [sFg, sBg] = STATUS_COLORS[r.status];
              const showDue = r.status !== 'Pago' && !!r.due;
              return (
                <View key={r.id} style={[s.row, { gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16, borderBottomWidth: 1, borderColor: C.borderSoft }]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T size={13} w={600} color={C.strong}>{r.desc}</T>
                    <T size={11} color={C.subtle} style={{ marginTop: 2 }}>{r.kind} · {r.date}</T>
                    {showDue && <T size={11} color={r.status === 'Atrasado' ? C.warning : C.subtle} style={{ marginTop: 2 }}>Vencimento: {r.due}</T>}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <T size={14} w={600} color="#343741" tabular>{money(r.amount)}</T>
                    <Badge label={r.status} fg={sFg} bg={sBg} padV={3} />
                    <Btn onPress={() => st.openPay({ client: c.id, id: r.id })}><T size={12} w={600} color={C.primary}>Alterar pagamento</T></Btn>
                  </View>
                </View>
              );
            })}
            {!pays.length && <Empty icon={Inbox} title="Nenhum recebimento vinculado" text="Crie um lançamento ou agende um atendimento para este cliente." />}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 10 },
  totals: { borderWidth: 1, borderColor: C.panelBorder, borderRadius: 10, backgroundColor: '#fff', marginTop: 14, marginHorizontal: 18, alignItems: 'stretch' },
  stagePanel: { marginTop: 14, marginHorizontal: 18, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.panel, borderWidth: 1, borderColor: C.panelBorder, borderRadius: 10 },
});
