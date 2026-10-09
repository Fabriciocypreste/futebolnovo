import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, ExternalLink, Users, BookOpen, Trophy, Shield, Activity, User } from 'lucide-react';
import { Team, Player } from '../types/football';
import { fetchTeamFull } from '../services/futebolApi';
import { PlayerModal } from './PlayerModal';

interface ClubModalProps {
  team: Team | null;
  onClose: () => void;
}

export const ClubModal: React.FC<ClubModalProps> = ({ team, onClose }) => {
  const [fullTeam, setFullTeam] = useState<Team | null>(team);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'elenco' | 'historia' | 'estatisticas'>('elenco');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!team) return;
    setLoading(true);
    setFullTeam(team);

    fetchTeamFull(team.slug)
      .then((data) => {
        if (data) {
          setFullTeam(data);
        }
      })
      .catch((err) => {
        console.error('Error loading full team details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [team]);

  if (!team) return null;

  const currentTeam = fullTeam || team;
  const squad = currentTeam.elenco || [];

  // Group squad by position
  const goalkeepers = squad.filter(
    (p) => p.posicao?.toLowerCase().includes('goleiro') || p.posicaoCodigo === 'G'
  );
  const defenders = squad.filter(
    (p) =>
      p.posicao?.toLowerCase().includes('defens') ||
      p.posicao?.toLowerCase().includes('zagueiro') ||
      p.posicao?.toLowerCase().includes('lateral') ||
      p.posicaoCodigo === 'D' ||
      p.posicaoCodigo === 'Z' ||
      p.posicaoCodigo === 'LD' ||
      p.posicaoCodigo === 'LE'
  );
  const midfielders = squad.filter(
    (p) =>
      p.posicao?.toLowerCase().includes('meio') ||
      p.posicao?.toLowerCase().includes('volante') ||
      p.posicaoCodigo === 'M' ||
      p.posicaoCodigo === 'V'
  );
  const forwards = squad.filter(
    (p) =>
      p.posicao?.toLowerCase().includes('atacante') ||
      p.posicao?.toLowerCase().includes('ponta') ||
      p.posicaoCodigo === 'A'
  );

  // Remaining or unclassified
  const classifiedIds = new Set([
    ...goalkeepers.map((p) => p.id),
    ...defenders.map((p) => p.id),
    ...midfielders.map((p) => p.id),
    ...forwards.map((p) => p.id),
  ]);
  const others = squad.filter((p) => !classifiedIds.has(p.id));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        <div
          className="relative w-full max-w-4xl rounded-3xl vision-glass-panel border border-white/20 shadow-2xl text-slate-100 my-auto overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Specular line */}
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors z-10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Club Hero Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white/[0.07] to-transparent border-b border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.06] p-3 flex items-center justify-center border border-white/15 shadow-xl shrink-0">
              <img
                src={currentTeam.escudo}
                alt={currentTeam.nome}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                }}
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                <span>{currentTeam.cidade || 'Brasil'} {currentTeam.estado ? `· ${currentTeam.estado}` : ''}</span>
                {currentTeam.fundacao && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Fundado em {currentTeam.fundacao}</span>
                  </>
                )}
                {currentTeam.sigla && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-bold text-emerald-400">{currentTeam.sigla}</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {currentTeam.nome}
              </h2>
              {currentTeam.nomeCompleto && (
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  {currentTeam.nomeCompleto}
                </p>
              )}

              {/* Stadium & official site tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                {currentTeam.estadio && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentTeam.estadio}</span>
                  </div>
                )}
                {currentTeam.urlOficial && (
                  <a
                    href={currentTeam.urlOficial}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-300 hover:text-emerald-200 hover:bg-white/10 transition-colors"
                  >
                    <span>Site Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Modal Tabs */}
          <div className="px-6 border-b border-white/10 flex items-center gap-4 bg-black/20 text-xs font-medium">
            <button
              onClick={() => setActiveTab('elenco')}
              className={`py-3 relative flex items-center gap-2 transition-colors ${
                activeTab === 'elenco' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Elenco Completo ({squad.length})</span>
              {activeTab === 'elenco' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('historia')}
              className={`py-3 relative flex items-center gap-2 transition-colors ${
                activeTab === 'historia' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>História & Títulos</span>
              {activeTab === 'historia' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('estatisticas')}
              className={`py-3 relative flex items-center gap-2 transition-colors ${
                activeTab === 'estatisticas' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Campanha 2026</span>
              {activeTab === 'estatisticas' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* ELENCO TAB */}
            {activeTab === 'elenco' && (
              <div>
                {loading && squad.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Carregando elenco oficial do {currentTeam.nome}…</p>
                  </div>
                ) : squad.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Elenco não disponível no momento para esta temporada.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Render Position Section helper */}
                    {[
                      { title: 'Goleiros', list: goalkeepers },
                      { title: 'Defensores & Laterais', list: defenders },
                      { title: 'Meio-Campistas & Volantes', list: midfielders },
                      { title: 'Atacantes & Pontas', list: forwards },
                      { title: 'Demais Atletas', list: others },
                    ]
                      .filter((sec) => sec.list.length > 0)
                      .map((sec) => (
                        <div key={sec.title}>
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            {sec.title} · <span className="font-mono tabular-nums">{sec.list.length}</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {sec.list.map((player) => (
                              <div
                                key={player.id || player.espnId || player.nome}
                                onClick={() => setSelectedPlayer(player)}
                                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/30 transition-all cursor-pointer flex items-center gap-3 shadow-sm hover:scale-[1.01]"
                              >
                                {/* Player Mini Photo */}
                                <div className="w-12 h-12 rounded-xl bg-white/5 p-0.5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  {player.foto ? (
                                    <img
                                      src={player.foto}
                                      alt={player.nome}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover object-top rounded-lg"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-slate-500" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    {player.numero !== undefined && player.numero !== null && (
                                      <span className="font-mono font-bold text-xs text-emerald-400">
                                        #{player.numero}
                                      </span>
                                    )}
                                    <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                                      {player.nome}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span className="truncate">{player.posicao || 'Atleta'}</span>
                                    {player.idade && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="font-mono tabular-nums">{player.idade} anos</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* HISTORIA TAB */}
            {activeTab === 'historia' && (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                {currentTeam.historiaParagrafos && currentTeam.historiaParagrafos.length > 0 ? (
                  currentTeam.historiaParagrafos.map((par, i) => (
                    <p key={i} className="text-slate-200">
                      {par}
                    </p>
                  ))
                ) : currentTeam.historia ? (
                  <p className="whitespace-pre-line text-slate-200">{currentTeam.historia}</p>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>A história detalhada deste clube está em processo de catalogação oficial.</p>
                  </div>
                )}

                {/* Títulos if present */}
                {currentTeam.titulos && currentTeam.titulos.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Conquistas e Títulos de Destaque</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {currentTeam.titulos.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ESTATISTICAS TAB */}
            {activeTab === 'estatisticas' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Resumo do Desempenho
                  </h4>
                  <p className="text-sm font-medium text-white">
                    {currentTeam.resumoClassificacao || 'Campanha oficial no Campeonato Brasileiro 2026'}
                  </p>
                  {currentTeam.campanha && (
                    <p className="text-xs text-slate-400 mt-1">
                      Campanha (V-E-D): <span className="font-mono tabular-nums text-white">{currentTeam.campanha}</span>
                    </p>
                  )}
                </div>

                {currentTeam.estatisticas && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Jogos</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
                        {currentTeam.estatisticas.gamesPlayed ?? '—'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Pontos</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
                        {currentTeam.estatisticas.points ?? '—'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Vitórias</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-sky-400 mt-1 block">
                        {currentTeam.estatisticas.wins ?? '—'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Saldo de Gols</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1 block">
                        {currentTeam.estatisticas.pointDifferential ?? '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Central Oficial do Clube · Temporada 2026</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Nested Player Modal when clicked */}
      <PlayerModal
        player={selectedPlayer}
        clubName={currentTeam.nome}
        clubBadge={currentTeam.escudo}
        onClose={() => setSelectedPlayer(null)}
      />
    </>
  );
};
