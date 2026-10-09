import { Team, Match, MatchTeam, StandingRow, Scorer, League, EpgStatus } from '../types/football';

const API_BASE = 'https://apifutebol.chemorena.com';

// Common featured leagues
export const POPULAR_LEAGUES: { id: string; code: string; name: string; country: string }[] = [
  { id: 'bra.1', code: 'bra.1', name: 'BRASILEIRÃO SÉRIE A', country: 'Brasil' },
  { id: 'bra.2', code: 'bra.2', name: 'BRASILEIRÃO SÉRIE B', country: 'Brasil' },
  { id: 'conmebol.libertadores', code: 'conmebol.libertadores', name: 'CONMEBOL LIBERTADORES', country: 'América do Sul' },
  { id: 'conmebol.sudamericana', code: 'conmebol.sudamericana', name: 'CONMEBOL SUDAMERICANA', country: 'América do Sul' },
  { id: 'uefa.champions', code: 'uefa.champions', name: 'UEFA CHAMPIONS LEAGUE', country: 'Europa' },
  { id: 'eng.1', code: 'eng.1', name: 'PREMIER LEAGUE', country: 'Inglaterra' },
  { id: 'esp.1', code: 'esp.1', name: 'LALIGA', country: 'Espanha' },
];

export async function fetchUpcomingMatches(leagueCode: string = 'bra.1'): Promise<Match[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/competitions/${leagueCode}/upcoming`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data.jogos && Array.isArray(data.jogos)) return data.jogos;
    return [];
  } catch (err) {
    console.warn(`Error fetching upcoming matches for ${leagueCode}, falling back to league matches`, err);
    try {
      const alt = await fetch(`${API_BASE}/api/football/leagues/${leagueCode}/matches`);
      const altData = await alt.json();
      return altData.jogos || [];
    } catch (e2) {
      console.error('Failed to load matches:', e2);
      return [];
    }
  }
}

export async function fetchLeagueMatches(leagueCode: string): Promise<Match[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/leagues/${leagueCode}/matches`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.jogos || [];
  } catch (err) {
    console.error('Error fetching league matches:', err);
    return [];
  }
}

export async function fetchStandings(leagueCode: string = 'bra.1'): Promise<StandingRow[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/leagues/${leagueCode}/standings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.tabela && Array.isArray(data.tabela)) {
      return data.tabela;
    }
    // If it has groups (e.g., Libertadores)
    if (data.grupos && Array.isArray(data.grupos)) {
      const flattened: StandingRow[] = [];
      data.grupos.forEach((g: any) => {
        if (g.standings?.entries) {
          g.standings.entries.forEach((e: any, idx: number) => {
            flattened.push({
              posicao: idx + 1,
              pontos: e.stats?.find((s: any) => s.name === 'points')?.value || 0,
              jogos: e.stats?.find((s: any) => s.name === 'gamesPlayed')?.value || 0,
              vitorias: e.stats?.find((s: any) => s.name === 'wins')?.value || 0,
              empates: e.stats?.find((s: any) => s.name === 'ties')?.value || 0,
              derrotas: e.stats?.find((s: any) => s.name === 'losses')?.value || 0,
              golsPro: e.stats?.find((s: any) => s.name === 'pointsFor')?.value || 0,
              golsContra: e.stats?.find((s: any) => s.name === 'pointsAgainst')?.value || 0,
              saldoGols: e.stats?.find((s: any) => s.name === 'pointDifferential')?.value || 0,
              time: {
                espnId: e.team?.id,
                nome: `${g.name ? g.name + ': ' : ''}${e.team?.displayName || e.team?.name || 'Clube'}`,
                sigla: e.team?.abbreviation,
                escudo: e.team?.logos?.[0]?.href || 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
              },
            });
          });
        }
      });
      return flattened;
    }
    return [];
  } catch (err) {
    console.error('Error fetching standings:', err);
    return [];
  }
}

export async function fetchTopScorers(leagueCode: string = 'bra.1'): Promise<Scorer[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/competitions/${leagueCode}/scorers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching scorers:', err);
    return [];
  }
}

export async function fetchAllTeams(): Promise<Team[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/teams`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching teams:', err);
    return [];
  }
}

export async function fetchTeamFull(slug: string): Promise<Team | null> {
  try {
    const res = await fetch(`${API_BASE}/api/football/teams/${slug}/full`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching full team for ${slug}:`, err);
    return null;
  }
}

export async function fetchEpgStatus(): Promise<EpgStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/epg/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching EPG status:', err);
    return null;
  }
}

export async function fetchLeaguesCatalog(): Promise<League[]> {
  try {
    const res = await fetch(`${API_BASE}/api/football/leagues`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.competicoes || [];
  } catch (err) {
    console.error('Error fetching leagues catalog:', err);
    return [];
  }
}

export function helperGetTeamName(team: string | MatchTeam | undefined): string {
  if (!team) return 'Time';
  if (typeof team === 'string') return team;
  return team.nome || 'Time';
}

export function helperGetTeamBadge(
  team: string | MatchTeam | undefined,
  fallbackBadge?: string
): string {
  if (fallbackBadge) return fallbackBadge;
  if (typeof team === 'object' && team?.escudo) return team.escudo;
  return 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
}

// Canonical dictionary mapping Brazilian teams, variations, and nicknames to their API slugs
export const TEAM_NAME_TO_SLUG: Record<string, string> = {
  // Flamengo
  flamengo: 'flamengo',
  'cr flamengo': 'flamengo',
  mengo: 'flamengo',
  mengao: 'flamengo',
  fla: 'flamengo',
  // Fluminense
  fluminense: 'fluminense',
  'fluminense fc': 'fluminense',
  flu: 'fluminense',
  tricolor: 'fluminense',
  // Vasco
  'vasco da gama': 'vasco',
  vasco: 'vasco',
  'cr vasco da gama': 'vasco',
  'gigante da colina': 'vasco',
  // Palmeiras
  palmeiras: 'palmeiras',
  'se palmeiras': 'palmeiras',
  verdao: 'palmeiras',
  pal: 'palmeiras',
  // Corinthians
  corinthians: 'corinthians',
  'sc corinthians paulista': 'corinthians',
  timao: 'corinthians',
  cor: 'corinthians',
  // São Paulo
  'são paulo': 'sao-paulo',
  'sao paulo': 'sao-paulo',
  'sao-paulo': 'sao-paulo',
  spfc: 'sao-paulo',
  'são paulo fc': 'sao-paulo',
  'sao paulo fc': 'sao-paulo',
  // Botafogo
  botafogo: 'botafogo',
  'botafogo fr': 'botafogo',
  fogao: 'botafogo',
  bota: 'botafogo',
  // Santos
  santos: 'santos',
  'santos fc': 'santos',
  peixe: 'santos',
  san: 'santos',
  // Grêmio
  'grêmio': 'gremio',
  gremio: 'gremio',
  'grêmio fbpa': 'gremio',
  'gremio fbpa': 'gremio',
  imortal: 'gremio',
  gre: 'gremio',
  // Internacional
  internacional: 'internacional',
  inter: 'internacional',
  'sc internacional': 'internacional',
  colorado: 'internacional',
  int: 'internacional',
  // Atlético-MG
  'atlético-mg': 'atletico-mg',
  'atletico-mg': 'atletico-mg',
  'atlético mineiro': 'atletico-mg',
  'atletico mineiro': 'atletico-mg',
  galo: 'atletico-mg',
  cam: 'atletico-mg',
  // Cruzeiro
  cruzeiro: 'cruzeiro',
  'cruzeiro ec': 'cruzeiro',
  cabuloso: 'cruzeiro',
  cru: 'cruzeiro',
  // Bahia
  bahia: 'bahia',
  'ec bahia': 'bahia',
  esquadrao: 'bahia',
  bah: 'bahia',
  // Athletico-PR
  'athletico paranaense': 'athletico-pr',
  'athletico-pr': 'athletico-pr',
  'athletico pr': 'athletico-pr',
  'atletico paranaense': 'athletico-pr',
  'atletico-pr': 'athletico-pr',
  furacao: 'athletico-pr',
  cap: 'athletico-pr',
  // Chapecoense
  chapecoense: 'chapecoense',
  chape: 'chapecoense',
  'chapecoense af': 'chapecoense',
  // Coritiba
  coritiba: 'coritiba',
  coxa: 'coritiba',
  'coritiba fbc': 'coritiba',
  // Mirassol
  mirassol: 'mirassol',
  'mirassol fc': 'mirassol',
  // Bragantino
  'red bull bragantino': 'bragantino',
  'rb bragantino': 'bragantino',
  bragantino: 'bragantino',
  'massa bruta': 'bragantino',
  // Remo
  remo: 'remo',
  'clube do remo': 'remo',
  'leao azul': 'remo',
  // Vitória
  'vitória': 'vitoria',
  vitoria: 'vitoria',
  'ec vitória': 'vitoria',
  'ec vitoria': 'vitoria',
  'leao da barra': 'vitoria',
};

/**
 * Resolves any team name, variation or slug to the canonical API slug
 */
export function resolveTeamSlug(rawNameOrSlug: string, teamsCatalog?: Team[]): string {
  if (!rawNameOrSlug) return 'flamengo';
  const clean = rawNameOrSlug.toLowerCase().trim();

  // 1. Direct dictionary match
  if (TEAM_NAME_TO_SLUG[clean]) return TEAM_NAME_TO_SLUG[clean];

  // 2. Normalized check without accents
  const normalized = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (TEAM_NAME_TO_SLUG[normalized]) return TEAM_NAME_TO_SLUG[normalized];

  // 3. Check against live teams catalog from API
  if (teamsCatalog && teamsCatalog.length > 0) {
    const found = teamsCatalog.find((t) => {
      const tNameNorm = t.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const tSlugNorm = t.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return (
        tNameNorm === normalized ||
        tSlugNorm === normalized ||
        normalized.includes(tNameNorm) ||
        tNameNorm.includes(normalized) ||
        (t.nomeCompleto && t.nomeCompleto.toLowerCase().includes(clean))
      );
    });
    if (found) return found.slug;
  }

  // 4. Fallback slugify
  return normalized.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'flamengo';
}
