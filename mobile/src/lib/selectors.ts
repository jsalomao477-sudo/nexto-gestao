import {
  APPT_METHOD, DAYS, EARLY_MONTH, NOW, PROS, SERVICE_COST, SERVICES, STAGES, STAGE_COLORS, STATUS_COLORS, TODAY,
  type Appt, type Client, type PayStatus, type TxType,
} from '../data/mock';
import type { State } from '../store';
import { hhmm, initials, money, pad2 } from './format';

export const svcOf = (id: string) => SERVICES.find(s => s.id === id)!;
export const proOf = (id: string) => PROS.find(p => p.id === id)!;

export type DecoAppt = ReturnType<typeof decorate>;

export function decorate(s: State, a: Appt) {
  const svc = svcOf(a.svc), pro = proOf(a.pro), c = s.clients.find(x => x.id === a.client)!;
  const [first, second = ''] = c.name.split(' ');
  const [sFg, sBg] = STATUS_COLORS[a.status];
  return {
    ...a,
    svcName: svc.name, dur: svc.dur, price: svc.price, color: svc.color,
    proFirst: pro.first, proName: pro.name,
    clientName: c.name, clientShort: first + ' ' + (second[0] || '') + '.', phone: c.phone,
    time: hhmm(a.start), end: hhmm(a.start + svc.dur), endMin: a.start + svc.dur, durLabel: svc.dur + ' min',
    sFg, sBg, cancelled: a.status === 'Cancelado',
  };
}

export const allAppts = (s: State) => s.appts.map(a => decorate(s, a));

// Open 08:00–19:00 (Saturday until 17:00, closed Sunday), lunch 12:00–13:00, 20-minute grid.
export function freeSlots(appts: Appt[], day: number, pro: string, dur: number, except?: string) {
  if (day === 6) return [];
  const end = day === 5 ? 17 * 60 : 19 * 60;
  const busy = appts
    .filter(a => a.day === day && a.pro === pro && a.status !== 'Cancelado' && a.id !== except)
    .map(a => [a.start, a.start + svcOf(a.svc).dur]);
  const out: number[] = [];
  for (let t = 480; t + dur <= end; t += 20) {
    if (day === TODAY && t < NOW) continue;
    if (t < 780 && t + dur > 720) continue;
    if (busy.some(([b, e]) => t < e && t + dur > b)) continue;
    out.push(t);
  }
  return out;
}

export function enrichClient(s: State, c: Client) {
  const r = s.rc[c.id] || [];
  const pending = r.filter(x => x.status !== 'Pago').reduce((n, x) => n + x.amount, 0);
  const received = r.filter(x => x.status === 'Pago').reduce((n, x) => n + x.amount, 0);
  const [stFg, stBg, stBorder] = STAGE_COLORS[c.stage];
  return {
    ...c, ini: initials(c.name), sub: c.company || c.phone, stageName: STAGES[c.stage], stFg, stBg, stBorder,
    received: money(received), pending: money(pending),
    hasOverdue: r.some(x => x.status === 'Atrasado'), nextFg: c.overdue ? '#b6683e' : '#343741',
  };
}

export function crmTotals(s: State) {
  const open = Object.values(s.rc).flat().filter(r => r.status !== 'Pago');
  return {
    dueCount: s.clients.filter(c => c.next === 'Hoje' || c.overdue).length,
    pendingTotal: money(open.reduce((n, r) => n + r.amount, 0)),
    overdueTotal: money(open.filter(r => r.status === 'Atrasado').reduce((n, r) => n + r.amount, 0)),
  };
}

export function todaySummary(s: State) {
  const today = allAppts(s).filter(a => a.day === TODAY).sort((x, y) => x.start - y.start);
  const live = today.filter(a => !a.cancelled);
  const paid = live.filter(a => a.paid);
  const revenue = paid.reduce((n, a) => n + a.price, 0);
  const completed = live.filter(a => a.status === 'Concluído').length;
  return { live, revenue, completed, ticket: paid.length ? Math.round(revenue / paid.length) : 0 };
}

export type Period = 'hoje' | 'semana' | 'mes';
export type FinRow = {
  id: string; type: TxType; desc: string; who: string; day: number; date: string; amount: number;
  status: PayStatus; method: string; agenda?: boolean; cost?: number; apptId?: string;
};

export function finance(s: State, period: Period) {
  const all = allAppts(s);
  const inPeriod = (d: number) => period === 'hoje' ? d === TODAY : period === 'semana' ? d >= 0 : true;
  const early = period === 'mes';
  // Completed appointments become a single income row each.
  const derived: FinRow[] = all.filter(a => a.status === 'Concluído').map(a => ({
    id: 'x' + a.id, type: 'Receita', desc: a.svcName, who: a.clientName, day: a.day,
    date: pad2(DAYS[a.day][1]) + '/10', amount: a.price, status: a.paid ? 'Pago' : 'Pendente',
    method: APPT_METHOD[a.id] || 'Pix', agenda: true, cost: SERVICE_COST[a.svc], apptId: a.id,
  }));
  const allRows: FinRow[] = [...derived, ...s.tx];
  const rows = allRows.filter(r => inPeriod(r.day)).sort((x, y) => y.day - x.day);
  const sum = (l: FinRow[]) => l.reduce((n, r) => n + r.amount, 0);
  const recPaid = rows.filter(r => r.type === 'Receita' && r.status === 'Pago');

  const revenue = sum(recPaid) + (early ? EARLY_MONTH.rev : 0);
  const costs = recPaid.reduce((n, r) => n + (r.cost || 0), 0) + (early ? EARLY_MONTH.costs : 0);
  const expenses = sum(rows.filter(r => r.type === 'Despesa' && r.status === 'Pago'));
  const receivable = sum(rows.filter(r => r.type === 'Receita' && r.status !== 'Pago'));
  const forecast = all
    .filter(a => !a.cancelled && a.status !== 'Concluído' && (period === 'hoje' ? a.day === TODAY : a.day >= TODAY))
    .reduce((n, a) => n + a.price, 0);

  const dayRev = (i: number) => sum(allRows.filter(r => r.day === i && r.type === 'Receita' && r.status === 'Pago'));
  const bars = early
    ? [...EARLY_MONTH.weeks.map((v, i) => ({ label: 'S' + (i + 1), v, cur: false })), { label: 'S5', v: DAYS.reduce((n, _, i) => n + dayRev(i), 0), cur: true }]
    : DAYS.map((d, i) => ({ label: d[0], v: dayRev(i), cur: i === TODAY }));

  const payMap: Record<string, number> = {};
  recPaid.forEach(r => { payMap[r.method] = (payMap[r.method] || 0) + r.amount; });
  if (early) Object.entries(EARLY_MONTH.pay).forEach(([k, v]) => { payMap[k] = (payMap[k] || 0) + v; });
  const payList = Object.entries(payMap).sort((a, b) => b[1] - a[1])
    .map(([name, v]) => ({ name, value: money(v), pct: Math.max(3, v / (revenue || 1) * 100) }));

  return {
    revenue, costs, expenses, receivable, forecast, bars, payList, rows,
    chartTitle: early ? 'Outubro, por semana' : '26 out – 1 nov',
    txCount: rows.length + (early ? EARLY_MONTH.txCount : 0),
  };
}
