export interface Team {
  id: string;
  nome: string;
  slug: string;
  nomeCompleto?: string;
  cidade?: string;
  estado?: string;
  estadio?: string;
  fundacao?: string;
  cores?: string[];
  escudo: string;
  historia?: string;
  historiaParagrafos?: string[];
  titulos?: string[];
  titulosOficiais?: any[];
  serieA2026?: boolean;
  espnId?: string;
  urlOficial?: string;
  sigla?: string;
  resumoClassificacao?: string;
  campanha?: string;
  elenco?: Player[];
  calendario?: Match[] | { jogos?: Match[]; resultados?: Match[]; proximosJogos?: Match[] } | any;
  estatisticas?: {
    gamesPlayed?: number;
    points?: number;
    wins?: number;
    ties?: number;
    losses?: number;
    pointDifferential?: number;
    pointsFor?: number;
    pointsAgainst?: number;
    rank?: number;
    jogos?: number;
    pontos?: number;
    vitorias?: number;
    empates?: number;
    derrotas?: number;
    saldoGols?: number;
    posicao?: number;
    aproveitamento?: number;
  };
}

export interface Player {
  id: string;
  espnId?: string;
  nome: string;
  nomeCompleto?: string;
  apelido?: string;
  numero?: number;
  posicao?: string;
  posicaoCodigo?: string;
  nacionalidade?: string;
  bandeira?: string;
  nascimento?: string;
  idade?: number;
  alturaCm?: number;
  pesoKg?: number;
  foto?: string;
  fotoEspn?: string | null;
  fotoFonte?: string;
  status?: string;
  estatisticas?: {
    jogos?: number;
    gols?: number;
    assistencias?: number;
    cartoesAmarelos?: number;
    cartoesVermelhos?: number;
    defesas?: number;
    golsSofridos?: number;
    appearances?: number;
    totalGoals?: number;
    goalAssists?: number;
    saves?: number;
  };
}

export interface MatchTeam {
  espnId?: string;
  nome: string;
  escudo?: string;
}

export interface Match {
  id: string;
  dataISO: string;
  horarioDefinido?: boolean;
  mandante: string | MatchTeam;
  visitante: string | MatchTeam;
  placarMandante?: number | null;
  placarVisitante?: number | null;
  status: 'agendado' | 'ao_vivo' | 'encerrado' | 'cancelado' | string;
  estadio?: string;
  competicao?: string;
  campeonato?: string;
  campeonatoId?: string;
  temporada?: number;
  transmissoes?: string[];
  data?: string;
  horario?: string;
  escudoMandante?: string;
  escudoVisitante?: string;
  rodada?: number | string;
}

export type StandingsEntry = StandingRow;

export interface StandingRow {
  posicao: number;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  aproveitamento?: number;
  time: {
    espnId?: string;
    nome: string;
    sigla?: string;
    escudo: string;
  };
}

export interface Scorer {
  posicao: number;
  jogador: string;
  nome?: string;
  espnId?: string;
  time: string;
  timeId?: string;
  gols: number;
  assistencias?: number | null;
  jogos?: number | null;
  foto?: string;
  escudoTime?: string;
}

export interface League {
  id: string;
  nome: string;
  name?: string;
  slug: string;
  espnLeagueCode?: string;
  logo?: string;
  hasStandings?: boolean;
}

export interface EpgSource {
  status: string;
  fonte: string;
  sourceUrl?: string;
  canais?: {
    status: string;
    canal: string;
    coberturaInicio?: string;
    coberturaFim?: string;
  }[];
}

export interface EpgStatus {
  status: string;
  fontes: EpgSource[];
  coberturaInicio?: string;
  coberturaFim?: string;
}
