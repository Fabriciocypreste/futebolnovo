import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchUpcomingMatches,
  fetchLeagueMatches,
  fetchStandings,
  fetchTopScorers,
  fetchAllTeams,
  fetchEpgStatus,
  POPULAR_LEAGUES,
  helperGetTeamName,
  resolveTeamSlug,
} from './services/futebolApi';
import { Match, StandingRow, Scorer, Team, EpgStatus, Player } from './types/football';
import { SpatialAtmosphere } from './components/SpatialAtmosphere';
import { NavigationMenuButtons, NavTab } from './components/NavigationMenuButtons';
import { MatchCard } from './components/MatchCard';
import { MatchModal } from './components/MatchModal';
import { StreamingPlayerModal } from './components/StreamingPlayerModal';
import { StandingsTable } from './components/StandingsTable';
import { ClubCard } from './components/ClubCard';
import { ClubModal } from './components/ClubModal';
import { PlayerModal } from './components/PlayerModal';
import { ScorersList } from './components/ScorersList';
import { EpgGuide } from './components/EpgGuide';
import { FlaFluHeroBanner } from './components/FlaFluHeroBanner';
import { BrasileiraoClubsStrip } from './components/BrasileiraoClubsStrip';
import { TeamCustomPage } from './components/TeamCustomPage';
import { Radio, Trophy, Users, Tv, Calendar, Play, Signal, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('jogos');
  const [selectedLeague, setSelectedLeague] = useState<string>('bra.1');
  const [viewingTeamSlug, setViewingTeamSlug] = useState<string | null>(null);

  // Data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [epg, setEpg] = useState<EpgStatus | null>(null);

  // Loading states
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  const [loadingStandings, setLoadingStandings] = useState<boolean>(true);
  const [loadingScorers, setLoadingScorers] = useState<boolean>(true);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected modals
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedStreamMatch, setSelectedStreamMatch] = useState<Match | null>(null);
  const [selectedClub, setSelectedClub] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Match filter (all, with TV, finished)
  const [matchFilter, setMatchFilter] = useState<'todos' | 'tv' | 'encerrados'>('todos');

  // Load all initial data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);

    // 1. Fetch matches
    setLoadingMatches(true);
    fetchUpcomingMatches(selectedLeague)
      .then((data) => setMatches(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingMatches(false));

    // 2. Fetch standings
    setLoadingStandings(true);
    fetchStandings(selectedLeague)
      .then((data) => setStandings(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingStandings(false));

    // 3. Fetch scorers
    setLoadingScorers(true);
    fetchTopScorers(selectedLeague)
      .then((data) => setScorers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingScorers(false));

    // 4. Fetch teams
    if (teams.length === 0) {
      setLoadingTeams(true);
      fetchAllTeams()
        .then((data) => setTeams(data))
        .catch((err) => console.error(err))
        .finally(() => setLoadingTeams(false));
    }

    // 5. Fetch EPG TV status
    fetchEpgStatus()
      .then((data) => setEpg(data))
      .catch((err) => console.error(err))
      .finally(() => setIsRefreshing(false));
  }, [selectedLeague, teams.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Android TV Box Remote Control D-Pad Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close open modals with Back / Escape key
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (selectedStreamMatch) {
          setSelectedStreamMatch(null);
          return;
        }
        if (selectedPlayer) {
          setSelectedPlayer(null);
          return;
        }
        if (selectedMatch) {
          setSelectedMatch(null);
          return;
        }
        if (viewingTeamSlug) {
          setViewingTeamSlug(null);
          return;
        }
      }

      // Quick tab switching with Number keys 1-5
      const tabMap: Record<string, NavTab> = {
        '1': 'jogos',
        '2': 'tv',
        '3': 'tabela',
        '4': 'clubes',
        '5': 'artilharia',
      };
      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStreamMatch, selectedPlayer, selectedClub, selectedMatch]);

  // Handle selecting a team name anywhere to open their customized full page
  const handleSelectTeamByName = (teamName: string) => {
    const slugToUse = resolveTeamSlug(teamName, teams);
    setViewingTeamSlug(slugToUse);
    if (selectedMatch) setSelectedMatch(null);
    if (selectedStreamMatch) setSelectedStreamMatch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Matches based on filter
  const filteredMatches = useMemo(() => {
    let list = [...matches];

    if (matchFilter === 'tv') {
      list = list.filter((m) => m.transmissoes && m.transmissoes.length > 0);
    } else if (matchFilter === 'encerrados') {
      list = list.filter((m) => m.status === 'encerrado' || m.status === 'finished');
    }

    return list;
  }, [matches, matchFilter]);

  // Filtered Teams for the Clubs Tab
  const filteredTeams = useMemo(() => {
    return teams;
  }, [teams]);

  // Featured Spotlight Match
  const spotlightMatch = useMemo(() => {
    return matches.find((m) => m.transmissoes && m.transmissoes.length > 0) || matches[0];
  }, [matches]);

  // Live match count
  const liveCount = useMemo(() => {
    return matches.filter((m) => m.status === 'ao_vivo' || m.status === 'in_progress').length;
  }, [matches]);

  const currentLeagueObj =
    POPULAR_LEAGUES.find((l) => l.code === selectedLeague) || POPULAR_LEAGUES[0];

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-start py-4 sm:py-6 px-3 sm:px-8 lg:px-12">
      {/* Dynamic Football Pitch Blurred Gradient Backdrop */}
      <SpatialAtmosphere />

      {/* Main TV Box / Android App Streaming Canvas (visionOS Translucent Glass) */}
      <div className="relative z-10 w-full max-w-[1520px] rounded-3xl vision-glass-panel border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
        {/* If viewing a dedicated team custom page */}
        {viewingTeamSlug ? (
          <TeamCustomPage
            teamSlugOrName={viewingTeamSlug}
            onBack={() => setViewingTeamSlug(null)}
            onSelectOtherTeam={(slug) => setViewingTeamSlug(slug)}
            onWatchMatch={(m) => setSelectedStreamMatch(m)}
          />
        ) : (
          <>
            {/* Hero Section: Featured Match Banner (Flamengo x Fluminense) */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent space-y-6">
              {/* O Clássico das Multidões (Fla-Flu) Hero Banner */}
              <FlaFluHeroBanner
                onWatchLive={(match) => setSelectedStreamMatch(match)}
                onOpenDetails={(match) => setSelectedMatch(match)}
                onSelectTeam={(slug) => setViewingTeamSlug(slug)}
              />

              {/* 20 Clubes da Série A do Brasileirão (Logos & Acesso Rápido às Páginas Oficiais) */}
              <BrasileiraoClubsStrip
                teams={teams}
                selectedTeamSlug={viewingTeamSlug}
                onSelectTeam={(slug) => setViewingTeamSlug(slug)}
              />

              {/* Menu como botões diretamente embaixo das logos dos times */}
              <NavigationMenuButtons
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenLiveStream={() => {
                  if (spotlightMatch) setSelectedStreamMatch(spotlightMatch);
                  else if (matches[0]) setSelectedStreamMatch(matches[0]);
                }}
                liveMatchCount={liveCount}
              />

              {/* Remote-Friendly Competition Filter (Sem campo de busca) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none w-full">
                  <span className="text-xs text-slate-400 mr-1 shrink-0 font-extrabold uppercase tracking-wider">
                    COMPETIÇÕES:
                  </span>
                  {POPULAR_LEAGUES.map((league) => (
                    <button
                      key={league.code}
                      onClick={() => setSelectedLeague(league.code)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        selectedLeague === league.code
                          ? 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-400/25 scale-[1.03]'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/15'
                      }`}
                    >
                      {league.name.toUpperCase()}
                    </button>
                  ))}

                  <div className="ml-auto shrink-0 pl-2">
                    <button
                      onClick={loadData}
                      disabled={isRefreshing}
                      className="px-3.5 py-2 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/20 text-slate-300 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      title="Atualizar Transmissões"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Atualizar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <main className="p-6 sm:p-8 lg:p-10 flex-1">
              {/* TAB 1: JOGOS & AO VIVO */}
              {activeTab === 'jogos' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Filtrar:</span>
                      <div className="flex items-center p-1 bg-white/[0.05] rounded-2xl border border-white/15">
                        <button
                          onClick={() => setMatchFilter('todos')}
                          className={`px-4 py-1.5 rounded-xl transition-all font-semibold ${
                            matchFilter === 'todos'
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Todas as Partidas ({matches.length})
                        </button>
                        <button
                          onClick={() => setMatchFilter('tv')}
                          className={`px-4 py-1.5 rounded-xl transition-all font-semibold ${
                            matchFilter === 'tv'
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          📺 Com Transmissão TV
                        </button>
                        <button
                          onClick={() => setMatchFilter('encerrados')}
                          className={`px-4 py-1.5 rounded-xl transition-all font-semibold ${
                            matchFilter === 'encerrados'
                              ? 'bg-white/20 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Resultados
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      Exibindo{' '}
                      <span className="font-mono tabular-nums text-white font-bold">
                        {filteredMatches.length}
                      </span>{' '}
                      partidas
                    </div>
                  </div>

                  {loadingMatches ? (
                    <div className="py-24 flex flex-col items-center justify-center vision-glass rounded-3xl">
                      <div className="w-9 h-9 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-slate-300">Carregando calendário oficial de partidas…</p>
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="py-20 text-center vision-glass rounded-3xl text-slate-400">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Nenhuma partida encontrada para os critérios selecionados.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onSelect={setSelectedMatch}
                          onWatchStream={(m) => setSelectedStreamMatch(m)}
                          onSelectTeam={(teamName) => handleSelectTeamByName(teamName)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GUIA DE CANAIS & TRANSMISSÕES */}
              {activeTab === 'tv' && (
                <div>
                  <EpgGuide
                    epg={epg}
                    matches={matches}
                    onSelectMatch={(m) => setSelectedStreamMatch(m)}
                    isLoading={loadingMatches}
                  />
                </div>
              )}

              {/* TAB 3: CLASSIFICAÇÃO */}
              {activeTab === 'tabela' && (
                <div>
                  <StandingsTable
                    standings={standings}
                    leagueName={currentLeagueObj.name}
                    onSelectTeam={handleSelectTeamByName}
                    isLoading={loadingStandings}
                  />
                </div>
              )}

              {/* TAB 4: CLUBES & ELENCOS */}
              {activeTab === 'clubes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <span>Clubes & Elencos Oficiais</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Selecione um clube para visualizar a página oficial com elenco, fotos dos atletas, estádio e história.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {filteredTeams.length} clubes listados
                    </span>
                  </div>

                  {loadingTeams ? (
                    <div className="py-24 flex flex-col items-center justify-center vision-glass rounded-3xl">
                      <div className="w-9 h-9 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-sm text-slate-300">Carregando catálogo de clubes…</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {filteredTeams.map((team) => (
                        <ClubCard
                          key={team.id || team.slug}
                          team={team}
                          onSelect={(t) => handleSelectTeamByName(t.slug || t.nome)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ARTILHARIA */}
              {activeTab === 'artilharia' && (
                <div>
                  <ScorersList
                    scorers={scorers}
                    isLoading={loadingScorers}
                    onSelectScorer={(scorer) => {
                      setSelectedPlayer({
                        id: scorer.espnId || scorer.jogador,
                        nome: scorer.jogador || scorer.nome || 'Jogador',
                        foto: scorer.foto,
                        estatisticas: {
                          gols: scorer.gols,
                          jogos: scorer.jogos ?? undefined,
                          assistencias: scorer.assistencias ?? undefined,
                        },
                      });
                    }}
                  />
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Streaming Video Player Modal */}
      <StreamingPlayerModal
        match={selectedStreamMatch}
        onClose={() => setSelectedStreamMatch(null)}
      />

      {/* Match Details Modal */}
      <MatchModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onSelectTeam={handleSelectTeamByName}
        onWatchStream={(m) => setSelectedStreamMatch(m)}
      />

      {/* Club Clubhouse & Full Squad Modal */}
      <ClubModal team={selectedClub} onClose={() => setSelectedClub(null)} />

      {/* Player Holographic Modal */}
      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
