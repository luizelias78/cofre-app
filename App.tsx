import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Bloqueio from './src/screens/Bloqueio';
import Lista from './src/screens/Lista';
import Formulario from './src/screens/Formulario';
import Detalhe from './src/screens/Detalhe';
import { listar, Registro } from './src/storage';
import { colors } from './src/theme';

type Tela =
  | { nome: 'lista' }
  | { nome: 'detalhe'; id: string }
  | { nome: 'form'; id?: string; voltarPara: 'lista' | 'detalhe' };

// Tempo em segundo plano depois do qual o app volta a ficar bloqueado
const BLOQUEAR_APOS_MS = 30_000;

export default function App() {
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [itens, setItens] = useState<Registro[]>([]);
  const [tela, setTela] = useState<Tela>({ nome: 'lista' });
  const saiuEm = useRef<number | null>(null);

  const recarregar = useCallback(async () => setItens(await listar()), []);

  useEffect(() => {
    if (desbloqueado) recarregar();
  }, [desbloqueado, recarregar]);

  // Bloqueia de novo quando o app fica um tempo em segundo plano
  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'background') saiuEm.current = Date.now();
      if (estado === 'active' && saiuEm.current && Date.now() - saiuEm.current > BLOQUEAR_APOS_MS) {
        bloquear();
      }
      if (estado === 'active') saiuEm.current = null;
    });
    return () => sub.remove();
  }, []);

  function bloquear() {
    setDesbloqueado(false);
    setItens([]);
    setTela({ nome: 'lista' });
  }

  const atual = tela.nome !== 'lista' && tela.id ? itens.find((i) => i.id === tela.id) : undefined;

  let conteudo: React.ReactNode;
  if (!desbloqueado) {
    conteudo = <Bloqueio onDesbloquear={() => setDesbloqueado(true)} />;
  } else if (tela.nome === 'form') {
    conteudo = (
      <Formulario
        inicial={atual}
        onFechar={() => setTela(tela.voltarPara === 'detalhe' && tela.id ? { nome: 'detalhe', id: tela.id } : { nome: 'lista' })}
        onSalvo={async (r) => {
          await recarregar();
          setTela({ nome: 'detalhe', id: r.id });
        }}
      />
    );
  } else if (tela.nome === 'detalhe' && atual) {
    conteudo = (
      <Detalhe
        key={atual.id + atual.atualizadoEm}
        item={atual}
        onVoltar={() => setTela({ nome: 'lista' })}
        onEditar={() => setTela({ nome: 'form', id: atual.id, voltarPara: 'detalhe' })}
        onAlterado={recarregar}
      />
    );
  } else {
    conteudo = (
      <Lista
        itens={itens}
        onAbrir={(r) => setTela({ nome: 'detalhe', id: r.id })}
        onNovo={() => setTela({ nome: 'form', voltarPara: 'lista' })}
        onBloquear={bloquear}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>{conteudo}</View>
    </SafeAreaProvider>
  );
}
