import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Pede a autenticação do próprio celular: digital / Face ID,
 * e se não houver ou falhar, o PIN / senha / padrão de desbloqueio do aparelho.
 */
export async function autenticar(motivo: string): Promise<boolean> {
  const temSeguranca =
    (await LocalAuthentication.getEnrolledLevelAsync()) !==
    LocalAuthentication.SecurityLevel.NONE;

  if (!temSeguranca) {
    // Sem PIN configurado no aparelho não dá para proteger as senhas.
    throw new Error('SEM_BLOQUEIO');
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: motivo,
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar PIN',
    disableDeviceFallback: false, // permite o PIN do celular
  });
  return resultado.success;
}
