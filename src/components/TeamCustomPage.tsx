import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ExternalLink,
  Users,
  Trophy,
  BookOpen,
  Activity,
  Play,
  Shield,
  Clock,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Team, Player, Match, StandingsEntry, Scorer } from '../types/football';
import {
  fetchTeamFull,
  fetchStandings,
  fetchTopScorers,
  helperGetTeamBadge,
  helperGetTeamName,
  resolveTeamSlug,
} from '../services/futebolApi';
import { getClubTheme } from '../services/teamThemes';
import { PlayerModal } from './PlayerModal';
import { BroadcastBadge } from './BroadcastBadge';

interface TeamCustomPageProps {
  teamSlugOrName: string;
  onBack: () => void;
  onSelectOtherTeam: (teamName: string) => void;
  onWatchMatch: (match: Match) => void;
}

type TabKey = 'elenco' | 'historia' | 'classificacao' | 'artilheiros' | 'proximos' | 'resultados';

export const TeamCustomPage: React.FC<TeamCustomPageProps> = ({
  teamSlugOrName,
  onBack,
  onSelectOtherTeam,
  onWatchMatch,
}) => {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [leagueScorers, setLeagueScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabKey>('elenco');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Load complete team data and league standings from API
  useEffect(() => {
    setLoading(true);
    const slug = resolveTeamSlug(teamSlugOrName);

    Promise.all([
      fetchTeamFull(slug),
      fetchStandings('bra.1'),
      fetchTopScorers('bra.1'),
    ])
      .then(([data, st, sc]) => {
        if (data) {
          setTeamData(data);
        } else {
          setTeamData({
            id: slug,
            nome: teamSlugOrName,
            slug: slug,
            escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
          });
        }
        if (st && st.length > 0) setStandings(st);
        if (sc && sc.length > 0) setLeagueScorers(sc);
      })
      .catch((err) => {
        console.error('Error fetching team full data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamSlugOrName]);

  const team = teamData || {
    id: teamSlugOrName,
    nome: teamSlugOrName,
    slug: resolveTeamSlug(teamSlugOrName),
    escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
  };

  // Club custom theme colors (Flamengo, Palmeiras, Fluminense, etc.)
  const theme = useMemo(() => {
    const slug = team.slug || resolveTeamSlug(team.nome);
    return getClubTheme(slug);
  }, [team.slug, team.nome]);

  const squad = team.elenco || [];

  // Group squad by positions
  const goalkeepers = useMemo(
    () => squad.filter((p) => p.posicao?.toLowerCase().includes('goleiro') || p.posicaoCodigo === 'G'),
    [squad]
  );
  const defenders = useMemo(
    () =>
      squad.filter(
        (p) =>
          p.posicao?.toLowerCase().includes('defens') ||
          p.posicao?.toLowerCase().includes('zagueiro') ||
          p.posicao?.toLowerCase().includes('lateral') ||
          p.posicaoCodigo === 'D' ||
          p.posicaoCodigo === 'Z' ||
          p.posicaoCodigo === 'LD' ||
          p.posicaoCodigo === 'LE'
      ),
    [squad]
  );
  const midfielders = useMemo(
    () =>
      squad.filter(
        (p) =>
          p.posicao?.toLowerCase().includes('meio') ||
          p.posicao?.toLowerCase().includes('volante') ||
          p.posicaoCodigo === 'M' ||
          p.posicaoCodigo === 'V'
      ),
    [squad]
  );
  const forwards = useMemo(
    () =>
      squad.filter(
        (p) =>
          p.posicao?.toLowerCase().includes('atacante') ||
          p.posicao?.toLowerCase().includes('ponta') ||
          p.posicaoCodigo === 'A'
      ),
    [squad]
  );
  const classifiedIds = useMemo(
    () =>
      new Set([
        ...goalkeepers.map((p) => p.id),
        ...defenders.map((p) => p.id),
        ...midfielders.map((p) => p.id),
        ...forwards.map((p) => p.id),
      ]),
    [goalkeepers, defenders, midfielders, forwards]
  );
  const others = useMemo(() => squad.filter((p) => !classifiedIds.has(p.id)), [squad, classifiedIds]);

  // Extract upcoming matches and past results
  const upcomingMatches = useMemo(() => {
    if (team.calendario && Array.isArray((team.calendario as any).proximosJogos)) {
      return (team.calendario as any).proximosJogos as Match[];
    }
    const all = Array.isArray(team.calendario)
      ? team.calendario
      : (team.calendario as any)?.jogos || [];
    return all.filter((m: any) => m.status !== 'encerrado' && m.status !== 'finished');
  }, [team.calendario]);

  const pastResults = useMemo(() => {
    if (team.calendario && Array.isArray((team.calendario as any).resultados)) {
      return (team.calendario as any).resultados as Match[];
    }
    const all = Array.isArray(team.calendario)
      ? team.calendario
      : (team.calendario as any)?.jogos || [];
    return all.filter((m: any) => m.status === 'encerrado' || m.status === 'finished');
  }, [team.calendario]);

  // Extract club's top scorers from squad stats
  const clubScorers = useMemo(() => {
    return squad
      .filter((p) => {
        const goals = p.estatisticas?.gols ?? p.estatisticas?.totalGoals ?? 0;
        return goals > 0;
      })
      .map((p) => ({
        ...p,
        gols: p.estatisticas?.gols ?? p.estatisticas?.totalGoals ?? 0,
        jogos: p.estatisticas?.jogos ?? p.estatisticas?.appearances ?? 0,
        assistencias: p.estatisticas?.assistencias ?? p.estatisticas?.goalAssists ?? 0,
      }))
      .sort((a, b) => b.gols - a.gols);
  }, [squad]);

  // Helper formatting for dates and times
  const formatMatchDate = (m: any) => {
    if (m.data) return m.data;
    if (m.dataISO) {
      try {
        const d = new Date(m.dataISO);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } catch {
        return '';
      }
    }
    return 'A definir';
  };

  const formatMatchTime = (m: any) => {
    if (m.horario) return m.horario;
    if (m.dataISO) {
      try {
        const d = new Date(m.dataISO);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    }
    return '';
  };

  if (loading && !teamData) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center p-8 select-none">
        <div
          className="w-12 h-12 rounded-full border-3 border-t-transparent animate-spin mb-4"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
        <p className="text-base font-bold text-white">Carregando dados oficiais do clube…</p>
        <span className="text-xs text-slate-400 mt-1">Sincronizando cores, elenco, história, classificação e jogos</span>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col select-none animate-in fade-in duration-300 relative"
      style={{
        // Dynamic theme background glow and accent tone
        background: `radial-gradient(ellipse 90% 45% at 50% 0%, ${theme.glow} 0%, rgba(10,10,12,0) 80%)`,
      }}
    >
      {/* TOP NAVIGATION HEADER WITH CLUB ACCENTS */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/10 bg-white/[0.03] backdrop-blur-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Central de Jogos</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Página Oficial do Clube</span>
          <span
            className="font-mono text-xs font-bold px-3 py-1 rounded-xl border"
            style={{
              backgroundColor: `${theme.accent}25`,
              color: theme.accent,
              borderColor: `${theme.accent}60`,
            }}
          >
            {team.sigla || team.nome.slice(0, 3).toUpperCase()}
          </span>
        </div>
      </div>

      {/* HERO SECTION: CLUB SPOTLIGHT WITH CLUB COLORS */}
      <div
        className={`relative p-6 sm:p-10 lg:p-12 border-b border-white/10 bg-gradient-to-b ${theme.gradient} overflow-hidden`}
      >
        {/* Dynamic Dual Color Glow from Club */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-40 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-30 pointer-events-none"
          style={{ backgroundColor: theme.secondary || theme.accent }}
        />

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
          {/* Official 3D Shield Crest with Club Border Glow */}
          <div className="relative group shrink-0">
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-4 vision-3d-glass border flex items-center justify-center transition-all duration-300"
              style={{
                borderColor: theme.border,
                boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 35px ${theme.glow}`,
              }}
            >
              <img
                src={team.escudo}
                alt={team.nome}
                className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                }}
              />
            </div>
            {team.fundacao && (
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-slate-200 px-3 py-1 rounded-full border border-white/20 whitespace-nowrap shadow-lg">
                Fundado em {team.fundacao}
              </span>
            )}
          </div>

          {/* Club Info & Headlines */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2 text-xs text-slate-300">
              {team.cidade && (
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  {team.cidade}
                  {team.estado ? ` - ${team.estado}` : ''}
                </span>
              )}
              {team.estadio && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="font-medium text-slate-200">{team.estadio}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight drop-shadow-md">
              {team.nome}
            </h1>
            {team.nomeCompleto && team.nomeCompleto !== team.nome && (
              <p className="text-sm sm:text-base text-slate-200 mt-1 font-medium">
                {team.nomeCompleto}
              </p>
            )}

            {/* Quick Metrics Strip */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {team.estatisticas?.pontos !== undefined && (
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontos</span>
                  <span
                    className="text-lg font-black font-mono tabular-nums"
                    style={{ color: theme.accent }}
                  >
                    {team.estatisticas.pontos}
                  </span>
                </div>
              )}

              {team.estatisticas?.posicao !== undefined && (
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Posição</span>
                  <span className="text-lg font-black font-mono text-white tabular-nums">
                    {team.estatisticas.posicao}º
                  </span>
                </div>
              )}

              {team.estatisticas?.vitorias !== undefined && (
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vitórias</span>
                  <span className="text-lg font-black font-mono text-sky-400 tabular-nums">
                    {team.estatisticas.vitorias}
                  </span>
                </div>
              )}

              {team.estatisticas?.saldoGols !== undefined && (
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo</span>
                  <span
                    className={`text-lg font-black font-mono tabular-nums ${
                      team.estatisticas.saldoGols > 0 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {team.estatisticas.saldoGols > 0
                      ? `+${team.estatisticas.saldoGols}`
                      : team.estatisticas.saldoGols}
                  </span>
                </div>
              )}

              {team.estatisticas?.aproveitamento !== undefined && (
                <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Aprov.</span>
                  <span className="text-lg font-black font-mono text-amber-400 tabular-nums">
                    {team.estatisticas.aproveitamento}%
                  </span>
                </div>
              )}

              {team.urlOficial && (
                <a
                  href={team.urlOficial}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white hover:text-white transition-all text-xs font-bold"
                >
                  <span>Portal Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 6 DEDICATED TABS WITH CLUB ACCENT COLOR */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('elenco')}
            style={
              activeTab === 'elenco'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'elenco'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Elenco ({squad.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historia')}
            style={
              activeTab === 'historia'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'historia'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>História & Títulos</span>
          </button>

          <button
            onClick={() => setActiveTab('classificacao')}
            style={
              activeTab === 'classificacao'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'classificacao'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Classificação</span>
          </button>

          <button
            onClick={() => setActiveTab('artilheiros')}
            style={
              activeTab === 'artilheiros'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'artilheiros'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Artilheiros ({clubScorers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('proximos')}
            style={
              activeTab === 'proximos'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'proximos'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Próximos Jogos ({upcomingMatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resultados')}
            style={
              activeTab === 'resultados'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 8px 24px ${theme.glow}`,
                  }
                : undefined
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'resultados'
                ? 'scale-[1.03]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Últimos Resultados ({pastResults.length})</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT AREA */}
      <div className="p-6 sm:p-10 min-h-[500px]">
        {/* ======================================================== */}
        {/* TAB 1: ELENCO OFICIAL */}
        {/* ======================================================== */}
        {activeTab === 'elenco' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {squad.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Elenco sincronizando</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A relação completa de jogadores deste clube está sendo atualizada pela comissão técnica e API.
                </p>
              </div>
            ) : (
              <>
                {/* Positional sections */}
                {[
                  { title: 'Goleiros', list: goalkeepers },
                  { title: 'Defensores & Laterais', list: defenders },
                  { title: 'Meio-Campistas', list: midfielders },
                  { title: 'Atacantes & Pontas', list: forwards },
                  { title: 'Outros Jogadores', list: others },
                ]
                  .filter((group) => group.list.length > 0)
                  .map((group) => (
                    <div key={group.title} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                          {group.title} ({group.list.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                        {group.list.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className="group relative p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                          >
                            {/* Hover accent wash */}
                            <div
                              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none"
                              style={{ backgroundColor: theme.primary }}
                            />

                            <div className="flex items-start gap-3">
                              {/* Player Photo or Number badge */}
                              <div
                                className="relative w-14 h-14 rounded-2xl bg-black/40 border flex items-center justify-center shrink-0 overflow-hidden shadow-inner"
                                style={{ borderColor: `${theme.accent}40` }}
                              >
                                {player.foto || player.fotoEspn ? (
                                  <img
                                    src={player.foto || player.fotoEspn || undefined}
                                    alt={player.nome}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      // Fallback to number badge
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span
                                    className="text-lg font-black font-mono"
                                    style={{ color: theme.accent }}
                                  >
                                    {player.numero ? `#${player.numero}` : player.nome.slice(0, 1)}
                                  </span>
                                )}

                                {player.numero && (
                                  <span className="absolute bottom-0 right-0 bg-black/80 font-mono text-[9px] font-bold text-white px-1.5 py-0.5 rounded-tl-md">
                                    #{player.numero}
                                  </span>
                                )}
                              </div>

                              {/* Player info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                                  {player.apelido || player.nome}
                                </h4>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {player.posicao || 'Jogador'}
                                </p>
                                {player.nacionalidade && (
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {player.nacionalidade}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stats footer if any */}
                            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {player.idade ? `${player.idade} anos` : 'Profissional'}
                              </span>
                              {(player.estatisticas?.gols ?? 0) > 0 && (
                                <span
                                  className="font-mono font-bold"
                                  style={{ color: theme.accent }}
                                >
                                  ⚽ {player.estatisticas?.gols} gols
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: HISTÓRIA & TÍTULOS */}
        {/* ======================================================== */}
        {activeTab === 'historia' && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
            {/* Overview Card */}
            <div
              className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] border backdrop-blur-xl relative overflow-hidden"
              style={{ borderColor: theme.border }}
            >
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none"
                style={{ backgroundColor: theme.primary }}
              />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    borderColor: `${theme.accent}50`,
                  }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: theme.accent }} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-display">
                    Trajetória & Origem do {team.nome}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tradição e conquistas no futebol brasileiro
                  </p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  {team.historia ||
                    `${team.nome} é uma das mais tradicionais e respeitadas instituições desportivas do futebol brasileiro e sul-americano. Com sua sede e torcida apaixonada, o clube construiu uma história repleta de conquistas épicas, ídolos inesquecíveis e duelos marcantes no Campeonato Brasileiro e torneios continentais.`}
                </p>
              </div>

              {/* Quick details grid */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fundação</span>
                  <span className="text-base font-black text-white font-mono">
                    {team.fundacao || 'Tradição Histórica'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estádio Principal</span>
                  <span className="text-base font-black text-white truncate block">
                    {team.estadio || 'Arena Principal'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cidade / UF</span>
                  <span className="text-base font-black text-white truncate block">
                    {team.cidade || 'Brasil'} {team.estado ? `(${team.estado})` : ''}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Presidente / Técnico</span>
                  <span className="text-base font-black text-white truncate block">
                    {(team as any).tecnico || (team as any).presidente || 'Comissão Oficial'}
                  </span>
                </div>
              </div>
            </div>

            {/* Galeria de Conquistas & Títulos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    borderColor: `${theme.accent}50`,
                  }}
                >
                  <Trophy className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Galeria de Títulos Oficiais
                </h3>
              </div>

              {team.titulos && team.titulos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.titulos.map((t: any, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex items-center gap-4"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${theme.accent}15`,
                          borderColor: `${theme.accent}40`,
                        }}
                      >
                        <Award className="w-6 h-6" style={{ color: theme.accent }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {typeof t === 'string' ? t : t.nome || t.competicao || 'Título'}
                        </h4>
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: theme.accent }}
                        >
                          {typeof t === 'object' && t.quantidade ? `${t.quantidade}x campeão` : (typeof t === 'object' && t.ano) ? t.ano : 'Campeão'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Campeonato Brasileiro</h4>
                      <p className="text-xs text-slate-400">Série A de elite nacional</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Copa do Brasil</h4>
                      <p className="text-xs text-slate-400">Torneio mata-mata nacional</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Campeonato Estadual</h4>
                      <p className="text-xs text-slate-400">Hegemonia regional</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CLASSIFICAÇÃO NA TABELA */}
        {/* ======================================================== */}
        {activeTab === 'classificacao' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide font-display">
                  Tabela do Campeonato Brasileiro Série A
                </h3>
                <p className="text-xs text-slate-400">
                  Posição do {team.nome} destacada em tempo real com as cores oficiais
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  G4 Libertadores
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Sul-Americana
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  Z4 Rebaixamento
                </span>
              </div>
            </div>

            {standings.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Carregando tabela atualizada</h4>
                <p className="text-xs text-slate-400 mt-1">Conectando aos dados da Série A…</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/15 bg-white/[0.05] text-[10px] uppercase font-mono text-slate-400">
                      <th className="py-3 px-3 text-center w-12">Pos</th>
                      <th className="py-3 px-4">Clube</th>
                      <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
                      <th className="py-3 px-3 text-center">J</th>
                      <th className="py-3 px-3 text-center">V</th>
                      <th className="py-3 px-3 text-center">E</th>
                      <th className="py-3 px-3 text-center">D</th>
                      <th className="py-3 px-3 text-center">GP</th>
                      <th className="py-3 px-3 text-center">GC</th>
                      <th className="py-3 px-3 text-center font-bold">SG</th>
                      <th className="py-3 px-3 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((row) => {
                      const rowTeamName = typeof row.time === 'object' ? row.time.nome : (row.time as string);
                      const rowTeamBadge = typeof row.time === 'object' ? row.time.escudo : (row as any).escudo;
                      const isCurrent =
                        rowTeamName?.toLowerCase().includes(team.nome.toLowerCase()) ||
                        team.nome.toLowerCase().includes(rowTeamName?.toLowerCase() || '') ||
                        (row as any).slug === team.slug;

                      const pos = row.posicao;
                      let posIndicator = 'text-slate-400';
                      if (pos <= 4) posIndicator = 'text-sky-400 font-bold';
                      else if (pos <= 6) posIndicator = 'text-teal-400 font-bold';
                      else if (pos <= 12) posIndicator = 'text-amber-400';
                      else if (pos >= 17) posIndicator = 'text-rose-400 font-bold';

                      return (
                        <tr
                          key={row.posicao}
                          style={
                            isCurrent
                              ? {
                                  backgroundColor: `${theme.primary}25`,
                                  borderLeft: `4px solid ${theme.accent}`,
                                }
                              : undefined
                          }
                          className={`transition-colors ${
                            isCurrent
                              ? 'font-bold'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <td className={`py-3 px-3 text-center font-mono ${posIndicator}`}>
                            {row.posicao}º
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rowTeamBadge}
                                alt={rowTeamName}
                                className="w-6 h-6 object-contain shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                                }}
                              />
                              <span className={`truncate ${isCurrent ? 'text-white font-extrabold text-sm' : 'text-slate-200'}`}>
                                {rowTeamName}
                              </span>
                              {isCurrent && (
                                <span
                                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                                  style={{
                                    backgroundColor: `${theme.accent}30`,
                                    color: theme.accent,
                                    borderColor: `${theme.accent}60`,
                                  }}
                                >
                                  SEU CLUBE
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className="py-3 px-3 text-center font-mono font-black text-sm"
                            style={{ color: isCurrent ? theme.accent : '#ffffff' }}
                          >
                            {row.pontos}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">{row.jogos}</td>
                          <td className="py-3 px-3 text-center font-mono text-emerald-400">{row.vitorias}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{row.empates}</td>
                          <td className="py-3 px-3 text-center font-mono text-rose-400">{row.derrotas}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">{row.golsPro}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{row.golsContra}</td>
                          <td className={`py-3 px-3 text-center font-mono font-bold ${row.saldoGols > 0 ? 'text-emerald-400' : row.saldoGols < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {row.saldoGols > 0 ? `+${row.saldoGols}` : row.saldoGols}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">
                            {row.aproveitamento}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ARTILHEIROS */}
        {/* ======================================================== */}
        {activeTab === 'artilheiros' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Club Internal Goalscorers */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    borderColor: `${theme.accent}50`,
                  }}
                >
                  <Flame className="w-4 h-4" style={{ color: theme.accent }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                    Artilheiros do {team.nome} na Temporada
                  </h3>
                  <p className="text-xs text-slate-400">
                    Goleadores oficiais do elenco
                  </p>
                </div>
              </div>

              {clubScorers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                  <p className="text-sm text-slate-400">
                    Estatísticas individuais de gols estão sendo computadas para este elenco.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clubScorers.map((scorer, index) => (
                    <div
                      key={scorer.id}
                      onClick={() => setSelectedPlayer(scorer)}
                      className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank indicator */}
                        <div
                          className="w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center border"
                          style={{
                            backgroundColor: index === 0 ? `${theme.accent}30` : 'rgba(255,255,255,0.06)',
                            color: index === 0 ? theme.accent : '#ffffff',
                            borderColor: index === 0 ? theme.accent : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          #{index + 1}
                        </div>

                        {/* Player head */}
                        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                          {scorer.foto || scorer.fotoEspn ? (
                            <img
                              src={scorer.foto || scorer.fotoEspn || undefined}
                              alt={scorer.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-white text-sm">
                              {scorer.nome.slice(0, 1)}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white truncate">
                            {scorer.apelido || scorer.nome}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">
                            {scorer.posicao || 'Atacante'}
                          </span>
                        </div>
                      </div>

                      {/* Goal count */}
                      <div className="text-right">
                        <span
                          className="text-2xl font-black font-mono block tabular-nums"
                          style={{ color: theme.accent }}
                        >
                          {scorer.gols}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {scorer.gols === 1 ? 'Gol' : 'Gols'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* League Overall Top Scorers */}
            {leagueScorers.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                    Artilharia Geral do Brasileirão Série A
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {leagueScorers.slice(0, 8).map((scorer, idx) => {
                    const scorerName = scorer.jogador || scorer.nome || 'Jogador';
                    const scorerTeam = scorer.time || 'Brasileirão';
                    const isOurPlayer =
                      scorerTeam.toLowerCase().includes(team.nome.toLowerCase()) ||
                      team.nome.toLowerCase().includes(scorerTeam.toLowerCase());

                    return (
                      <div
                        key={(scorer as any).id || `${scorer.posicao}-${scorerName}-${idx}`}
                        style={
                          isOurPlayer
                            ? {
                                backgroundColor: `${theme.primary}20`,
                                borderColor: theme.accent,
                              }
                            : undefined
                        }
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isOurPlayer
                            ? 'shadow-lg'
                            : 'bg-white/[0.04] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{scorer.posicao || idx + 1}
                          </span>
                          {scorer.escudoTime && (
                            <img
                              src={scorer.escudoTime}
                              alt={scorerTeam}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <div>
                            <h5 className="text-xs font-bold text-white truncate max-w-[120px]">
                              {scorerName}
                            </h5>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {scorerTeam}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className="text-lg font-black font-mono block"
                            style={{ color: isOurPlayer ? theme.accent : '#f59e0b' }}
                          >
                            {scorer.gols}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase">Gols</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PRÓXIMOS JOGOS */}
        {/* ======================================================== */}
        {activeTab === 'proximos' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  Próximos Compromissos Oficiais
                </h3>
                <p className="text-xs text-slate-400">
                  Partidas agendadas para o {team.nome} com horários e transmissões
                </p>
              </div>
            </div>

            {upcomingMatches.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Nenhum jogo futuro cadastrado</h4>
                <p className="text-xs text-slate-400 mt-1">
                  A tabela oficial de próximos confrontos será atualizada pela CBF.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((match: any, idx: number) => {
                  const homeName = helperGetTeamName(match.timeMandante);
                  const awayName = helperGetTeamName(match.timeVisitante);
                  const homeBadge = helperGetTeamBadge(match.timeMandante);
                  const awayBadge = helperGetTeamBadge(match.timeVisitante);

                  const broadcastChannel =
                    match.transmissao ||
                    (match.transmissoes && match.transmissoes[0]) ||
                    'Premiere';

                  return (
                    <div
                      key={match.id || idx}
                      className="p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                    >
                      {/* Competition and Date Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                          {match.campeonato || 'Brasileirão Série A'}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatMatchDate(match)}</span>
                          {formatMatchTime(match) && (
                            <>
                              <span>·</span>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatMatchTime(match)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Teams Clash */}
                      <div className="flex items-center justify-between py-2">
                        {/* Home team */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <img
                            src={homeBadge}
                            alt={homeName}
                            className="w-12 h-12 object-contain drop-shadow-md mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                            }}
                          />
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {homeName}
                          </span>
                        </div>

                        {/* VS badge */}
                        <div className="px-4 text-center">
                          <span className="font-mono text-xs font-black text-slate-500 bg-white/10 px-2.5 py-1 rounded-xl">
                            VS
                          </span>
                          {match.estadio && (
                            <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1 max-w-[100px]">
                              {match.estadio}
                            </span>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <img
                            src={awayBadge}
                            alt={awayName}
                            className="w-12 h-12 object-contain drop-shadow-md mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                            }}
                          />
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {awayName}
                          </span>
                        </div>
                      </div>

                      {/* Broadcast badge & Action */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <BroadcastBadge channel={broadcastChannel} size="sm" />
                        </div>

                        <button
                          onClick={() => onWatchMatch(match)}
                          style={{
                            backgroundColor: theme.tabActiveBg,
                            color: theme.tabActiveText,
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Ver Transmissão</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ÚLTIMOS RESULTADOS */}
        {/* ======================================================== */}
        {activeTab === 'resultados' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Histórico Recente de Placares
              </h3>
              <p className="text-xs text-slate-400">
                Partidas encerradas do {team.nome} na temporada
              </p>
            </div>

            {pastResults.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Nenhum resultado registrado</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Os placares anteriores serão sincronizados à medida que as partidas forem concluídas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastResults.map((match: any, idx: number) => {
                  const homeName = helperGetTeamName(match.timeMandante);
                  const awayName = helperGetTeamName(match.timeVisitante);
                  const homeBadge = helperGetTeamBadge(match.timeMandante);
                  const awayBadge = helperGetTeamBadge(match.timeVisitante);

                  const plMandante =
                    match.placarMandante ?? (match as any).golsMandante ?? '-';
                  const plVisitante =
                    match.placarVisitante ?? (match as any).golsVisitante ?? '-';

                  return (
                    <div
                      key={match.id || idx}
                      className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-slate-300 font-bold">
                          {match.campeonato || 'Série A'}
                        </span>
                        <span>{formatMatchDate(match)} · Encerrado</span>
                      </div>

                      {/* Scoreline */}
                      <div className="flex items-center justify-between py-2">
                        {/* Mandante */}
                        <div className="flex-1 flex items-center gap-3">
                          <img
                            src={homeBadge}
                            alt={homeName}
                            className="w-10 h-10 object-contain shrink-0"
                          />
                          <span className="text-xs font-bold text-white truncate">
                            {homeName}
                          </span>
                        </div>

                        {/* Placar Real */}
                        <div className="px-4 py-1.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-base font-black text-white tracking-widest shrink-0">
                          {plMandante} - {plVisitante}
                        </div>

                        {/* Visitante */}
                        <div className="flex-1 flex items-center justify-end gap-3 text-right">
                          <span className="text-xs font-bold text-white truncate">
                            {awayName}
                          </span>
                          <img
                            src={awayBadge}
                            alt={awayName}
                            className="w-10 h-10 object-contain shrink-0"
                          />
                        </div>
                      </div>

                      {match.estadio && (
                        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-500">
                          {match.estadio}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Holographic Player Modal for deep dive on any squad member */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
