export const colors = {
  bg: '#0B0B14',
  bgSoft: '#12121F',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.06)',
  text: '#F4F4FA',
  textDim: '#9A9AB5',
  textFaint: '#5E5E78',
  primary: '#7C5CFF',
  primary2: '#22D3EE',
  danger: '#FF5C7A',
  success: '#34D399',
};

export const gradient = ['#7C5CFF', '#22D3EE'] as const;

export type Categoria = 'site' | 'email' | 'app' | 'banco' | 'wifi' | 'outro';

export const categorias: Record<
  Categoria,
  { label: string; icon: string; cor: string }
> = {
  site: { label: 'Site', icon: 'globe-outline', cor: '#7C5CFF' },
  email: { label: 'E-mail', icon: 'mail-outline', cor: '#22D3EE' },
  app: { label: 'App', icon: 'phone-portrait-outline', cor: '#F472B6' },
  banco: { label: 'Banco', icon: 'card-outline', cor: '#34D399' },
  wifi: { label: 'Wi-Fi', icon: 'wifi-outline', cor: '#FBBF24' },
  outro: { label: 'Outro', icon: 'key-outline', cor: '#A3A3C2' },
};
