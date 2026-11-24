import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradient } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function BotaoGradiente({
  titulo,
  icone,
  onPress,
  style,
}: {
  titulo: string;
  icone?: IconName;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.botao}>
        {icone && <Ionicons name={icone} size={20} color="#fff" />}
        <Text style={s.botaoTexto}>{titulo}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function BotaoIcone({
  icone,
  onPress,
  cor = colors.text,
  tamanho = 22,
  fundo = true,
}: {
  icone: IconName;
  onPress: () => void;
  cor?: string;
  tamanho?: number;
  fundo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [fundo && s.botaoIcone, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Ionicons name={icone} size={tamanho} color={cor} />
    </Pressable>
  );
}

export function Campo({
  rotulo,
  icone,
  direita,
  ...props
}: TextInputProps & { rotulo: string; icone: IconName; direita?: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <View style={[s.campo, props.multiline && { alignItems: 'flex-start', paddingTop: 14 }]}>
        <Ionicons name={icone} size={18} color={colors.textDim} style={{ marginRight: 10 }} />
        <TextInput
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.primary}
          style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }]}
          {...props}
        />
        {direita}
      </View>
    </View>
  );
}

export function Cartao({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.cartao, style]}>{children}</View>;
}

const s = StyleSheet.create({
  botao: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  botaoIcone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 },
  cartao: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
});
