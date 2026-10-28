# Nexo Equipe (app da equipe)

App iOS e Android da equipe do Nexo Gestão, em Expo + Expo Router + TypeScript. Implementa o design `project/Nexo Equipe.dc.html` exportado do Claude Design.

## Rodar

```bash
npm install
npx expo start      # abra no Expo Go (iPhone ou Android); "i" abre o simulador iOS, "a" o emulador Android
npm run typecheck
```

## Gerar o app Android

Os builds rodam no EAS (nuvem da Expo). É preciso uma conta Expo gratuita; o primeiro build pede login e cria a chave de assinatura.

```bash
npm run build:android         # .apk para instalar direto no celular (perfil "preview")
npm run build:android:store   # .aab para a Google Play (perfil "production")
```

Com o Android SDK instalado na máquina, também dá para gerar localmente: `npx expo run:android --variant release`.

No Android: o botão voltar fecha a folha aberta, os toques têm efeito ripple, e o ícone adaptativo usa a marca Nexo sobre roxo `#7c3aed` (com versão monocromática para ícones temáticos). Pacote: `com.nexo.equipe`.

## Telas

| Rota | Tela |
| --- | --- |
| `/login` | Login (tela inicial) |
| `/onboarding` | Criar conta: 4 etapas + "Tudo pronto" |
| `/(tabs)/inicio` | Início (variante A: painel do dia) |
| `/(tabs)/agenda` | Agenda: dia por profissional e semana |
| `/(tabs)/crm` | Clientes e CRM |
| `/(tabs)/financeiro` | Financeiro |
| `/(tabs)/avisos` | Avisos, aberto pelo sino do Início, sem botão na barra |
| `/cliente/[id]` | Perfil do cliente: interações e recebimentos |

As folhas (detalhe do atendimento, novo agendamento, status do pagamento, movimentação) e o toast ficam em `src/components/sheets.tsx`. Elas aparecem por cima de qualquer tela.

## Estrutura

- `src/data/mock.ts`: dados de exemplo do Studio Aurora. "Hoje" é terça, 27/10, às 10:40.
- `src/store.tsx`: estado em memória e ações (agendamentos, clientes, recebimentos, movimentações, UI).
- `src/lib/selectors.ts`: dados derivados (horários livres, totais do CRM, cálculos do financeiro).
- `src/components/ui.tsx`: componentes base (texto Inter, botões, badges, segmented, chips, input, sheet, hachurado).
- `src/theme.ts`: paleta do painel Nexo.

## Ainda não conectado

- Os dados são fictícios e ficam só na memória. Não há backend nem login de verdade: qualquer e-mail com "@" e uma senha de 4+ caracteres entra.
- "Novo cliente", "Registrar venda", "Editar cadastro" e "Esqueci minha senha" só mostram um aviso, como no protótipo.
- Ligar e WhatsApp só mostram um toast.
