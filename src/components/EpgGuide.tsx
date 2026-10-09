import React from 'react';
import { Tv, Radio, Clock, ShieldCheck, Play, MapPin } from 'lucide-react';
import { EpgStatus, Match } from '../types/football';
import { BroadcastBadge } from './BroadcastBadge';
import { helperGetTeamBadge, helperGetTeamName } from '../services/futebolApi';

interface EpgGuideProps {
  epg: EpgStatus | null;
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  isLoading: boolean;
}

export const EpgGuide: React.FC<EpgGuideProps> = ({
  epg,
  matches,
  onSelectMatch,
  isLoading,
}) => {
  // Filter matches that have televised channels
  const televisedMatches = matches.filter(
    (m) => m.transmissoes && m.transmissoes.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Overview EPG Banner in 3D Translucent Glass */}
      <div className="rounded-3xl vision-3d-glass p-7 sm:p-8 border border-white/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Sinal de Transmissão Oficial de TV & Streaming</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1.5 font-display tracking-tight">
              Onde Assistir Futebol Ao Vivo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Mapeamento em tempo real de sinal e grades esportivas: SporTV, Premiere Clubes, ESPN, BandSports, CazéTV e TV aberta com qualidade HD e 4K.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-2.5 rounded-2xl bg-black/40 border border-white/15 flex items-center gap-3 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Emissoras Conectadas</span>
                <span className="text-sm font-black text-white font-mono">6 Redes Oficiais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channels badges overview */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2.5">
          {['Premiere Clubes', 'SporTV', 'SporTV 2', 'SporTV 3', 'ESPN', 'ESPN 4', 'CazéTV', 'BandSports', 'TV Globo'].map(
            (canal) => (
              <BroadcastBadge key={canal} channel={canal} size="md" />
            )
          )}
        </div>
      </div>

      {/* Televised Matches Feed in 3D Glass Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Próximas Transmissões Confirmadas ({televisedMatches.length})</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Grade Atualizada
          </span>
        </div>

        {televisedMatches.length === 0 ? (
          <div className="rounded-3xl vision-3d-glass p-12 text-center text-slate-400">
            <Tv className="w-10 h-10 mx-auto mb-3 opacity-40 text-emerald-400" />
            <p className="text-sm font-medium">Nenhuma transmissão com emissora confirmada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {televisedMatches.map((m) => {
              const homeName = helperGetTeamName(m.mandante);
              const awayName = helperGetTeamName(m.visitante);
              const homeBadge = helperGetTeamBadge(m.mandante, m.escudoMandante);
              const awayBadge = helperGetTeamBadge(m.visitante, m.escudoVisitante);

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m)}
                  className="rounded-3xl vision-3d-glass p-6 cursor-pointer hover:border-emerald-400/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                  <div>
                    {/* Top match header */}
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-4">
                      <span className="font-black text-white tracking-wider uppercase text-xs">
                        {(m.campeonato || 'Brasileirão').toUpperCase()}
                      </span>
                      <span className="font-mono tabular-nums text-emerald-300 font-bold bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                        {m.data} · {m.horario}
                      </span>
                    </div>

                    {/* Teams row with badges */}
                    <div className="flex items-center justify-between my-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl pedestal-3d p-2 flex items-center justify-center shrink-0">
                          <img
                            src={homeBadge}
                            alt={homeName}
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        </div>
                        <span className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                          {homeName}
                        </span>
                      </div>

                      <span className="text-xs font-black text-slate-500 font-mono">VS</span>

                      <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="w-12 h-12 rounded-xl pedestal-3d p-2 flex items-center justify-center shrink-0">
                          <img
                            src={awayBadge}
                            alt={awayName}
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        </div>
                        <span className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors text-right">
                          {awayName}
                        </span>
                      </div>
                    </div>

                    {m.estadio && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{m.estadio}</span>
                      </div>
                    )}
                  </div>

                  {/* Emissoras badges */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/25 -mx-6 -mb-6 p-5 rounded-b-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.transmissoes?.map((tr, i) => (
                        <BroadcastBadge key={i} channel={tr} size="sm" />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMatch(m);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all shadow-md shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Sintonizar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
