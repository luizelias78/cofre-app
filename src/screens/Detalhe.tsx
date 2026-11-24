import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { autenticar } from '../auth';
import { excluir, Registro, salvar } from '../storage';
import { categorias, colors } from '../theme';
import { BotaoIcone, Cartao } from '../components/ui';

const SEGUNDOS_VISIVEL = 30;

export default function Detalhe({
  item,
  onVoltar,
  onEditar,
  onAlterado,
}: {
  item: Registro;
  onVoltar: () => void;
  onEditar: () => void;
  onAlterado: () => void;
}) {
  const insets = useSafeAreaInsets();
  const cat = categorias[item.categoria];
  const [visivel, setVisivel] = useState(false);
  const [restante, setRestante] = useState(0);
  const [copiado, setCopiado] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function pedirPin(): Promise<boolean> {
    try {
      return await autenticar('Confirme para ver a senha');
    } catch {
      Alert.alert('Sem bloqueio de tela', 'Configure um PIN no celular para revelar senhas.');
      return false;
    }
  }

  async function revelar() {
    if (visivel) {
      esconder();
      return;
    }
    if (!(await pedirPin())) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVisivel(true);
    setRestante(SEGUNDOS_VISIVEL);
    timer.current = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          esconder();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function esconder() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setVisivel(false);
  }

  async function copiar(texto: string, rotulo: string, protegido = false) {
    if (protegido && !visivel && !(await pedirPin())) return;
    await Clipboard.setStringAsync(texto);
    Haptics.selectionAsync();
    setCopiado(rotulo);
    setTimeout(() => setCopiado(''), 1800);
    if (protegido) {
      // limpa a área de transferência depois de 45s
      setTimeout(async () => {
        if ((await Clipboard.getStringAsync()) === texto) Clipboard.setStringAsync('');
      }, 45000);
    }
  }

  function abrirUrl() {
    const u = /^https?:\/\//i.test(item.url) ? item.url : 'https://' + item.url;
    Linking.openURL(u).catch(() => Alert.alert('Não foi possível abrir o link'));
  }

  async function favoritar() {
    await salvar({ ...item, favorito: !item.favorito });
    onAlterado();
  }

  function apagar() {
    Alert.alert('Excluir?', `"${item.titulo}" será apagado do cofre para sempre.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!(await pedirPin())) return;
          await excluir(item.id);
          onAlterado();
          onVoltar();
        },
      },
    ]);
  }

  return (
    <View style={[s.tela, { paddingTop: insets.top + 8 }]}>
      <LinearGradient colors={[cat.cor + '40', 'transparent']} style={[StyleSheet.absoluteFill, { height: 360 }]} />
      <View style={s.topo}>
        <BotaoIcone icone="chevron-back" onPress={onVoltar} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <BotaoIcone icone={item.favorito ? 'star' : 'star-outline'} cor={item.favorito ? '#FBBF24' : colors.text} onPress={favoritar} />
          <BotaoIcone icone="create-outline" onPress={onEditar} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View style={s.cabecalho}>
          <View style={[s.avatar, { backgroundColor: cat.cor + '26', borderColor: cat.cor + '66' }]}>
            <Text style={[s.avatarLetra, { color: cat.cor }]}>{item.titulo[0]?.toUpperCase()}</Text>
          </View>
          <Text style={s.nome}>{item.titulo}</Text>
          <View style={[s.pill, { backgroundColor: cat.cor + '22' }]}>
            <Ionicons name={cat.icon as any} size={13} color={cat.cor} />
            <Text style={[s.pillTexto, { color: cat.cor }]}>{cat.label}</Text>
          </View>
        </View>

        <Cartao style={{ gap: 4 }}>
          {!!item.url && (
            <Linha rotulo="URL" valor={item.url} icone="link-outline">
              <BotaoIcone fundo={false} icone="open-outline" tamanho={20} cor={colors.primary2} onPress={abrirUrl} />
              <BotaoIcone fundo={false} icone="copy-outline" tamanho={20} cor={colors.textDim} onPress={() => copiar(item.url, 'URL')} />
            </Linha>
          )}
          {!!item.usuario && (
            <Linha
              rotulo={item.categoria === 'wifi' ? 'Rede' : 'E-mail / usuário'}
              valor={item.usuario}
              icone="person-outline"
            >
              <BotaoIcone fundo={false} icone="copy-outline" tamanho={20} cor={colors.textDim} onPress={() => copiar(item.usuario, 'Usuário')} />
            </Linha>
          )}
          <Linha
            rotulo={visivel ? `Senha · some em ${restante}s` : 'Senha'}
            valor={visivel ? item.senha : '•'.repeat(Math.min(Math.max(item.senha.length, 8), 14))}
            icone="key-outline"
            mono
            ultimo
          >
            <BotaoIcone fundo={false} icone={visivel ? 'eye-off-outline' : 'eye-outline'} tamanho={20} cor={colors.primary} onPress={revelar} />
            <BotaoIcone fundo={false} icone="copy-outline" tamanho={20} cor={colors.textDim} onPress={() => copiar(item.senha, 'Senha', true)} />
          </Linha>
        </Cartao>

        {!visivel && (
          <View style={s.aviso}>
            <Ionicons name="finger-print" size={16} color={colors.textDim} />
            <Text style={s.avisoTexto}>Toque no olho para ver a senha com seu PIN ou digital</Text>
          </View>
        )}

        {!!item.descricao && (
          <Cartao style={{ marginTop: 16 }}>
            <Text style={s.rotulo}>Descrição</Text>
            <Text style={s.descricao}>{item.descricao}</Text>
          </Cartao>
        )}

        <Text style={s.data}>
          Atualizado em {new Date(item.atualizadoEm).toLocaleDateString('pt-BR')}
        </Text>

        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <BotaoIcone icone="trash-outline" cor={colors.danger} onPress={apagar} />
        </View>
      </ScrollView>

      {!!copiado && (
        <View style={[s.toast, { bottom: insets.bottom + 30 }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={s.toastTexto}>{copiado} copiado</Text>
        </View>
      )}
    </View>
  );
}

function Linha({
  rotulo,
  valor,
  icone,
  children,
  mono,
  ultimo,
}: {
  rotulo: string;
  valor: string;
  icone: any;
  children?: React.ReactNode;
  mono?: boolean;
  ultimo?: boolean;
}) {
  return (
    <View style={[s.linha, !ultimo && s.linhaBorda]}>
      <Ionicons name={icone} size={18} color={colors.textDim} />
      <View style={{ flex: 1 }}>
        <Text style={s.rotulo}>{rotulo}</Text>
        <Text style={[s.valor, mono && s.mono]} selectable={false} numberOfLines={2}>
          {valor}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  topo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  cabecalho: { alignItems: 'center', marginBottom: 24, marginTop: 4 },
  avatar: { width: 88, height: 88, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarLetra: { fontSize: 38, fontWeight: '800' },
  nome: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 16, textAlign: 'center', letterSpacing: -0.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginTop: 10 },
  pillTexto: { fontSize: 12, fontWeight: '700' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  linhaBorda: { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  rotulo: { color: colors.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  valor: { color: colors.text, fontSize: 16 },
  mono: { fontFamily: 'monospace', letterSpacing: 1.5, fontSize: 17 },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 14 },
  avisoTexto: { color: colors.textDim, fontSize: 13 },
  descricao: { color: colors.text, fontSize: 15, lineHeight: 22 },
  data: { color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: 24 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E30',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toastTexto: { color: colors.text, fontWeight: '600' },
});
