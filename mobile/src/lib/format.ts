// BRL formatting done by hand so it doesn't depend on the JS engine's Intl support.
// Output matches Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).
const NBSP = ' ';
const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const money = (cents: number) => {
  const neg = cents < 0, abs = Math.round(Math.abs(cents));
  return (neg ? '-' : '') + 'R$' + NBSP + group(Math.floor(abs / 100)) + ',' + pad2(abs % 100);
};

// Same as the compact currency notation: "R$ 1,2 mil", "R$ 3 mi".
export const compactMoney = (cents: number) => {
  const v = cents / 100;
  const fmt = (x: number, unit: string) => {
    const r = Math.round(x * 10) / 10;
    return 'R$' + NBSP + String(r).replace('.', ',') + NBSP + unit;
  };
  if (v >= 1e6) return fmt(v / 1e6, 'mi');
  if (v >= 1e3) return fmt(v / 1e3, 'mil');
  return 'R$' + NBSP + String(Math.round(v));
};

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const hhmm = (min: number) => pad2(Math.floor(min / 60)) + ':' + pad2(min % 60);
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
