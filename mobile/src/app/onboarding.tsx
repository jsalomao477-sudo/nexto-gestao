import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CircleCheck, Plus, Scissors, Trash2 } from 'lucide-react-native';
import { OB_TITLES, OB_TYPES, WEEKDAYS } from '../data/mock';
import { Btn, Field, Input, NexoMark, PrimaryButton, T, s } from '../components/ui';
import { useStore } from '../store';
import { C } from '../theme';

const card = { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9e0f2', borderRadius: 15, flex: 1 } as const;

export default function Onboarding() {
  const router = useRouter();
  const { flash } = useStore();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [biz, setBiz] = useState('');
  const [type, setType] = useState('Salão de beleza');
  const [hours, setHours] = useState([true, true, true, true, true, true, false]);
  const [svcs, setSvcs] = useState([{ name: 'Corte feminino', meta: '60 min · R$ 120,00' }]);
  const [svc, setSvc] = useState('');
  const [mode, setMode] = useState<'alone' | 'team'>('team');

  const valid = [!!(name.trim() && biz.trim()), true, svcs.length > 0, true][step];
  const next = () => {
    if (!valid) { flash(step === 0 ? 'Informe seu nome e o nome do negócio.' : 'Adicione pelo menos um serviço.'); return; }
    if (step === 3) setDone(true); else setStep(step + 1);
  };
  const addSvc = () => { if (svc.trim()) { setSvcs([...svcs, { name: svc.trim(), meta: '30 min · Preço a definir' }]); setSvc(''); } };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#faf8fd', paddingTop: insets.top + 6, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 20) }}>
      <View style={[s.row, { justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 16 }]}>
        <View style={[s.row, { gap: 8 }]}><NexoMark size={30} radius={8} /><T size={17} w={700} ls={-0.8} color="#24212f">Nexo Gestão</T></View>
        <Btn onPress={() => router.replace('/login')}><T size={12} w={600} color={C.primary}>Já tenho conta</T></Btn>
      </View>

      {done ? (
        <View style={[card, { paddingVertical: 40, paddingHorizontal: 22, alignItems: 'center' }]}>
          <CircleCheck size={48} color={C.success} style={{ marginTop: 40 }} />
          <T size={25} w={600} ls={-0.6} color={C.heading} style={{ marginTop: 18 }}>Tudo pronto!</T>
          <T size={14} lh={1.85} color={C.secondary} center style={{ marginTop: 16, marginBottom: 30 }}>Seu espaço no Nexo Gestão está configurado. Agora você já pode cadastrar clientes e começar a organizar seus atendimentos.</T>
          <PrimaryButton label="Ir para o painel" iconAfter={ArrowRight} height={53} size={15} style={{ alignSelf: 'stretch' }} onPress={() => router.replace('/inicio')} />
        </View>
      ) : (
        <View style={[card, { paddingVertical: 26, paddingHorizontal: 20, minHeight: 0 }]}>
          <T size={10} w={600} ls={1} color="#8b819b">ETAPA {step + 1} DE 4</T>
          <View style={{ height: 4, borderRadius: 4, backgroundColor: '#f0e6f8', marginTop: 12, marginBottom: 22, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${(step + 1) * 25}%`, backgroundColor: C.violet, borderRadius: 4 }} />
          </View>
          <T size={23} w={600} ls={-0.6} lh={1.3} color={C.heading}>{OB_TITLES[step]}</T>
          <T size={13} lh={1.7} color={C.secondary} style={{ marginTop: 10, marginBottom: 22 }}>Você pode ajustar todas essas informações depois.</T>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled">
            {step === 0 && (
              <>
                <Field label="Seu nome completo *"><Input value={name} onChangeText={setName} placeholder="Como podemos chamar você?" textContentType="name" /></Field>
                <Field label="Nome do negócio *"><Input value={biz} onChangeText={setBiz} placeholder="Ex.: Barbearia Imperial" textContentType="organizationName" /></Field>
                <Field label="Tipo de negócio" gap={9}>
                  <View style={[s.row, { flexWrap: 'wrap', gap: 8 }]}>
                    {OB_TYPES.map(t => {
                      const sel = t === type;
                      return (
                        <Btn key={t} onPress={() => setType(t)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: sel ? C.violet : C.border, backgroundColor: sel ? C.violetSoft : '#fff' }}>
                          <T size={13} w={500} color={sel ? C.violetText : C.label}>{t}</T>
                        </Btn>
                      );
                    })}
                  </View>
                </Field>
              </>
            )}

            {step === 1 && (
              <View style={{ borderWidth: 1, borderColor: '#e9e0f1', borderRadius: 10, overflow: 'hidden' }}>
                {WEEKDAYS.map((d, i) => {
                  const on = hours[i];
                  return (
                    <View key={d} style={[s.row, { justifyContent: 'space-between', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: i < 6 ? 1 : 0, borderColor: '#eee6f6' }]}>
                      <Btn onPress={() => setHours(hours.map((v, j) => j === i ? !v : v))} accessibilityRole="switch" accessibilityState={{ checked: on }} style={[s.row, { gap: 10 }]} pressedStyle={{}}>
                        <View style={{ width: 36, height: 21, borderRadius: 20, backgroundColor: on ? C.violet : '#e1e3e8' }}>
                          <View style={{ position: 'absolute', top: 2, left: on ? 17 : 2, width: 17, height: 17, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 1, shadowOffset: { width: 0, height: 1 } }} />
                        </View>
                        <T size={13} w={500} color={C.label}>{d}</T>
                      </Btn>
                      <T size={12} color={on ? C.body : C.faint}>{on ? (i === 5 ? '08:00–12:00 · 13:00–17:00' : '08:00–12:00 · 13:00–19:00') : 'Fechado'}</T>
                    </View>
                  );
                })}
              </View>
            )}

            {step === 2 && (
              <>
                <View style={[s.row, { gap: 8 }]}>
                  <Input value={svc} onChangeText={setSvc} onSubmitEditing={addSvc} placeholder="Ex.: Corte masculino" style={{ flex: 1, minWidth: 0 }} returnKeyType="done" />
                  <Btn onPress={addSvc} style={[s.row, { alignSelf: 'stretch', gap: 6, paddingHorizontal: 13, borderRadius: 8, borderWidth: 1, borderColor: C.borderButton, backgroundColor: '#fff' }]}>
                    <Plus size={14} color={C.label} /><T size={13} w={600} color={C.label}>Adicionar</T>
                  </Btn>
                </View>
                <View>
                  {svcs.map((x, i) => (
                    <View key={i} style={[s.row, { gap: 10, borderBottomWidth: 1, borderColor: '#f0e5f9', paddingVertical: 13 }]}>
                      <Scissors size={16} color="#835aaf" />
                      <View style={{ flex: 1 }}><T size={13} w={600}>{x.name}</T><T size={11} color="#737785" style={{ marginTop: 2 }}>{x.meta}</T></View>
                      <Btn onPress={() => setSvcs(svcs.filter((_, j) => j !== i))} accessibilityLabel="Remover serviço" style={{ padding: 6 }}><Trash2 size={15} color="#9b939f" /></Btn>
                    </View>
                  ))}
                </View>
              </>
            )}

            {step === 3 && ([['alone', 'Trabalho sozinho'], ['team', 'Tenho uma equipe']] as const).map(([k, l]) => {
              const sel = mode === k;
              return (
                <Btn key={k} onPress={() => setMode(k)} style={[s.row, { gap: 12, padding: 17, borderWidth: 1, borderRadius: 9, borderColor: sel ? C.violetBorder : '#ebdcf5', backgroundColor: sel ? '#fcfaff' : '#fff' }]}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: sel ? C.violet : C.emptyIcon, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sel ? C.violet : 'transparent' }} />
                  </View>
                  <T size={14}>{l}</T>
                </Btn>
              );
            })}
          </ScrollView>

          <View style={[s.row, { gap: 10, paddingTop: 18, marginTop: 16, borderTopWidth: 1, borderColor: '#f0e9f6' }]}>
            {step > 0 && (
              <Btn onPress={() => setStep(step - 1)} style={[s.row, { gap: 8, paddingHorizontal: 15, minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: C.borderButton }]}>
                <ArrowLeft size={15} color={C.label} /><T size={14} w={600} color={C.label}>Voltar</T>
              </Btn>
            )}
            <PrimaryButton label={step === 3 ? 'Concluir configuração' : 'Continuar'} iconAfter={ArrowRight} height={46} radius={8} style={{ flex: 1 }} onPress={next} />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
