import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import type { Categoria } from './theme';

/**
 * Tudo fica guardado no cofre seguro do próprio aparelho:
 * Keychain no iPhone e Keystore (criptografia AES) no Android.
 * Nada sai do celular — não há servidor nem nuvem.
 * Cada registro é salvo numa chave própria (limite seguro de tamanho por item).
 */

export type Registro = {
  id: string;
  titulo: string;
  categoria: Categoria;
  url: string;
  usuario: string; // e-mail ou login
  senha: string;
  descricao: string;
  favorito: boolean;
  criadoEm: number;
  atualizadoEm: number;
};

const INDICE = 'cofre_indice';
const PREFIXO = 'cofre_item_';
const opcoes: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function lerIndice(): Promise<string[]> {
  const bruto = await SecureStore.getItemAsync(INDICE, opcoes);
  return bruto ? (JSON.parse(bruto) as string[]) : [];
}

async function salvarIndice(ids: string[]) {
  await SecureStore.setItemAsync(INDICE, JSON.stringify(ids), opcoes);
}

export async function listar(): Promise<Registro[]> {
  const ids = await lerIndice();
  const itens = await Promise.all(
    ids.map(async (id) => {
      const bruto = await SecureStore.getItemAsync(PREFIXO + id, opcoes);
      return bruto ? (JSON.parse(bruto) as Registro) : null;
    }),
  );
  return itens.filter((i): i is Registro => i !== null);
}

export async function salvar(
  dados: Omit<Registro, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string },
): Promise<Registro> {
  const agora = Date.now();
  const ids = await lerIndice();
  let registro: Registro;

  if (dados.id) {
    const antigo = await SecureStore.getItemAsync(PREFIXO + dados.id, opcoes);
    const criadoEm = antigo ? (JSON.parse(antigo) as Registro).criadoEm : agora;
    registro = { ...dados, id: dados.id, criadoEm, atualizadoEm: agora };
  } else {
    registro = { ...dados, id: Crypto.randomUUID(), criadoEm: agora, atualizadoEm: agora };
  }

  await SecureStore.setItemAsync(PREFIXO + registro.id, JSON.stringify(registro), opcoes);
  if (!ids.includes(registro.id)) await salvarIndice([registro.id, ...ids]);
  return registro;
}

export async function excluir(id: string) {
  await SecureStore.deleteItemAsync(PREFIXO + id, opcoes);
  const ids = await lerIndice();
  await salvarIndice(ids.filter((i) => i !== id));
}

/** Gerador de senha forte usando números aleatórios criptográficos. */
export function gerarSenha(tamanho = 16): string {
  const conjuntos = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%&*?-_+=',
  ];
  const todos = conjuntos.join('');
  const aleatorio = Crypto.getRandomValues(new Uint32Array(tamanho + conjuntos.length));
  const chars = conjuntos.map((c, i) => c[aleatorio[i] % c.length]);
  for (let i = conjuntos.length; i < tamanho; i++) {
    chars.push(todos[aleatorio[i] % todos.length]);
  }
  // embaralha (Fisher–Yates)
  const mistura = Crypto.getRandomValues(new Uint32Array(chars.length));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = mistura[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function forcaSenha(senha: string): { nivel: 0 | 1 | 2 | 3; texto: string } {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  if (!senha) return { nivel: 0, texto: '' };
  if (pontos <= 2) return { nivel: 1, texto: 'Fraca' };
  if (pontos <= 3) return { nivel: 2, texto: 'Média' };
  return { nivel: 3, texto: 'Forte' };
}
