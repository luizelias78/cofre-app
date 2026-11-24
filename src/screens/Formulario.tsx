import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { forcaSenha, gerarSenha, Registro, salvar } from '../storage';
import { Categoria, categorias, colors } from '../theme';
import { BotaoGradiente, BotaoIcone, Campo } from '../components/ui';

export default function Formulario({
  inicial,
  onFechar,
  onSalvo,
}: {
  inicial?: Registro;
  onFechar: () => void;
  onSalvo: (r: Registro) => void;
}) {
  const insets = useSafeAreaInsets();
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [categoria, setCategoria] = useState<Categoria>(inicial?.categoria ?? 'site');
  const [url, setUrl] = useState(inicial?.url ?? '');
  const [usuario, setUsuario] = useState(inicial?.usuario ?? '');
  const [senha, setSenha] = useState(inicial?.senha ?? '');
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [mostrar, setMostrar] = useState(false);
  const forca = forcaSenha(senha);
  const corForca = [colors.textFaint, colors.danger, '#FBBF24', colors.success][forca.nivel];

  async function gravar() {
    if (!titulo.trim()) return Alert.alert('Falta o nome', 'Dê um nome para identificar este registro.');
    if (!senha) return Alert.alert('Falta a senha', 'Digite ou gere uma senha.');
    const r = await salvar({
      id: inicial?.id,
      titulo: titulo.trim(),
      categoria,
      url: url.trim(),
      usuario: usuario.trim(),
      senha,
      descricao: descricao.trim(),
      favorito: inicial?.favorito ?? false,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSalvo(r);
  }

  return (
    <KeyboardAvoidingView
      style={[s.tela, { paddingTop: insets.top + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.topo}>
        <BotaoIcone icone="close" onPress={onFechar} />
        <Text style={s.titulo}>{inicial ? 'Editar' : 'Nova senha'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={s.rotulo}>Tipo</Text>
        <View style={s.tipos}>
          {(Object.keys(categorias) as Categoria[]).map((c) => {
            const cat = categorias[c];
            const ativo = c === categoria;
            return (
              <Pressable
                key={c}
                onPress={() => setCategoria(c)}
                style={[s.tipo, ativo && { borderColor: cat.cor, backgroundColor: cat.cor + '22' }]}
              >
                <Ionicons name={cat.icon as any} size={20} color={ativo ? cat.cor : colors.textDim} />
                <Text style={[s.tipoTexto, ativo && { color: colors.text }]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Campo rotulo="Nome" icone="bookmark-outline" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Gmail, Banco do Brasil, Netflix" />
        {(categoria === 'site' || categoria === 'banco' || categoria === 'email' || categoria === 'outro') && (
          <Campo
            rotulo="URL do site"
            icone="link-outline"
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        )}
        <Campo
          rotulo={categoria === 'wifi' ? 'Nome da rede' : 'E-mail ou usuário'}
          icone={categoria === 'wifi' ? 'wifi-outline' : 'person-outline'}
          value={usuario}
          onChangeText={setUsuario}
          placeholder={categoria === 'wifi' ? 'Nome da rede Wi-Fi' : 'voce@email.com'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={categoria === 'wifi' ? 'default' : 'email-address'}
        />
        <Campo
          rotulo="Senha"
          icone="key-outline"
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          secureTextEntry={!mostrar}
          autoCapitalize="none"
          autoCorrect={false}
          direita={
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <BotaoIcone fundo={false} tamanho={20} cor={colors.textDim} icone={mostrar ? 'eye-off-outline' : 'eye-outline'} onPress={() => setMostrar(!mostrar)} />
              <BotaoIcone
                fundo={false}
                tamanho={20}
                cor={colors.primary2}
                icone="sparkles-outline"
                onPress={() => {
                  setSenha(gerarSenha(16));
                  setMostrar(true);
                  Haptics.selectionAsync();
                }}
              />
            </View>
          }
        />
        {!!senha && (
          <View style={s.forca}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={[s.forcaBarra, { backgroundColor: forca.nivel >= n ? corForca : colors.card }]} />
            ))}
            <Text style={[s.forcaTexto, { color: corForca }]}>{forca.texto}</Text>
          </View>
        )}
        <Campo
          rotulo="Descrição"
          icone="document-text-outline"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Do que se trata, dicas, observações..."
          multiline
          maxLength={600}
        />

        <BotaoGradiente titulo="Salvar no cofre" icone="shield-checkmark-outline" onPress={gravar} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  titulo: { color: colors.text, fontSize: 18, fontWeight: '700' },
  rotulo: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tipo: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  tipoTexto: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  forca: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -6, marginBottom: 18, marginLeft: 4 },
  forcaBarra: { width: 36, height: 5, borderRadius: 3 },
  forcaTexto: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
});
