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
  Sparkles,
  ChevronDown,
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
import { CANONICAL_20_CLUBS } from './BrasileiraoClubsStrip';

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
  const [showClubSelector, setShowClubSelector] = useState<boolean>(false);

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
          // Fallback matching against canonical list
          const canonical = CANONICAL_20_CLUBS.find(
            (c) => c.slug === slug || c.nome.toLowerCase() === teamSlugOrName.toLowerCase()
          );
          setTeamData({
            id: slug,
            nome: canonical?.nome || teamSlugOrName,
            slug: slug,
            escudo: canonical?.escudo || 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png',
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
          className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mb-4"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
        <p className="text-base font-bold text-white">Carregando cores e dados oficiais do {team.nome}…</p>
        <span className="text-xs text-slate-400 mt-1">Sincronizando escudo, elenco, títulos e partidas</span>
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col select-none animate-in fade-in duration-300 relative overflow-hidden"
      style={{
        // Dynamic club atmosphere background with intense club aura
        background: `radial-gradient(circle 800px at 50% -100px, ${theme.glow} 0%, rgba(10,10,12,0.85) 60%, #0a0a0c 100%)`,
      }}
    >
      {/* 1. THEMATIC CLUB CREST RIBBON (Colors of the club shield) */}
      <div className="w-full flex h-2 shadow-2xl relative z-30">
        {theme.stripes.map((stripeColor, i) => (
          <div
            key={i}
            className="flex-1 h-full transition-colors duration-500"
            style={{ backgroundColor: stripeColor }}
          />
        ))}
      </div>

      {/* 2. GIGANTIC TRANSLUCENT CREST WATERMARK IN THE BACKGROUND */}
      <div className="absolute top-12 right-0 sm:right-12 lg:right-24 w-[360px] sm:w-[480px] lg:w-[620px] h-[360px] sm:h-[480px] lg:h-[620px] pointer-events-none select-none opacity-[0.07] blur-[1px] -z-0">
        <img
          src={team.escudo}
          alt=""
          className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* DUAL AMBIENT GLOW ORBS MATCHING CLUB CREST PALETTE */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-40 pointer-events-none -z-0"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="absolute top-80 right-10 w-[450px] h-[450px] rounded-full blur-[140px] opacity-25 pointer-events-none -z-0"
        style={{ backgroundColor: theme.secondary || theme.accent }}
      />

      {/* TOP NAVIGATION HEADER WITH CLUB ACCENTS */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 lg:px-10 py-4 border-b relative z-20 backdrop-blur-2xl"
        style={{
          borderColor: theme.surfaceBorder,
          backgroundColor: 'rgba(10, 10, 12, 0.75)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-white font-bold text-xs transition-all border shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar para a Central</span>
            <span className="sm:hidden">Voltar</span>
          </button>

          {/* Quick club badge preview */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <img
              src={team.escudo}
              alt={team.nome}
              className="w-6 h-6 object-contain drop-shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
              }}
            />
            <span className="text-xs font-black text-white hidden md:inline">
              {team.nome}
            </span>
          </div>
        </div>

        {/* Club switcher popover button */}
        <div className="relative">
          <button
            onClick={() => setShowClubSelector(!showClubSelector)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all border shadow-lg hover:scale-105"
            style={{
              backgroundColor: `${theme.accent}20`,
              color: '#ffffff',
              borderColor: `${theme.accent}60`,
            }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span className="hidden sm:inline">Ver Outro Clube</span>
            <span className="sm:hidden">Clubes</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* Popover showing all 20 clubs */}
          {showClubSelector && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 p-3 rounded-3xl bg-neutral-950/95 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 max-h-96 overflow-y-auto"
              style={{
                boxShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 30px ${theme.glow}`,
              }}
            >
              <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-white/10 mb-2">
                Selecione um clube do Brasileirão
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CANONICAL_20_CLUBS.map((c) => {
                  const isCurrent = c.slug === team.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => {
                        setShowClubSelector(false);
                        onSelectOtherTeam(c.slug);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <img src={c.escudo} alt={c.nome} className="w-5 h-5 object-contain" />
                      <span className="truncate">{c.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HERO SECTION: CLUB SPOTLIGHT THEMED WITH CREST COLORS */}
      <div
        className={`relative p-6 sm:p-10 lg:p-12 border-b bg-gradient-to-b ${theme.gradient} overflow-hidden`}
        style={{ borderColor: theme.surfaceBorder }}
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10 max-w-7xl mx-auto">
          {/* Official 3D Shield Crest with Club Border Glow */}
          <div className="relative group shrink-0">
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl p-5 vision-3d-glass border flex items-center justify-center transition-all duration-300 relative"
              style={{
                borderColor: theme.border,
                boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 45px ${theme.glow}`,
                background: `radial-gradient(circle at 50% 50%, ${theme.primary}35 0%, rgba(10,10,12,0.85) 100%)`,
              }}
            >
              {/* Internal rim light */}
              <div className="absolute inset-2 rounded-2xl border border-white/10 pointer-events-none" />

              <img
                src={team.escudo}
                alt={team.nome}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] group-hover:scale-110 transition-transform duration-300 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                }}
              />
            </div>

            {team.fundacao && (
              <span
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white px-3.5 py-1 rounded-full border whitespace-nowrap shadow-xl"
                style={{
                  backgroundColor: 'rgba(10, 10, 12, 0.9)',
                  borderColor: theme.border,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.6), 0 0 15px ${theme.glow}`,
                }}
              >
                Fundado em {team.fundacao}
              </span>
            )}
          </div>

          {/* Club Info & Headlines */}
          <div className="flex-1 text-center lg:text-left">
            {/* Club official motto & shield pattern badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                style={{
                  backgroundColor: `${theme.accent}20`,
                  color: theme.accent,
                  borderColor: `${theme.accent}60`,
                  boxShadow: `0 0 15px ${theme.glow}`,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{theme.motto}</span>
              </span>

              <span
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold border text-slate-300"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {theme.shieldPattern}
              </span>
            </div>

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

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight drop-shadow-lg">
              {team.nome}
            </h1>
            {team.nomeCompleto && team.nomeCompleto !== team.nome && (
              <p className="text-sm sm:text-base text-slate-200 mt-1 font-medium">
                {team.nomeCompleto}
              </p>
            )}

            {/* Quick Metrics Strip Themed */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
              {team.estatisticas?.pontos !== undefined && (
                <div
                  className="px-4 py-2.5 rounded-2xl border text-center shadow-lg"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pontos</span>
                  <span
                    className="text-xl font-black font-mono tabular-nums"
                    style={{ color: theme.accent }}
                  >
                    {team.estatisticas.pontos}
                  </span>
                </div>
              )}

              {team.estatisticas?.posicao !== undefined && (
                <div
                  className="px-4 py-2.5 rounded-2xl border text-center shadow-lg"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Posição</span>
                  <span className="text-xl font-black font-mono text-white tabular-nums">
                    {team.estatisticas.posicao}º
                  </span>
                </div>
              )}

              {team.estatisticas?.vitorias !== undefined && (
                <div
                  className="px-4 py-2.5 rounded-2xl border text-center shadow-lg"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vitórias</span>
                  <span className="text-xl font-black font-mono text-sky-400 tabular-nums">
                    {team.estatisticas.vitorias}
                  </span>
                </div>
              )}

              {team.estatisticas?.saldoGols !== undefined && (
                <div
                  className="px-4 py-2.5 rounded-2xl border text-center shadow-lg"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo</span>
                  <span
                    className={`text-xl font-black font-mono tabular-nums ${
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
                <div
                  className="px-4 py-2.5 rounded-2xl border text-center shadow-lg"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Aprov.</span>
                  <span className="text-xl font-black font-mono text-amber-400 tabular-nums">
                    {team.estatisticas.aproveitamento}%
                  </span>
                </div>
              )}

              {team.urlOficial && (
                <a
                  href={team.urlOficial}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all text-xs font-bold shadow-lg"
                >
                  <span>Portal Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 6 DEDICATED TABS STYLED WITH CLUB CREST THEME */}
        <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab('elenco')}
            style={
              activeTab === 'elenco'
                ? {
                    backgroundColor: theme.tabActiveBg,
                    color: theme.tabActiveText,
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'elenco'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
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
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'historia'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
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
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'classificacao'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
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
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'artilheiros'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
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
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'proximos'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
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
                    boxShadow: `0 10px 28px ${theme.glow}`,
                  }
                : {
                    borderColor: theme.surfaceBorder,
                  }
            }
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === 'resultados'
                ? 'scale-[1.03] ring-1 ring-white/30'
                : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 border hover:border-white/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Últimos Resultados ({pastResults.length})</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT AREA WITH CLUB AMBIENT STYLING */}
      <div className="p-4 sm:p-8 lg:p-10 min-h-[500px] max-w-7xl mx-auto w-full relative z-10">
        {/* ======================================================== */}
        {/* TAB 1: ELENCO OFICIAL */}
        {/* ======================================================== */}
        {activeTab === 'elenco' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {squad.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl p-8 border"
                style={{
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.surfaceBorder,
                }}
              >
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Elenco sincronizando</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  A relação completa de jogadores do {team.nome} está sendo sincronizada com os dados oficiais da temporada.
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
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 0 10px ${theme.glow}`,
                          }}
                        />
                        <h3 className="text-base font-extrabold text-white tracking-wide uppercase font-display">
                          {group.title} ({group.list.length})
                        </h3>
                        <div
                          className="flex-1 h-px"
                          style={{
                            background: `linear-gradient(to right, ${theme.surfaceBorder}, transparent)`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                        {group.list.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className="group relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.03] flex flex-col justify-between"
                            style={{
                              backgroundColor: theme.surfaceBg,
                              borderColor: theme.surfaceBorder,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = theme.accent;
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px rgba(0,0,0,0.6), 0 0 20px ${theme.glow}`;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = theme.surfaceBorder;
                              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Player Photo or Number badge */}
                              <div
                                className="relative w-14 h-14 rounded-2xl bg-black/50 border flex items-center justify-center shrink-0 overflow-hidden shadow-inner"
                                style={{ borderColor: `${theme.accent}50` }}
                              >
                                {player.foto || player.fotoEspn ? (
                                  <img
                                    src={player.foto || player.fotoEspn || undefined}
                                    alt={player.nome}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
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
                                  <span
                                    className="absolute bottom-0 right-0 font-mono text-[9px] font-black text-white px-1.5 py-0.5 rounded-tl-md"
                                    style={{ backgroundColor: `${theme.primary}E0` }}
                                  >
                                    #{player.numero}
                                  </span>
                                )}
                              </div>

                              {/* Player info */}
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="text-sm font-bold text-white truncate transition-colors"
                                  style={{
                                    color: '#ffffff',
                                  }}
                                >
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
                            <div
                              className="mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] text-slate-400"
                              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                            >
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
            {/* Overview Card with Club Glow */}
            <div
              className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden"
              style={{
                backgroundColor: theme.surfaceBg,
                borderColor: theme.border,
                boxShadow: `0 20px 45px rgba(0,0,0,0.6), 0 0 35px ${theme.glow}`,
              }}
            >
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-30 pointer-events-none"
                style={{ backgroundColor: theme.primary }}
              />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md"
                  style={{
                    backgroundColor: `${theme.accent}25`,
                    borderColor: `${theme.accent}60`,
                  }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: theme.accent }} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-display">
                    Trajetória & Origem do {team.nome}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {theme.shieldPattern} · {theme.motto}
                  </p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
                <p>
                  {team.historia ||
                    `${team.nome} é uma das mais tradicionais e vitoriosas agremiações do futebol brasileiro e internacional. O clube ostenta uma rica trajetória forjada por ídolos históricos, torcida vibrante e conquistas inesquecíveis que marcam o esporte nacional.`}
                </p>
              </div>

              {/* Quick details grid */}
              <div
                className="mt-6 pt-6 border-t grid grid-cols-2 sm:grid-cols-4 gap-4"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: 'rgba(10,10,12,0.6)',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fundação</span>
                  <span className="text-base font-black text-white font-mono">
                    {team.fundacao || 'Tradição Histórica'}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: 'rgba(10,10,12,0.6)',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estádio Principal</span>
                  <span className="text-base font-black text-white truncate block">
                    {team.estadio || 'Arena Principal'}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: 'rgba(10,10,12,0.6)',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cidade / UF</span>
                  <span className="text-base font-black text-white truncate block">
                    {team.cidade || 'Brasil'} {team.estado ? `(${team.estado})` : ''}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: 'rgba(10,10,12,0.6)',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Comissão Técnica</span>
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    borderColor: `${theme.accent}50`,
                  }}
                >
                  <Trophy className="w-5 h-5" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide font-display">
                  Galeria de Títulos Oficiais do {team.nome}
                </h3>
              </div>

              {team.titulos && team.titulos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.titulos.map((t: any, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border transition-all flex items-center gap-4 hover:scale-[1.02]"
                      style={{
                        backgroundColor: theme.surfaceBg,
                        borderColor: theme.surfaceBorder,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md"
                        style={{
                          backgroundColor: `${theme.accent}25`,
                          borderColor: `${theme.accent}50`,
                        }}
                      >
                        <Award className="w-6 h-6" style={{ color: theme.accent }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {typeof t === 'string' ? t : t.nome || t.competicao || 'Título Oficial'}
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
                  <div
                    className="p-4 rounded-2xl border flex items-center gap-4"
                    style={{
                      backgroundColor: theme.surfaceBg,
                      borderColor: theme.surfaceBorder,
                    }}
                  >
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">CAMPEONATO BRASILEIRO SÉRIE A</h4>
                      <p className="text-xs text-slate-400">Série A de elite nacional</p>
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-2xl border flex items-center gap-4"
                    style={{
                      backgroundColor: theme.surfaceBg,
                      borderColor: theme.surfaceBorder,
                    }}
                  >
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">COPA DO BRASIL</h4>
                      <p className="text-xs text-slate-400">Torneio mata-mata nacional</p>
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-2xl border flex items-center gap-4"
                    style={{
                      backgroundColor: theme.surfaceBg,
                      borderColor: theme.surfaceBorder,
                    }}
                  >
                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">CAMPEONATO ESTADUAL</h4>
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
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
                  TABELA DO CAMPEONATO BRASILEIRO SÉRIE A
                </h3>
                <p className="text-xs text-slate-300">
                  Posição do <span className="font-bold text-white">{team.nome}</span> em destaque temático
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  G4 Libertadores
                </span>
                <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  Pré-Libertadores
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Sul-Americana
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  Z4
                </span>
              </div>
            </div>

            {standings.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl p-8 border"
                style={{
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.surfaceBorder,
                }}
              >
                <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Carregando tabela atualizada</h4>
                <p className="text-xs text-slate-400 mt-1">Conectando aos dados da Série A…</p>
              </div>
            ) : (
              <div
                className="overflow-x-auto rounded-3xl border backdrop-blur-xl shadow-2xl"
                style={{
                  backgroundColor: 'rgba(10,10,12,0.8)',
                  borderColor: theme.surfaceBorder,
                }}
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className="border-b text-[10px] uppercase font-mono text-slate-300"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <th className="py-3.5 px-3 text-center w-12 font-bold">Pos</th>
                      <th className="py-3.5 px-4 font-bold">Clube</th>
                      <th className="py-3.5 px-3 text-center font-bold text-white">PTS</th>
                      <th className="py-3.5 px-3 text-center">J</th>
                      <th className="py-3.5 px-3 text-center">V</th>
                      <th className="py-3.5 px-3 text-center">E</th>
                      <th className="py-3.5 px-3 text-center">D</th>
                      <th className="py-3.5 px-3 text-center">GP</th>
                      <th className="py-3.5 px-3 text-center">GC</th>
                      <th className="py-3.5 px-3 text-center font-bold">SG</th>
                      <th className="py-3.5 px-3 text-center">%</th>
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
                      else if (pos <= 12) posIndicator = 'text-amber-400 font-bold';
                      else if (pos >= 17) posIndicator = 'text-rose-400 font-bold';

                      return (
                        <tr
                          key={row.posicao}
                          style={
                            isCurrent
                              ? {
                                  backgroundColor: `${theme.primary}35`,
                                  borderLeft: `5px solid ${theme.accent}`,
                                  boxShadow: `inset 0 0 25px ${theme.glow}`,
                                }
                              : undefined
                          }
                          className={`transition-colors ${
                            isCurrent
                              ? 'font-bold'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <td className={`py-3.5 px-3 text-center font-mono ${posIndicator}`}>
                            {row.posicao}º
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rowTeamBadge}
                                alt={rowTeamName}
                                className="w-6 h-6 object-contain shrink-0 drop-shadow"
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
                                  className="text-[9px] font-mono px-2.5 py-0.5 rounded-full border font-black uppercase tracking-wider"
                                  style={{
                                    backgroundColor: `${theme.accent}35`,
                                    color: theme.accent,
                                    borderColor: `${theme.accent}70`,
                                  }}
                                >
                                  SEU CLUBE
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className="py-3.5 px-3 text-center font-mono font-black text-sm"
                            style={{ color: isCurrent ? theme.accent : '#ffffff' }}
                          >
                            {row.pontos}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-300">{row.jogos}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-emerald-400">{row.vitorias}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-400">{row.empates}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-rose-400">{row.derrotas}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-300">{row.golsPro}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-400">{row.golsContra}</td>
                          <td className={`py-3.5 px-3 text-center font-mono font-bold ${row.saldoGols > 0 ? 'text-emerald-400' : row.saldoGols < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {row.saldoGols > 0 ? `+${row.saldoGols}` : row.saldoGols}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-300">
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    borderColor: `${theme.accent}50`,
                  }}
                >
                  <Flame className="w-5 h-5" style={{ color: theme.accent }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide font-display">
                    Artilheiros do {team.nome} na Temporada
                  </h3>
                  <p className="text-xs text-slate-300">
                    Goleadores oficiais do elenco
                  </p>
                </div>
              </div>

              {clubScorers.length === 0 ? (
                <div
                  className="p-8 rounded-2xl border text-center"
                  style={{
                    backgroundColor: theme.surfaceBg,
                    borderColor: theme.surfaceBorder,
                  }}
                >
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
                      className="p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.02]"
                      style={{
                        backgroundColor: theme.surfaceBg,
                        borderColor: index === 0 ? theme.border : theme.surfaceBorder,
                        boxShadow: index === 0 ? `0 10px 25px ${theme.glow}` : undefined,
                      }}
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
                        <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
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
              <div
                className="space-y-4 pt-6 border-t"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display">
                    ARTILHARIA GERAL DO BRASILEIRÃO SÉRIE A
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
                                backgroundColor: `${theme.primary}25`,
                                borderColor: theme.accent,
                                boxShadow: `0 8px 20px ${theme.glow}`,
                              }
                            : {
                                backgroundColor: theme.surfaceBg,
                                borderColor: theme.surfaceBorder,
                              }
                        }
                        className="p-4 rounded-2xl border transition-all flex items-center justify-between"
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
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide font-display">
                Próximos Compromissos do {team.nome}
              </h3>
              <p className="text-xs text-slate-400">
                Partidas agendadas com horários e canais de transmissão
              </p>
            </div>

            {upcomingMatches.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl p-8 border"
                style={{
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.surfaceBorder,
                }}
              >
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
                      className="p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 hover:scale-[1.01]"
                      style={{
                        backgroundColor: theme.surfaceBg,
                        borderColor: theme.surfaceBorder,
                      }}
                    >
                      {/* Competition and Date Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="font-mono px-2.5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-wider border"
                          style={{
                            backgroundColor: `${theme.accent}20`,
                            color: theme.accent,
                            borderColor: `${theme.accent}50`,
                          }}
                        >
                          {(match.campeonato || 'Brasileirão Série A').toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-slate-300 font-medium">
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
                          <span className="font-mono text-xs font-black text-slate-400 bg-white/10 px-2.5 py-1 rounded-xl">
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
                      <div
                        className="pt-3 border-t flex items-center justify-between"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <div>
                          <BroadcastBadge channel={broadcastChannel} size="sm" />
                        </div>

                        <button
                          onClick={() => onWatchMatch(match)}
                          style={{
                            backgroundColor: theme.tabActiveBg,
                            color: theme.tabActiveText,
                            boxShadow: `0 4px 15px ${theme.glow}`,
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
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide font-display">
                Histórico Recente de Placares
              </h3>
              <p className="text-xs text-slate-400">
                Partidas encerradas do {team.nome} na temporada
              </p>
            </div>

            {pastResults.length === 0 ? (
              <div
                className="text-center py-16 rounded-3xl p-8 border"
                style={{
                  backgroundColor: theme.surfaceBg,
                  borderColor: theme.surfaceBorder,
                }}
              >
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
                      className="p-5 rounded-3xl border flex flex-col justify-between space-y-3"
                      style={{
                        backgroundColor: theme.surfaceBg,
                        borderColor: theme.surfaceBorder,
                      }}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                          {(match.campeonato || 'Série A').toUpperCase()}
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
                            className="w-10 h-10 object-contain shrink-0 drop-shadow"
                          />
                          <span className="text-xs font-bold text-white truncate">
                            {homeName}
                          </span>
                        </div>

                        {/* Placar Real */}
                        <div
                          className="px-4 py-1.5 rounded-2xl bg-black/60 border font-mono text-base font-black text-white tracking-widest shrink-0"
                          style={{ borderColor: theme.surfaceBorder }}
                        >
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
                            className="w-10 h-10 object-contain shrink-0 drop-shadow"
                          />
                        </div>
                      </div>

                      {match.estadio && (
                        <div
                          className="pt-2 border-t text-[11px] text-slate-400"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                        >
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

      {/* 4. FOOTER QUICK EXPLORER: ALL 20 CLUBS CAROUSEL */}
      <div
        className="mt-12 p-6 sm:p-8 border-t backdrop-blur-xl relative z-10"
        style={{
          borderColor: theme.surfaceBorder,
          backgroundColor: 'rgba(10, 10, 12, 0.9)',
        }}
      >
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" style={{ color: theme.accent }} />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Explorar Outros Clubes do Brasileirão
              </h4>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Clique em qualquer escudo para ver a página temática com suas cores
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {CANONICAL_20_CLUBS.map((c) => {
              const isCurrent = c.slug === team.slug;
              const cTheme = getClubTheme(c.slug);

              return (
                <button
                  key={c.slug}
                  onClick={() => onSelectOtherTeam(c.slug)}
                  title={c.nome}
                  style={
                    isCurrent
                      ? {
                          borderColor: cTheme.accent,
                          backgroundColor: `${cTheme.accent}30`,
                          boxShadow: `0 0 20px ${cTheme.glow}`,
                        }
                      : undefined
                  }
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all shrink-0 hover:scale-110 active:scale-95 ${
                    isCurrent
                      ? 'scale-105'
                      : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/10'
                  }`}
                >
                  <img
                    src={c.escudo}
                    alt={c.nome}
                    className="w-10 h-10 object-contain drop-shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-200 whitespace-nowrap max-w-[65px] truncate text-center">
                    {c.nome}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holographic Player Modal for deep dive on any squad member */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          clubName={team.nome}
          clubBadge={team.escudo}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
