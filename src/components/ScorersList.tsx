import React from 'react';
import { Award, User } from 'lucide-react';
import { Scorer, Player } from '../types/football';

interface ScorersListProps {
  scorers: Scorer[];
  isLoading: boolean;
  onSelectScorer?: (scorer: Scorer) => void;
}

export const ScorersList: React.FC<ScorersListProps> = ({
  scorers,
  isLoading,
  onSelectScorer,
}) => {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl vision-glass p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-slate-300">Carregando artilharia oficial…</p>
      </div>
    );
  }

  if (!scorers || scorers.length === 0) {
    return (
      <div className="w-full rounded-2xl vision-glass p-8 text-center text-slate-400 min-h-[250px] flex flex-col items-center justify-center">
        <Award className="w-10 h-10 text-slate-500 mb-2 opacity-50" />
        <p className="text-sm">Artilharia ainda não computada para esta rodada.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl vision-glass overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Chuteira de Ouro · Artilharia</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Principais goleadores do campeonato brasileiro e competições
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-400">
          {scorers.length} goleadores catalogados
        </span>
      </div>

      {/* Grid of scorers */}
      <div className="divide-y divide-white/[0.05]">
        {scorers.slice(0, 20).map((scorer, idx) => {
          const rank = scorer.posicao || idx + 1;
          const isTop3 = rank <= 3;

          return (
            <div
              key={scorer.espnId || scorer.jogador || idx}
              onClick={() => onSelectScorer && onSelectScorer(scorer)}
              className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <span
                  className={`w-7 text-center font-mono tabular-nums font-bold text-sm ${
                    rank === 1
                      ? 'text-amber-300'
                      : rank === 2
                      ? 'text-slate-300'
                      : rank === 3
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {rank}º
                </span>

                {/* Player Photo */}
                <div className="relative w-11 h-11 rounded-xl bg-white/5 p-0.5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-emerald-400/40 transition-all">
                  {scorer.foto ? (
                    <img
                      src={scorer.foto}
                      alt={scorer.jogador}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Name & Club */}
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {scorer.jogador || scorer.nome}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    {scorer.escudoTime && (
                      <img
                        src={scorer.escudoTime}
                        alt={scorer.time}
                        className="w-3.5 h-3.5 object-contain"
                      />
                    )}
                    <span>{scorer.time}</span>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xl font-black font-mono tabular-nums text-emerald-400">
                    {scorer.gols}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">
                    Gols
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
