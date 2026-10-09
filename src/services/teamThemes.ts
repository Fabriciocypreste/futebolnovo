export interface TeamThemeColors {
  primary: string;       // Primary brand hex
  secondary: string;     // Secondary brand hex
  accent: string;        // Accent / highlight color (for buttons, glows, highlights)
  accentHover: string;
  glow: string;          // rgba glow
  gradient: string;      // Header & card backdrop gradient
  border: string;        // Themed border rgba
  textOnPrimary: string; // text color when primary is background
  tabActiveBg: string;   // specific tab active background
  tabActiveText: string;
}

export const CLUB_THEMES: Record<string, TeamThemeColors> = {
  flamengo: {
    primary: '#c4122d',
    secondary: '#111111',
    accent: '#ef233c',
    accentHover: '#ff4d6d',
    glow: 'rgba(196, 18, 45, 0.45)',
    gradient: 'from-[#c4122d]/40 via-[#111111]/70 to-[#0a0a0c]',
    border: 'rgba(239, 35, 60, 0.4)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#ef233c',
    tabActiveText: '#ffffff',
  },
  palmeiras: {
    primary: '#006437',
    secondary: '#ffffff',
    accent: '#059669',
    accentHover: '#10b981',
    glow: 'rgba(0, 100, 55, 0.5)',
    gradient: 'from-[#006437]/45 via-[#003d21]/70 to-[#0a0a0c]',
    border: 'rgba(16, 185, 129, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#10b981',
    tabActiveText: '#022c22',
  },
  corinthians: {
    primary: '#111111',
    secondary: '#ffffff',
    accent: '#f3f4f6',
    accentHover: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.25)',
    gradient: 'from-neutral-900 via-neutral-950 to-[#0a0a0c]',
    border: 'rgba(255, 255, 255, 0.3)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#ffffff',
    tabActiveText: '#000000',
  },
  'sao-paulo': {
    primary: '#ba1419',
    secondary: '#000000',
    accent: '#dc2626',
    accentHover: '#ef4444',
    glow: 'rgba(186, 20, 25, 0.45)',
    gradient: 'from-[#ba1419]/40 via-[#1a0507]/80 to-[#0a0a0c]',
    border: 'rgba(220, 38, 38, 0.4)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#dc2626',
    tabActiveText: '#ffffff',
  },
  vasco: {
    primary: '#111111',
    secondary: '#ffffff',
    accent: '#f43f5e', // Faixa diagonal / cruz de malta vermelha
    accentHover: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.35)',
    gradient: 'from-neutral-900 via-[#18181b]/80 to-[#0a0a0c]',
    border: 'rgba(244, 63, 94, 0.35)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#f43f5e',
    tabActiveText: '#ffffff',
  },
  fluminense: {
    primary: '#7a1027', // Grená
    secondary: '#006437', // Verde
    accent: '#9f1d35',
    accentHover: '#be123c',
    glow: 'rgba(122, 16, 39, 0.5)',
    gradient: 'from-[#7a1027]/45 via-[#004d2a]/50 to-[#0a0a0c]',
    border: 'rgba(190, 18, 60, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#9f1d35',
    tabActiveText: '#ffffff',
  },
  botafogo: {
    primary: '#0a0a0a',
    secondary: '#ffffff',
    accent: '#e2e8f0',
    accentHover: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.3)',
    gradient: 'from-neutral-900 via-neutral-950 to-[#0a0a0c]',
    border: 'rgba(255, 255, 255, 0.35)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#ffffff',
    tabActiveText: '#000000',
  },
  santos: {
    primary: '#ffffff',
    secondary: '#000000',
    accent: '#38bdf8',
    accentHover: '#7dd3fc',
    glow: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-neutral-800/60 via-neutral-950 to-[#0a0a0c]',
    border: 'rgba(56, 189, 248, 0.4)',
    textOnPrimary: '#000000',
    tabActiveBg: '#f8fafc',
    tabActiveText: '#020617',
  },
  gremio: {
    primary: '#0d80bf', // Azul Celeste
    secondary: '#000000',
    accent: '#0284c7',
    accentHover: '#38bdf8',
    glow: 'rgba(13, 128, 191, 0.5)',
    gradient: 'from-[#0d80bf]/40 via-[#072d42]/70 to-[#0a0a0c]',
    border: 'rgba(2, 132, 199, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#0284c7',
    tabActiveText: '#ffffff',
  },
  internacional: {
    primary: '#e50510', // Colorado
    secondary: '#ffffff',
    accent: '#dc2626',
    accentHover: '#ef4444',
    glow: 'rgba(229, 5, 16, 0.5)',
    gradient: 'from-[#e50510]/45 via-[#4a080c]/80 to-[#0a0a0c]',
    border: 'rgba(239, 68, 68, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#dc2626',
    tabActiveText: '#ffffff',
  },
  'atletico-mg': {
    primary: '#111111',
    secondary: '#ffffff',
    accent: '#f59e0b', // Galo Dourado / Branco
    accentHover: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-neutral-900 via-neutral-950 to-[#0a0a0c]',
    border: 'rgba(245, 158, 11, 0.4)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#f59e0b',
    tabActiveText: '#000000',
  },
  cruzeiro: {
    primary: '#005ca9', // Azul Celeste Estrelado
    secondary: '#ffffff',
    accent: '#2563eb',
    accentHover: '#3b82f6',
    glow: 'rgba(0, 92, 169, 0.5)',
    gradient: 'from-[#005ca9]/45 via-[#002244]/80 to-[#0a0a0c]',
    border: 'rgba(37, 99, 235, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#2563eb',
    tabActiveText: '#ffffff',
  },
  bahia: {
    primary: '#0070ba', // Azul, Vermelho e Branco
    secondary: '#c8102e',
    accent: '#0284c7',
    accentHover: '#38bdf8',
    glow: 'rgba(0, 112, 186, 0.5)',
    gradient: 'from-[#0070ba]/40 via-[#c8102e]/30 to-[#0a0a0c]',
    border: 'rgba(2, 132, 199, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#0284c7',
    tabActiveText: '#ffffff',
  },
  'athletico-pr': {
    primary: '#c8102e', // Furacão Vermelho e Preto
    secondary: '#000000',
    accent: '#dc2626',
    accentHover: '#ef4444',
    glow: 'rgba(200, 16, 46, 0.5)',
    gradient: 'from-[#c8102e]/40 via-[#1f0508]/80 to-[#0a0a0c]',
    border: 'rgba(220, 38, 38, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#dc2626',
    tabActiveText: '#ffffff',
  },
  chapecoense: {
    primary: '#00843d', // Verde Chape
    secondary: '#ffffff',
    accent: '#10b981',
    accentHover: '#34d399',
    glow: 'rgba(0, 132, 61, 0.5)',
    gradient: 'from-[#00843d]/45 via-[#00421e]/80 to-[#0a0a0c]',
    border: 'rgba(16, 185, 129, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#10b981',
    tabActiveText: '#022c22',
  },
  coritiba: {
    primary: '#00563f', // Verde Coxa
    secondary: '#ffffff',
    accent: '#059669',
    accentHover: '#10b981',
    glow: 'rgba(0, 86, 63, 0.5)',
    gradient: 'from-[#00563f]/45 via-[#002f22]/80 to-[#0a0a0c]',
    border: 'rgba(16, 185, 129, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#059669',
    tabActiveText: '#ffffff',
  },
  mirassol: {
    primary: '#eab308', // Amarelo Mirassol
    secondary: '#15803d', // Verde
    accent: '#eab308',
    accentHover: '#facc15',
    glow: 'rgba(234, 179, 8, 0.5)',
    gradient: 'from-[#eab308]/35 via-[#15803d]/40 to-[#0a0a0c]',
    border: 'rgba(234, 179, 8, 0.45)',
    textOnPrimary: '#000000',
    tabActiveBg: '#eab308',
    tabActiveText: '#000000',
  },
  bragantino: {
    primary: '#d91d36', // Toro Loko Vermelho
    secondary: '#ffffff',
    accent: '#ef4444',
    accentHover: '#f87171',
    glow: 'rgba(217, 29, 54, 0.5)',
    gradient: 'from-[#d91d36]/40 via-[#26050b]/80 to-[#0a0a0c]',
    border: 'rgba(239, 68, 68, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#ef4444',
    tabActiveText: '#ffffff',
  },
  remo: {
    primary: '#0f2942', // Azul Marinho Leão Azul
    secondary: '#ffffff',
    accent: '#38bdf8',
    accentHover: '#7dd3fc',
    glow: 'rgba(15, 41, 66, 0.6)',
    gradient: 'from-[#0f2942]/50 via-[#071320]/85 to-[#0a0a0c]',
    border: 'rgba(56, 189, 248, 0.4)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#38bdf8',
    tabActiveText: '#021020',
  },
  vitoria: {
    primary: '#e20613', // Vermelho e Preto
    secondary: '#000000',
    accent: '#dc2626',
    accentHover: '#ef4444',
    glow: 'rgba(226, 6, 19, 0.5)',
    gradient: 'from-[#e20613]/40 via-[#1f0204]/80 to-[#0a0a0c]',
    border: 'rgba(220, 38, 38, 0.45)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#dc2626',
    tabActiveText: '#ffffff',
  },
};

export function getClubTheme(slugOrName: string): TeamThemeColors {
  if (!slugOrName) return CLUB_THEMES.flamengo;
  const clean = slugOrName.toLowerCase().trim();

  // Try direct match
  if (CLUB_THEMES[clean]) return CLUB_THEMES[clean];

  // Look for partial key matches
  for (const [key, theme] of Object.entries(CLUB_THEMES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return theme;
    }
  }

  // Default fallback
  return {
    primary: '#10b981',
    secondary: '#ffffff',
    accent: '#10b981',
    accentHover: '#34d399',
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'from-emerald-950/40 via-neutral-950 to-[#0a0a0c]',
    border: 'rgba(16, 185, 129, 0.35)',
    textOnPrimary: '#ffffff',
    tabActiveBg: '#10b981',
    tabActiveText: '#022c22',
  };
}
