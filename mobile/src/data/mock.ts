// Sample data for Studio Aurora. "Today" is Tuesday 27/10, 10:40.
// Money is in cents. Days are indexes into DAYS (0 = Monday 26/10).

export type ApptStatus = 'Agendado' | 'Confirmado' | 'Em atendimento' | 'Concluído' | 'Cancelado' | 'Não compareceu';
export type PayStatus = 'Pago' | 'Pendente' | 'Atrasado' | 'Parcial';
export type TxType = 'Receita' | 'Despesa';

export type Service = { id: string; name: string; dur: number; price: number; color: string };
export type Pro = { id: string; name: string; first: string; color: string };
export type Client = {
  id: string; name: string; phone: string; type: string; company: string;
  stage: number; next: string; overdue: boolean;
};
export type Appt = { id: string; day: number; start: number; client: string; svc: string; pro: string; status: ApptStatus; paid: boolean };
export type Receivable = { id: string; desc: string; kind: string; date: string; amount: number; status: PayStatus; method: string; due: string };
export type Interaction = { kind: string; date: string; text: string };
export type Notif = { id: string; title: string; text: string; time: string; read: boolean; icon: NotifIcon; appt: string };
export type NotifIcon = 'calendar-plus' | 'circle-check' | 'bell' | 'calendar-x';
export type Tx = { id: string; type: TxType; desc: string; who: string; day: number; date: string; amount: number; status: PayStatus; method: string };

export const TODAY = 1;
export const NOW = 640;

export const SERVICES: Service[] = [
  { id: 's1', name: 'Corte feminino', dur: 60, price: 12000, color: '#7c3aed' },
  { id: 's2', name: 'Escova modelada', dur: 45, price: 8000, color: '#5283bd' },
  { id: 's3', name: 'Coloração', dur: 120, price: 26000, color: '#bc8b3f' },
  { id: 's4', name: 'Manicure', dur: 40, price: 4500, color: '#399470' },
  { id: 's5', name: 'Design de sobrancelha', dur: 30, price: 5500, color: '#c86868' },
];

export const PROS: Pro[] = [
  { id: 'p1', name: 'Marina Costa', first: 'Marina', color: '#7C3AED' },
  { id: 'p2', name: 'Rafael Lima', first: 'Rafael', color: '#5283bd' },
  { id: 'p3', name: 'Júlia Prado', first: 'Júlia', color: '#399470' },
];

export const CLIENTS: Client[] = ([
  ['c1', 'Ana Beatriz Souza', '(27) 99812-4410', 'Pessoa física', '', 2, 'Hoje', false],
  ['c2', 'Carla Mendes', '(27) 99733-1020', 'Pessoa física', '', 3, '05/11/2026', false],
  ['c3', 'Fernanda Rocha', '(27) 98845-7712', 'Pessoa física', '', 2, 'Hoje', false],
  ['c4', 'Juliana Alves', '(27) 99671-3305', 'Pessoa física', '', 3, 'Não definido', false],
  ['c5', 'Patrícia Nunes', '(27) 99502-8841', 'Empresa', 'Clínica Bem Viver', 1, '24/10/2026', true],
  ['c6', 'Renata Oliveira', '(27) 99218-6630', 'Pessoa física', '', 0, 'Amanhã', false],
  ['c7', 'Camila Torres', '(27) 98107-2259', 'Pessoa física', '', 0, 'Hoje', false],
  ['c8', 'Beatriz Lima', '(27) 99954-0187', 'Pessoa física', '', 1, '22/10/2026', true],
  ['c9', 'Larissa Pinto', '(27) 99340-5521', 'Pessoa física', '', 4, 'Não definido', false],
] as const).map(([id, name, phone, type, company, stage, next, overdue]) => ({ id, name, phone, type, company, stage, next, overdue }));

export const STAGES = ['Novo contato', 'Em negociação', 'Em atendimento', 'Pós-atendimento', 'Inativo'];
// [foreground, background, border]
export const STAGE_COLORS: [string, string, string][] = [
  ['#717682', '#f6f7f9', '#e7e9ef'],
  ['#a37b2b', '#fffaed', '#f1e5c8'],
  ['#835aaf', '#f3effb', '#e6dcf3'],
  ['#4d8b6f', '#edf8f3', '#d8ece2'],
  ['#909099', '#f5f5f6', '#e9e9ec'],
];

// [foreground, background]
export const STATUS_COLORS: Record<ApptStatus | PayStatus, [string, string]> = {
  'Agendado': ['#9866d5', '#f3edfd'],
  'Confirmado': ['#5283bd', '#eef5ff'],
  'Em atendimento': ['#bc8b3f', '#fff8e9'],
  'Concluído': ['#399470', '#eaf8f0'],
  'Cancelado': ['#c86868', '#fdefef'],
  'Não compareceu': ['#9b939f', '#f2f1f4'],
  'Pago': ['#399470', '#eaf8f0'],
  'Pendente': ['#bc8b3f', '#fff8e9'],
  'Atrasado': ['#c86868', '#fdefef'],
  'Parcial': ['#5283bd', '#eef5ff'],
};

export const METHODS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência', 'Outro'];
export const KINDS = ['Observação', 'Ligação', 'WhatsApp', 'E-mail', 'Reunião'];

// [short, day of month, label]
export const DAYS: [string, number, string][] = [
  ['Seg', 26, 'segunda, 26/10'],
  ['Ter', 27, 'terça, 27/10'],
  ['Qua', 28, 'quarta, 28/10'],
  ['Qui', 29, 'quinta, 29/10'],
  ['Sex', 30, 'sexta, 30/10'],
  ['Sáb', 31, 'sábado, 31/10'],
  ['Dom', 1, 'domingo, 01/11'],
];
export const FULL_DAYS = [
  'Segunda-feira, 26 de outubro', 'Terça-feira, 27 de outubro', 'Quarta-feira, 28 de outubro',
  'Quinta-feira, 29 de outubro', 'Sexta-feira, 30 de outubro', 'Sábado, 31 de outubro', 'Domingo, 1 de novembro',
];

const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

export const APPTS: Appt[] = ([
  ['a1', 1, '08:30', 'c1', 's1', 'p1', 'Concluído', 1], ['a2', 1, '09:00', 'c2', 's4', 'p3', 'Concluído', 1],
  ['a3', 1, '10:00', 'c3', 's3', 'p2', 'Em atendimento', 0], ['a4', 1, '11:00', 'c4', 's2', 'p1', 'Confirmado', 0],
  ['a5', 1, '11:30', 'c5', 's5', 'p3', 'Agendado', 0], ['a6', 1, '13:30', 'c6', 's1', 'p1', 'Confirmado', 0],
  ['a7', 1, '14:00', 'c7', 's4', 'p3', 'Agendado', 0], ['a8', 1, '15:30', 'c8', 's3', 'p2', 'Agendado', 0],
  ['a9', 1, '17:00', 'c2', 's2', 'p1', 'Agendado', 0],
  ['b1', 0, '09:00', 'c4', 's1', 'p1', 'Concluído', 1], ['b2', 0, '10:30', 'c9', 's5', 'p3', 'Cancelado', 0],
  ['b3', 0, '14:00', 'c6', 's3', 'p2', 'Concluído', 1], ['b4', 0, '16:00', 'c1', 's4', 'p3', 'Concluído', 1],
  ['d1', 2, '09:00', 'c9', 's5', 'p3', 'Cancelado', 0], ['d2', 2, '10:00', 'c5', 's1', 'p1', 'Agendado', 0],
  ['d3', 2, '14:00', 'c3', 's4', 'p3', 'Agendado', 0], ['d4', 2, '16:00', 'c7', 's3', 'p2', 'Agendado', 0],
  ['e1', 3, '08:30', 'c8', 's2', 'p1', 'Agendado', 0], ['e2', 3, '13:00', 'c1', 's3', 'p2', 'Agendado', 0],
  ['e3', 3, '15:00', 'c6', 's4', 'p3', 'Agendado', 0],
  ['f1', 4, '09:00', 'c2', 's1', 'p1', 'Agendado', 0], ['f2', 4, '10:00', 'c4', 's4', 'p3', 'Agendado', 0],
  ['f3', 4, '11:00', 'c3', 's2', 'p1', 'Agendado', 0], ['f4', 4, '14:00', 'c5', 's3', 'p2', 'Agendado', 0],
  ['f5', 4, '16:30', 'c7', 's5', 'p3', 'Agendado', 0],
  ['g1', 5, '08:00', 'c6', 's2', 'p1', 'Agendado', 0], ['g2', 5, '09:00', 'c1', 's4', 'p3', 'Agendado', 0],
  ['g3', 5, '10:00', 'c8', 's1', 'p1', 'Agendado', 0], ['g4', 5, '13:00', 'c4', 's3', 'p2', 'Agendado', 0],
] as const).map(([id, day, start, client, svc, pro, status, paid]) => ({ id, day, start: toMin(start), client, svc, pro, status, paid: !!paid }));

type RcRow = [string, string, string, string, number, PayStatus, string, string];
const RC: Record<string, RcRow[]> = {
  c1: [['r1', 'Corte feminino', 'Agendamento', '27/10/2026', 12000, 'Pago', 'Pix', ''], ['r2', 'Manicure', 'Agendamento', '26/10/2026', 4500, 'Pago', 'Cartão de débito', '']],
  c2: [['r3', 'Manicure', 'Agendamento', '27/10/2026', 4500, 'Pago', 'Dinheiro', ''], ['r4', 'Escova modelada', 'Agendamento', '27/10/2026', 8000, 'Pendente', 'Pix', '27/10/2026']],
  c3: [['r5', 'Coloração', 'Agendamento', '27/10/2026', 26000, 'Pendente', 'Pix', '27/10/2026']],
  c4: [['r6', 'Corte feminino', 'Agendamento', '26/10/2026', 12000, 'Pago', 'Pix', '']],
  c5: [['r7', 'Pacote corporativo · outubro', 'Lançamento avulso', '10/10/2026', 48000, 'Atrasado', 'Transferência', '20/10/2026'], ['r8', 'Design de sobrancelha', 'Agendamento', '27/10/2026', 5500, 'Pendente', 'Pix', '27/10/2026']],
  c6: [['r9', 'Coloração', 'Agendamento', '26/10/2026', 26000, 'Pago', 'Cartão de crédito', '']],
  c8: [['r10', 'Coloração', 'Agendamento', '15/10/2026', 26000, 'Atrasado', 'Pix', '15/10/2026']],
};
export const RECEIVABLES: Record<string, Receivable[]> = Object.fromEntries(Object.entries(RC).map(([k, v]) =>
  [k, v.map(([id, desc, kind, date, amount, status, method, due]) => ({ id, desc, kind, date, amount, status, method, due }))]));

const IN: Record<string, [string, string, string][]> = {
  c1: [['WhatsApp', '25/10/2026', 'Pediu sugestão de horário para coloração em novembro.'], ['Observação', '12/10/2026', 'Prefere atendimento com a Marina, no início da manhã.']],
  c3: [['Ligação', '24/10/2026', 'Confirmou coloração para terça às 10h.']],
  c5: [['E-mail', '21/10/2026', 'Orçamento do pacote corporativo enviado.'], ['Reunião', '08/10/2026', 'Alinhado atendimento mensal para 6 colaboradoras.']],
  c8: [['WhatsApp', '20/10/2026', 'Lembrete de pagamento enviado. Retornar esta semana.']],
  c7: [['Observação', '27/10/2026', 'Primeiro agendamento feito pelo link público.']],
};
export const INTERACTIONS: Record<string, Interaction[]> = Object.fromEntries(Object.entries(IN).map(([k, v]) =>
  [k, v.map(([kind, date, text]) => ({ kind, date, text }))]));

export const NOTIFS: Notif[] = [
  { id: 'n1', title: 'Novo agendamento', text: 'Camila Torres agendou Manicure para hoje às 14:00.', time: 'Há 12 min', read: false, icon: 'calendar-plus', appt: 'a7' },
  { id: 'n2', title: 'Agendamento confirmado', text: 'Juliana Alves confirmou Escova modelada às 11:00.', time: 'Há 40 min', read: false, icon: 'circle-check', appt: 'a4' },
  { id: 'n3', title: 'Lembrete', text: 'Fernanda Rocha começa Coloração às 10:00 com Rafael.', time: 'Hoje, 09:45', read: true, icon: 'bell', appt: 'a3' },
  { id: 'n4', title: 'Agendamento cancelado', text: 'Larissa Pinto cancelou Design de sobrancelha de quarta-feira.', time: 'Ontem, 18:20', read: true, icon: 'calendar-x', appt: 'd1' },
];

// Cost of supplies per service.
export const SERVICE_COST: Record<string, number> = { s1: 2000, s2: 1200, s3: 7000, s4: 800, s5: 600 };
// Payment method of appointments already paid.
export const APPT_METHOD: Record<string, string> = { a1: 'Pix', a2: 'Dinheiro', b1: 'Pix', b3: 'Cartão de crédito', b4: 'Cartão de débito' };

// Manual entries. day -1 = earlier in the month.
export const TXS: Tx[] = [
  { id: 't1', type: 'Despesa', desc: 'Aluguel do salão', who: '', day: -1, date: '05/10', amount: 250000, status: 'Pago', method: 'Transferência' },
  { id: 't5', type: 'Receita', desc: 'Pacote corporativo · outubro', who: 'Patrícia Nunes', day: -1, date: '10/10', amount: 48000, status: 'Pendente', method: 'Transferência' },
  { id: 't2', type: 'Despesa', desc: 'Produtos de coloração', who: '', day: 0, date: '26/10', amount: 38900, status: 'Pago', method: 'Cartão de crédito' },
  { id: 't3', type: 'Receita', desc: 'Venda · Kit de tratamento', who: 'Ana Beatriz Souza', day: 1, date: '27/10', amount: 15900, status: 'Pago', method: 'Pix' },
  { id: 't4', type: 'Despesa', desc: 'Conta de energia', who: '', day: 1, date: '27/10', amount: 21400, status: 'Pendente', method: 'Pix' },
];

// Aggregated totals for October before this week, used by the "Mês" period.
export const EARLY_MONTH = {
  rev: 1187000,
  costs: 242000,
  pay: { 'Pix': 612000, 'Cartão de crédito': 318000, 'Cartão de débito': 167000, 'Dinheiro': 90000 } as Record<string, number>,
  weeks: [182000, 341500, 298000, 365500],
  txCount: 142,
};

export const NEXT_STEP: Partial<Record<ApptStatus, [string, ApptStatus]>> = {
  'Agendado': ['Confirmar agendamento', 'Confirmado'],
  'Confirmado': ['Iniciar atendimento', 'Em atendimento'],
  'Em atendimento': ['Concluir atendimento', 'Concluído'],
};

export const OB_TITLES = ['Vamos configurar seu negócio', 'Sua rotina começa pelos horários', 'Quais serviços você oferece?', 'Você trabalha sozinho ou possui equipe?'];
export const OB_TYPES = ['Salão de beleza', 'Barbearia', 'Estética', 'Clínica', 'Consultoria', 'Prestação de serviços'];
export const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
