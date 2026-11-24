import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { autenticar } from '../auth';
import { BotaoGradiente } from '../components/ui';
import { colors, gradient } from '../theme';

export default function Bloqueio({ onDesbloquear }: { onDesbloquear: () => void }) {
  const [erro, setErro] = useState('');

  async function tentar() {
    setErro('');
    try {
      if (await autenticar('Desbloquear o Cofre')) onDesbloquear();
      else setErro('Autenticação cancelada. Toque para tentar de novo.');
    } catch (e: any) {
      setErro(
        e?.message === 'SEM_BLOQUEIO'
          ? 'Configure um PIN, senha ou digital no seu celular para usar o Cofre.'
          : 'Não foi possível autenticar.',
      );
    }
  }

  useEffect(() => {
    tentar();
  }, []);

  return (
    <View style={s.tela}>
      <LinearGradient
        colors={['rgba(124,92,255,0.35)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      <View style={s.centro}>
        <LinearGradient colors={gradient} style={s.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="shield-checkmark" size={56} color="#fff" />
        </LinearGradient>
        <Text style={s.titulo}>Cofre</Text>
        <Text style={s.sub}>Suas senhas, protegidas pelo seu celular.</Text>
        {!!erro && <Text style={s.erro}>{erro}</Text>}
      </View>
      <BotaoGradiente titulo="Desbloquear" icone="finger-print" onPress={tentar} style={{ margin: 24 }} />
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between', paddingBottom: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: {
    width: 116,
    height: 116,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  titulo: { color: colors.text, fontSize: 40, fontWeight: '800', marginTop: 28, letterSpacing: -1 },
  sub: { color: colors.textDim, fontSize: 16, marginTop: 8, textAlign: 'center' },
  erro: { color: colors.danger, marginTop: 24, textAlign: 'center', fontSize: 14 },
});
