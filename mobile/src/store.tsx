import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  APPTS, CLIENTS, INTERACTIONS, NEXT_STEP, NOTIFS, RECEIVABLES, TODAY, TXS,
  type Appt, type Client, type Interaction, type Notif, type PayStatus, type Receivable, type Tx, type TxType,
} from './data/mock';

export type NewApptDraft = { client?: string | null; svc?: string; pro: string; day: number; slot?: number | null };
export type TxDraft = { id: string | null; type: TxType; desc: string; amount: string; method: string; status: 'Pago' | 'Pendente' };
export type PayTarget = { client: string; id: string };

type Data = {
  appts: Appt[];
  clients: Client[];
  rc: Record<string, Receivable[]>;
  inter: Record<string, Interaction[]>;
  notifs: Notif[];
  tx: Tx[];
};

type Ui = {
  detail: string | null;
  pay: PayTarget | null;
  txDraft: TxDraft | null;
  newAppt: NewApptDraft | null;
  toast: string;
  agendaDay: number;
  agendaView: 'Dia' | 'Semana';
};

export type State = Data & Ui;

const initial = (): State => ({
  appts: APPTS.map(a => ({ ...a })),
  clients: CLIENTS.map(c => ({ ...c })),
  rc: Object.fromEntries(Object.entries(RECEIVABLES).map(([k, v]) => [k, v.map(r => ({ ...r }))])),
  inter: Object.fromEntries(Object.entries(INTERACTIONS).map(([k, v]) => [k, [...v]])),
  notifs: NOTIFS.map(n => ({ ...n })),
  tx: TXS.map(t => ({ ...t })),
  detail: null, pay: null, txDraft: null, newAppt: null, toast: '',
  agendaDay: TODAY, agendaView: 'Dia',
});

function useStoreValue() {
  const [s, setS] = useState(initial);
  const set = useCallback((p: Partial<State> | ((s: State) => Partial<State>)) =>
    setS(prev => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })), []);

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const actions = useMemo(() => {
    const flash = (toast: string) => {
      clearTimeout(timer.current);
      set({ toast });
      timer.current = setTimeout(() => set({ toast: '' }), 2200);
    };
    const patchAppt = (id: string, patch: Partial<Appt>, msg?: string) => {
      set(st => ({ appts: st.appts.map(a => a.id === id ? { ...a, ...patch } : a) }));
      if (msg) flash(msg);
    };
    return {
      flash,
      openDetail: (detail: string) => set({ detail }),
      closeDetail: () => set({ detail: null }),
      advance: (a: Appt) => {
        const next = NEXT_STEP[a.status];
        if (next) patchAppt(a.id, { status: next[1] }, 'Status atualizado para ' + next[1] + '.');
        else if (a.status === 'Concluído' && !a.paid) patchAppt(a.id, { paid: true }, 'Pagamento registrado.');
      },
      cancelAppt: (id: string) => { patchAppt(id, { status: 'Cancelado' }, 'Agendamento cancelado.'); set({ detail: null }); },

      // newAppt / txDraft hold the sheet's starting values; the sheet edits its own copy.
      openNew: (pre: Partial<NewApptDraft> = {}) => set({ newAppt: { day: TODAY, pro: 'p1', ...pre }, detail: null }),
      closeNew: () => set({ newAppt: null }),
      createAppt: (a: Omit<Appt, 'id' | 'status' | 'paid'>) => {
        set(st => ({
          appts: [...st.appts, { ...a, id: 'n' + Date.now(), status: 'Agendado', paid: false }],
          newAppt: null, agendaView: 'Dia', agendaDay: a.day,
        }));
        flash('Agendamento criado.');
      },

      setAgenda: (p: Partial<Pick<Ui, 'agendaDay' | 'agendaView'>>) => set(p),

      setStage: (client: string, stage: number) => {
        set(st => ({ clients: st.clients.map(c => c.id === client ? { ...c, stage } : c) }));
        flash('Relacionamento atualizado.');
      },
      addInteraction: (client: string, kind: string, text: string) => {
        set(st => ({ inter: { ...st.inter, [client]: [{ kind, date: '27/10/2026', text }, ...(st.inter[client] || [])] } }));
        flash('Interação registrada.');
      },

      openPay: (pay: PayTarget) => set({ pay }),
      closePay: () => set({ pay: null }),
      savePay: (status: PayStatus, method: string) => {
        set(st => {
          if (!st.pay) return {};
          const { client, id } = st.pay;
          return { rc: { ...st.rc, [client]: st.rc[client].map(r => r.id === id ? { ...r, status, method } : r) }, pay: null };
        });
        flash('Status de pagamento atualizado.');
      },

      readNotif: (id: string) => set(st => ({ notifs: st.notifs.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () => { set(st => ({ notifs: st.notifs.map(n => ({ ...n, read: true })) })); flash('Todas as notificações foram lidas.'); },

      openTx: (txDraft: TxDraft) => set({ txDraft }),
      closeTx: () => set({ txDraft: null }),
      saveTx: (d: TxDraft) => {
        const amount = Math.round(parseFloat((d.amount || '').replace(/\./g, '').replace(',', '.')) * 100);
        if (!d.desc.trim() || !(amount > 0)) { flash('Informe a descrição e o valor.'); return; }
        const rec = { type: d.type, desc: d.desc.trim(), amount, method: d.method, status: d.status };
        set(st => ({
          tx: d.id
            ? st.tx.map(t => t.id === d.id ? { ...t, ...rec } : t)
            : [{ id: 't' + Date.now(), who: '', day: TODAY, date: '27/10', ...rec }, ...st.tx],
          txDraft: null,
        }));
        flash(d.id ? 'Movimentação atualizada.' : 'Movimentação registrada.');
      },
      deleteTx: (id: string) => { set(st => ({ tx: st.tx.filter(t => t.id !== id), txDraft: null })); flash('Movimentação excluída.'); },
    };
  }, [set]);

  return { s, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
