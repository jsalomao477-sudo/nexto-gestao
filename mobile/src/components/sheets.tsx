import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Check, CircleCheck, Clock, MessageCircle, Phone, Scissors, Search, User, Wallet, X } from 'lucide-react-native';
import { DAYS, METHODS, NEXT_STEP, PROS, SERVICES, STATUS_COLORS, TODAY, type PayStatus } from '../data/mock';
import { decorate, freeSlots } from '../lib/selectors';
import { hhmm, initials, money } from '../lib/format';
import { useStore, type NewApptDraft, type PayTarget, type TxDraft } from '../store';
import { C } from '../theme';
import { Avatar, Badge, Btn, Chips, Field, Grabber, Input, OutlineButton, PrimaryButton, Segmented, Sheet, T, s, type IconType } from './ui';

export function Overlays() {
  const st = useStore();
  const { s: S } = st;
  return (
    <>
      <Sheet visible={!!S.detail} onClose={st.closeDetail} z={35}>{S.detail && <DetailContent id={S.detail} />}</Sheet>
      <Sheet visible={!!S.newAppt} onClose={st.closeNew} z={40} padded={false} backdropCloses={false} maxHeight="100%">{S.newAppt && <NewApptContent key={JSON.stringify(S.newAppt)} initial={S.newAppt} />}</Sheet>
      <Sheet visible={!!S.pay} onClose={st.closePay} z={45}>{S.pay && <PayContent key={S.pay.id} target={S.pay} />}</Sheet>
      <Sheet visible={!!S.txDraft} onClose={st.closeTx} z={45} maxHeight="90%">{S.txDraft && <TxContent key={S.txDraft.id ?? 'new'} initial={S.txDraft} />}</Sheet>
      <Toast />
    </>
  );
}

function Toast() {
  const { s: S } = useStore();
  const insets = useSafeAreaInsets();
  if (!S.toast) return null;
  return (
    <View pointerEvents="none" style={[s.row, styles.toast, { top: insets.top + 4 }]}>
      <CircleCheck size={18} color={C.success} />
      <T size={13} style={{ flex: 1 }}>{S.toast}</T>
    </View>
  );
}

function CloseX({ onPress }: { onPress: () => void }) {
  return <Btn onPress={onPress} accessibilityLabel="Fechar" style={{ padding: 6, borderRadius: 6 }} pressedStyle={{ backgroundColor: '#f3ecfb' }}><X size={20} color="#9f90ae" /></Btn>;
}

function InfoRow({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <View style={[s.row, { gap: 12 }]}>
      <Icon size={15} color="#8b819b" />
      <T size={13} color={C.muted}>{label}</T>
      <T size={13} w={500} color={C.strong} style={{ marginLeft: 'auto' }}>{value}</T>
    </View>
  );
}

function DetailContent({ id }: { id: string }) {
  const st = useStore();
  const router = useRouter();
  const raw = st.s.appts.find(a => a.id === id);
  if (!raw) return null;
  const a = decorate(st.s, raw);
  const payStatus: PayStatus = a.paid ? 'Pago' : 'Pendente';
  const [pFg, pBg] = STATUS_COLORS[payStatus];
  const next = NEXT_STEP[a.status];
  const canAdvance = !!next || (a.status === 'Concluído' && !a.paid);
  const canCancel = a.status === 'Agendado' || a.status === 'Confirmado';

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      <Grabber />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Badge label={a.status} fg={a.sFg} bg={a.sBg} padH={7} />
          <T size={21} w={600} color={C.heading} ls={-0.6} style={{ marginTop: 8, marginBottom: 2 }}>{a.clientName}</T>
          <T size={13} color={C.muted}>{a.svcName}</T>
        </View>
        <CloseX onPress={st.closeDetail} />
      </View>
      <View style={styles.infoBlock}>
        <InfoRow icon={CalendarDays} label="Data" value={DAYS[a.day][2]} />
        <InfoRow icon={Clock} label="Horário" value={a.time + ' – ' + a.end} />
        <InfoRow icon={User} label="Profissional" value={a.proName} />
        <InfoRow icon={Phone} label="Telefone" value={a.phone} />
      </View>
      <View style={[s.row, styles.panel, { gap: 12, padding: 15, borderRadius: 9, marginTop: 16 }]}>
        <View style={[s.row, { flex: 1, gap: 10 }]}><Wallet size={15} color="#8b819b" /><T size={13} color={C.body}>{money(a.price)}</T></View>
        <Badge label={payStatus} fg={pFg} bg={pBg} dot={false} padH={7} />
      </View>
      <View style={{ gap: 10, marginTop: 18 }}>
        {canAdvance && <PrimaryButton label={next ? next[0] : 'Registrar pagamento'} icon={Check} onPress={() => st.advance(raw)} />}
        <View style={[s.row, { gap: 10 }]}>
          <OutlineButton label="Ver cliente" icon={User} style={{ flex: 1 }} onPress={() => { st.closeDetail(); router.push(`/cliente/${a.client}`); }} />
          <OutlineButton label="WhatsApp" icon={MessageCircle} style={{ flex: 1 }} onPress={() => st.flash('Abrindo conversa no WhatsApp...')} />
        </View>
        {canCancel && (
          <Btn onPress={() => st.cancelAppt(a.id)} style={{ padding: 8, alignItems: 'center' }}>
            <T size={13} w={600} color={C.danger}>Cancelar agendamento</T>
          </Btn>
        )}
      </View>
    </ScrollView>
  );
}

function PayContent({ target }: { target: PayTarget }) {
  const st = useStore();
  const r = st.s.rc[target.client]?.find(x => x.id === target.id);
  const [status, setStatus] = useState<'Pago' | 'Pendente' | 'Atrasado'>(r?.status === 'Pago' ? 'Pago' : r?.status === 'Atrasado' ? 'Atrasado' : 'Pendente');
  const [method, setMethod] = useState(r?.method || 'Pix');
  if (!r) return null;
  return (
    <View>
      <Grabber />
      <T size={18} w={600} color={C.heading} ls={-0.4}>Alterar status do pagamento</T>
      <T size={13} color={C.muted} lh={1.6} style={{ marginTop: 6 }}>{r.desc} · {money(r.amount)}. A mesma movimentação será atualizada no financeiro, sem criar outro lançamento.</T>
      <T size={13} w={500} color={C.label} style={{ marginTop: 18, marginBottom: 8 }}>Status do pagamento</T>
      <Segmented options={['Pago', 'Pendente', 'Atrasado'] as const} value={status} onChange={setStatus} size={13} padV={9} />
      <T size={13} w={500} color={C.label} style={{ marginTop: 16, marginBottom: 8 }}>Forma de pagamento recebida</T>
      <Chips options={METHODS} value={method} onChange={setMethod} />
      <View style={[s.row, { gap: 10, marginTop: 22 }]}>
        <OutlineButton label="Cancelar" style={{ flex: 1 }} height={46} onPress={st.closePay} />
        <PrimaryButton label="Salvar status" style={{ flex: 1 }} height={46} radius={8} onPress={() => st.savePay(status, method)} />
      </View>
    </View>
  );
}

function TxContent({ initial }: { initial: TxDraft }) {
  const st = useStore();
  const [d, setD] = useState(initial);
  const set = (p: Partial<TxDraft>) => setD(x => ({ ...x, ...p }));
  return (
    <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Grabber />
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <T size={18} w={600} color={C.heading} ls={-0.4}>{d.id ? 'Editar movimentação' : 'Nova movimentação'}</T>
        <CloseX onPress={st.closeTx} />
      </View>
      <Segmented options={['Receita', 'Despesa'] as const} value={d.type} onChange={type => set({ type })} size={13} padV={9} style={{ marginTop: 14 }} />
      <View style={{ marginTop: 16 }}>
        <Field label="Descrição"><Input value={d.desc} onChangeText={desc => set({ desc })} placeholder="Ex.: Compra de produtos" /></Field>
      </View>
      <View style={[s.row, { gap: 12, marginTop: 14, alignItems: 'flex-start' }]}>
        <View style={{ flex: 1 }}>
          <Field label="Valor (R$)"><Input value={d.amount} onChangeText={v => set({ amount: v.replace(/[^\d,]/g, '') })} keyboardType="decimal-pad" placeholder="0,00" style={{ fontVariant: ['tabular-nums'] }} /></Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Data"><View style={[s.input, { backgroundColor: C.panel }]}><T size={16} lh={1.2} color={C.text}>27/10/2026</T></View></Field>
        </View>
      </View>
      <T size={13} w={500} color={C.label} style={{ marginTop: 16, marginBottom: 8 }}>Forma de pagamento</T>
      <Chips options={METHODS} value={d.method} onChange={method => set({ method })} />
      <T size={13} w={500} color={C.label} style={{ marginTop: 16, marginBottom: 8 }}>Status</T>
      <Segmented options={['Pago', 'Pendente'] as const} value={d.status} onChange={status => set({ status })} size={13} padV={9} />
      <View style={[s.row, { gap: 10, marginTop: 22, paddingBottom: 2 }]}>
        {d.id && <Btn onPress={() => st.deleteTx(d.id!)} style={{ paddingHorizontal: 6 }}><T size={13} w={600} color={C.danger}>Excluir</T></Btn>}
        <OutlineButton label="Cancelar" style={{ flex: 1 }} height={46} onPress={st.closeTx} />
        <PrimaryButton label="Salvar" style={{ flex: 1 }} height={46} radius={8} onPress={() => st.saveTx(d)} />
      </View>
    </ScrollView>
  );
}

function NewApptContent({ initial }: { initial: NewApptDraft }) {
  const st = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [nw, setNw] = useState(initial);
  const [q, setQ] = useState('');
  const set = (p: Partial<NewApptDraft>) => setNw(x => ({ ...x, ...p }));

  const svc = SERVICES.find(x => x.id === nw.svc);
  const slots = svc ? freeSlots(st.s.appts, nw.day, nw.pro, svc.dur) : [];
  const client = nw.client ? st.s.clients.find(c => c.id === nw.client) : undefined;
  const ready = !!client && !!svc && nw.slot != null && slots.includes(nw.slot);
  const nq = q.trim().toLowerCase();
  const matches = st.s.clients.filter(c => !nq || c.name.toLowerCase().includes(nq)).slice(0, 4);
  const hint = !svc ? 'Escolha um serviço para ver os horários livres.' : !slots.length ? 'Nenhum horário disponível neste dia.' : '';

  const save = () => {
    if (!ready) { st.flash(!client ? 'Escolha um cliente.' : !svc ? 'Escolha um serviço.' : 'Escolha um horário disponível.'); return; }
    st.createAppt({ day: nw.day, start: nw.slot!, client: client!.id, svc: svc!.id, pro: nw.pro });
    router.navigate('/agenda');
  };

  return (
    <View style={{ height: height - Math.max(insets.top, 50) }}>
      <View style={[s.row, { justifyContent: 'space-between', paddingTop: 16, paddingHorizontal: 18, paddingBottom: 12, borderBottomWidth: 1, borderColor: C.borderSoft }]}>
        <Btn onPress={st.closeNew} style={{ padding: 4, width: 70 }}><T size={14} color="#626674">Cancelar</T></Btn>
        <T size={16} w={600} color={C.heading}>Novo agendamento</T>
        <View style={{ width: 70 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View>
          <T size={13} w={500} color={C.label} style={{ marginBottom: 8 }}>Cliente</T>
          {client ? (
            <View style={[s.row, { gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ded5ee', backgroundColor: '#fcfaff', borderRadius: 9 }]}>
              <Avatar label={initials(client.name)} size={32} radius={9} font={10} />
              <View style={{ flex: 1 }}><T size={14} w={600}>{client.name}</T><T size={11} color={C.muted}>{client.phone}</T></View>
              <Btn onPress={() => set({ client: null })}><T size={12} w={600} color={C.primary}>Trocar</T></Btn>
            </View>
          ) : (
            <>
              <View style={[s.row, styles.search]}>
                <Search size={15} color={C.subtle} />
                <Input bare value={q} onChangeText={setQ} placeholder="Buscar cliente..." style={{ flex: 1, fontSize: 14 }} />
              </View>
              <View style={{ marginTop: 4 }}>
                {matches.map(c => (
                  <Btn key={c.id} onPress={() => set({ client: c.id })} style={[s.row, { gap: 10, paddingVertical: 10, paddingHorizontal: 2, borderBottomWidth: 1, borderColor: '#f1f2f5' }]}>
                    <Avatar label={initials(c.name)} size={30} radius={9} font={10} />
                    <View style={{ flex: 1 }}><T size={13} w={500}>{c.name}</T><T size={11} color={C.subtle}>{c.phone}</T></View>
                  </Btn>
                ))}
              </View>
            </>
          )}
        </View>

        <View>
          <T size={13} w={500} color={C.label} style={{ marginBottom: 8 }}>Serviço</T>
          <View style={{ gap: 8 }}>
            {SERVICES.map(x => {
              const sel = nw.svc === x.id;
              return (
                <Btn key={x.id} onPress={() => set({ svc: x.id })} style={[s.row, { gap: 11, borderWidth: 1, borderColor: sel ? C.violetBorder : C.border, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, backgroundColor: sel ? '#fcfaff' : '#fff' }]}>
                  <View style={{ width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: x.color + '15' }}><Scissors size={15} color={x.color} /></View>
                  <View style={{ flex: 1 }}><T size={13} w={600}>{x.name}</T><T size={11} color={C.muted}>{x.dur} min · {money(x.price)}</T></View>
                  {sel && <CircleCheck size={18} color={C.primary} />}
                </Btn>
              );
            })}
          </View>
        </View>

        <View>
          <T size={13} w={500} color={C.label} style={{ marginBottom: 8 }}>Profissional</T>
          <View style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
            {PROS.map(p => {
              const sel = nw.pro === p.id;
              return (
                <Btn key={p.id} onPress={() => set({ pro: p.id })} style={[s.row, { gap: 7, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, borderRadius: 20, borderWidth: 1, borderColor: sel ? C.violetBorder : C.border, backgroundColor: sel ? C.violetSoft : '#fff' }]}>
                  <Avatar label={initials(p.name)} size={24} radius={12} font={9} bg={p.color + '13'} fg={p.color} />
                  <T size={12} w={500} color={sel ? C.violetText : C.label}>{p.first}</T>
                </Btn>
              );
            })}
          </View>
        </View>

        <View>
          <T size={13} w={500} color={C.label} style={{ marginBottom: 8 }}>Data</T>
          <View style={[s.row, { gap: 4 }]}>
            {DAYS.map((d, i) => {
              const sel = nw.day === i, dis = i < TODAY || i === 6;
              return (
                <Btn key={i} disabled={dis} onPress={() => set({ day: i })} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: sel ? C.violet : C.border, backgroundColor: sel ? C.violet : '#fff', opacity: dis ? 0.35 : 1 }}>
                  <T size={10} color={sel ? '#fff' : C.strong}>{d[0]}</T>
                  <T size={15} w={600} color={sel ? '#fff' : C.strong}>{d[1]}</T>
                </Btn>
              );
            })}
          </View>
        </View>

        <View>
          <T size={13} w={500} color={C.label} style={{ marginBottom: 8 }}>Horário disponível</T>
          <View style={[s.row, { flexWrap: 'wrap', gap: 7, minHeight: 46, padding: 12, backgroundColor: '#faf8fd', borderRadius: 8, borderWidth: 1, borderColor: '#f0e8f7' }]}>
            {slots.map(t => {
              const sel = nw.slot === t;
              return (
                <Btn key={t} onPress={() => set({ slot: t })} style={{ borderWidth: 1, borderColor: sel ? C.violet : C.chipBorder, backgroundColor: sel ? C.violet : '#fff', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 6 }}>
                  <T size={13} tabular color={sel ? '#fff' : '#5b3f86'} lh={1.2}>{hhmm(t)}</T>
                </Btn>
              );
            })}
            {!!hint && <T size={12} color="#92819c" lh={1.7}>{hint}</T>}
          </View>
        </View>
      </ScrollView>
      <View style={[s.row, { gap: 12, paddingTop: 14, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 20), borderTopWidth: 1, borderColor: C.borderSoft }]}>
        <View style={{ flex: 1 }}>
          <T size={11} color={C.muted}>Total</T>
          <T size={18} w={600} color={C.violet} tabular>{svc ? money(svc.price) : money(0)}</T>
        </View>
        <PrimaryButton label="Salvar agendamento" icon={Check} onPress={save} bg={ready ? C.primary : C.primaryDisabled} style={{ paddingHorizontal: 22 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', left: 16, right: 16, zIndex: 70, gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d8ece2',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14,
    shadowColor: '#4c2465', shadowOpacity: 0.13, shadowRadius: 15, shadowOffset: { width: 0, height: 12 }, elevation: 6,
  },
  infoBlock: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.borderSoft, paddingVertical: 12, marginTop: 16, gap: 14 },
  panel: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.panelBorder },
  search: { gap: 9, borderWidth: 1, borderColor: '#e1e3e8', borderRadius: 8, paddingHorizontal: 12, height: 42, backgroundColor: '#fff' },
});
