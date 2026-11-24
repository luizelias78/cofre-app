import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Registro } from '../storage';
import { Categoria, categorias, colors, gradient } from '../theme';
import { BotaoIcone } from '../components/ui';

export default function Lista({
  itens,
  onAbrir,
  onNovo,
  onBloquear,
}: {
  itens: Registro[];
  onAbrir: (r: Registro) => void;
  onNovo: () => void;
  onBloquear: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Categoria | 'todos' | 'favoritos'>('todos');

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens
      .filter((i) =>
        filtro === 'todos' ? true : filtro === 'favoritos' ? i.favorito : i.categoria === filtro,
      )
      .filter(
        (i) =>
          !q ||
          i.titulo.toLowerCase().includes(q) ||
          i.usuario.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q) ||
          i.descricao.toLowerCase().includes(q),
      )
      .sort((a, b) => Number(b.favorito) - Number(a.favorito) || a.titulo.localeCompare(b.titulo));
  }, [itens, busca, filtro]);

  const chips: { id: typeof filtro; label: string; icon: any }[] = [
    { id: 'todos', label: 'Todos', icon: 'apps-outline' },
    { id: 'favoritos', label: 'Favoritos', icon: 'star-outline' },
    ...(Object.keys(categorias) as Categoria[]).map((c) => ({
      id: c,
      label: categorias[c].label,
      icon: categorias[c].icon,
    })),
  ];

  return (
    <View style={[s.tela, { paddingTop: insets.top + 12 }]}>
      <LinearGradient
        colors={['rgba(124,92,255,0.22)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: 320 }]}
      />
      <View style={s.topo}>
        <View>
          <Text style={s.ola}>Seu cofre</Text>
          <Text style={s.contagem}>
            {itens.length} {itens.length === 1 ? 'senha guardada' : 'senhas guardadas'}
          </Text>
        </View>
        <BotaoIcone icone="lock-closed-outline" onPress={onBloquear} />
      </View>

      <View style={s.busca}>
        <Ionicons name="search" size={18} color={colors.textDim} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome, site, e-mail..."
          placeholderTextColor={colors.textFaint}
          style={s.buscaInput}
          selectionColor={colors.primary}
        />
        {!!busca && <BotaoIcone icone="close-circle" fundo={false} tamanho={18} cor={colors.textDim} onPress={() => setBusca('')} />}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {chips.map((c) => {
            const ativo = filtro === c.id;
            return (
              <Pressable key={c.id} onPress={() => setFiltro(c.id)}>
                {ativo ? (
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.chip}>
                    <Ionicons name={c.icon} size={14} color="#fff" />
                    <Text style={[s.chipTexto, { color: '#fff' }]}>{c.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[s.chip, s.chipInativo]}>
                    <Ionicons name={c.icon} size={14} color={colors.textDim} />
                    <Text style={s.chipTexto}>{c.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={visiveis}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={s.vazio}>
            <Ionicons name="key-outline" size={48} color={colors.textFaint} />
            <Text style={s.vazioTitulo}>{itens.length ? 'Nada encontrado' : 'Seu cofre está vazio'}</Text>
            <Text style={s.vazioSub}>
              {itens.length ? 'Tente outra busca ou filtro.' : 'Toque no + para guardar sua primeira senha.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = categorias[item.categoria];
          return (
            <Pressable onPress={() => onAbrir(item)} style={({ pressed }) => [s.item, pressed && { opacity: 0.7 }]}>
              <View style={[s.itemIcone, { backgroundColor: cat.cor + '22' }]}>
                {item.titulo ? (
                  <Text style={[s.itemLetra, { color: cat.cor }]}>{item.titulo[0].toUpperCase()}</Text>
                ) : (
                  <Ionicons name={cat.icon as any} size={22} color={cat.cor} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.itemTitulo} numberOfLines={1}>{item.titulo}</Text>
                  {item.favorito && <Ionicons name="star" size={13} color="#FBBF24" />}
                </View>
                <Text style={s.itemSub} numberOfLines={1}>
                  {item.usuario || item.url || cat.label}
                </Text>
              </View>
              <View style={[s.tag, { borderColor: cat.cor + '55' }]}>
                <Ionicons name={cat.icon as any} size={12} color={cat.cor} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          );
        }}
      />

      <Pressable onPress={onNovo} style={[s.fab, { bottom: insets.bottom + 24 }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fabInner}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.bg },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  ola: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  contagem: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buscaInput: { flex: 1, color: colors.text, fontSize: 16 },
  chips: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 36, borderRadius: 18 },
  chipInativo: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  chipTexto: { color: colors.textDim, fontWeight: '600', fontSize: 13 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemIcone: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  itemLetra: { fontSize: 20, fontWeight: '800' },
  itemTitulo: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  itemSub: { color: colors.textDim, fontSize: 13, marginTop: 3 },
  tag: { width: 26, height: 26, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  vazio: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  vazioTitulo: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16 },
  vazioSub: { color: colors.textDim, fontSize: 14, marginTop: 6, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 22,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  fabInner: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
