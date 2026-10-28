import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, CalendarDays } from 'lucide-react-native';
import { Btn, Field, Input, NexoMark, PrimaryButton, T, s } from '../components/ui';
import { useStore } from '../store';
import { C } from '../theme';

export default function Login() {
  const router = useRouter();
  const { flash } = useStore();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('marina@studioaurora.com.br');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!email.includes('@') || pass.length < 4) { setError('Confira seu e-mail e senha e tente novamente.'); return; }
    router.replace('/inicio');
    flash('Bem-vinda de volta, Marina.');
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingHorizontal: 26, paddingBottom: Math.max(insets.bottom, 20) + 6 }} keyboardShouldPersistTaps="handled">
        <View style={[s.row, { gap: 9 }]}>
          <NexoMark size={34} radius={9} />
          <T size={18} w={700} ls={-0.8} color="#24212f">Nexo Gestão</T>
        </View>
        <View style={{ marginTop: 56, width: 59, height: 59, borderRadius: 16, backgroundColor: '#f1e7fd', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarDays size={28} color={C.violet} />
        </View>
        <T size={30} w={600} ls={-1} lh={1.2} color={C.heading} style={{ marginTop: 26, marginBottom: 10 }}>Bom ter você de volta.</T>
        <T size={15} lh={1.7} color={C.secondary}>Acesse seu espaço e organize seu negócio com tranquilidade.</T>

        <View style={{ gap: 16, marginTop: 28 }}>
          <Field label="E-mail" size={14} w={600} color={C.text}>
            <Input value={email} onChangeText={setEmail} placeholder="voce@seunegocio.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" style={{ borderColor: '#d4d4d8', borderRadius: 10, padding: 12 }} />
          </Field>
          <Field label="Senha" size={14} w={600} color={C.text}>
            <Input value={pass} onChangeText={v => { setPass(v); setError(''); }} placeholder="Sua senha" secureTextEntry textContentType="password" onSubmitEditing={submit} returnKeyType="go" style={{ borderColor: '#d4d4d8', borderRadius: 10, padding: 12 }} />
          </Field>
          {!!error && (
            <View style={{ backgroundColor: '#fff1f1', borderWidth: 1, borderColor: '#f4d2d2', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8 }}>
              <T size={13} lh={1.6} color="#ad3939">{error}</T>
            </View>
          )}
          <PrimaryButton label="Entrar" iconAfter={ArrowRight} height={53} size={15} onPress={submit} />
          <Btn onPress={() => flash('Recuperação de senha disponível no painel completo.')} style={{ alignItems: 'center' }}>
            <T size={13} color="#6d28d9">Esqueci minha senha</T>
          </Btn>
        </View>

        <View style={[s.row, { marginTop: 'auto', borderTopWidth: 1, borderColor: C.borderSoft, paddingTop: 22, justifyContent: 'center', gap: 4 }]}>
          <T size={13} color={C.secondary}>Ainda não tem conta?</T>
          <Btn onPress={() => router.push('/onboarding')}><T size={13} w={600} color={C.primary}>Criar conta</T></Btn>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
