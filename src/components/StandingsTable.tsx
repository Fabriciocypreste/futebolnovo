import React from 'react';
import { StandingRow } from '../types/football';
import { Trophy, ChevronRight, Info } from 'lucide-react';

interface StandingsTableProps {
  standings: StandingRow[];
  leagueName: string;
  onSelectTeam: (teamName: string) => void;
  isLoading: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  leagueName,
  onSelectTeam,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl vision-glass p-8 flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-slate-300">Carregando classificação da {leagueName}…</p>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="w-full rounded-2xl vision-glass p-8 text-center text-slate-400 min-h-[250px] flex flex-col items-center justify-center">
        <Trophy className="w-10 h-10 text-slate-500 mb-2 opacity-50" />
        <p className="text-sm">Classificação indisponível para esta competição no momento.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl vision-glass overflow-hidden border border-white/10 shadow-2xl">
      {/* Table Header Details */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.02]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Tabela Geral · {leagueName}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Classificação oficial atualizada · Temporada 2026
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Libertadores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span>Pré-Libertadores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>Sul-Americana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Rebaixamento</span>
          </div>
        </div>
      </div>

      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 bg-black/20 font-medium">
              <th className="py-3 pl-6 pr-2 w-12 text-center">POS</th>
              <th className="py-3 px-3">CLUBE</th>
              <th className="py-3 px-2 text-center font-bold text-white">PTS</th>
              <th className="py-3 px-2 text-center">J</th>
              <th className="py-3 px-2 text-center">V</th>
              <th className="py-3 px-2 text-center">E</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center hidden md:table-cell">GP</th>
              <th className="py-3 px-2 text-center hidden md:table-cell">GC</th>
              <th className="py-3 px-2 text-center">SG</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">%</th>
              <th className="py-3 pr-6 pl-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {standings.map((row) => {
              const pos = row.posicao;
              let zoneBorder = 'border-l-transparent';
              let posColor = 'text-slate-300';

              if (pos <= 4) {
                zoneBorder = 'border-l-emerald-400';
                posColor = 'text-emerald-400 font-bold';
              } else if (pos <= 6) {
                zoneBorder = 'border-l-sky-400';
                posColor = 'text-sky-400 font-bold';
              } else if (pos <= 12) {
                zoneBorder = 'border-l-amber-400';
                posColor = 'text-amber-400';
              } else if (pos >= 17) {
                zoneBorder = 'border-l-rose-500';
                posColor = 'text-rose-400 font-bold';
              }

              return (
                <tr
                  key={row.time.espnId || row.time.nome || pos}
                  onClick={() => onSelectTeam(row.time.nome)}
                  className={`hover:bg-white/[0.06] transition-colors cursor-pointer group border-l-2 ${zoneBorder}`}
                >
                  {/* Position */}
                  <td className={`py-3.5 pl-6 pr-2 text-center font-mono tabular-nums ${posColor}`}>
                    {pos}
                  </td>

                  {/* Club info */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 p-1 flex items-center justify-center border border-white/10 shrink-0">
                        <img
                          src={row.time.escudo}
                          alt={row.time.nome}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                          }}
                        />
                      </div>
                      <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                        {row.time.nome}
                      </span>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums font-bold text-sm text-white">
                    {row.pontos}
                  </td>

                  {/* Matches played */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-300">
                    {row.jogos}
                  </td>

                  {/* Wins */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-300">
                    {row.vitorias}
                  </td>

                  {/* Draws */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-400">
                    {row.empates}
                  </td>

                  {/* Losses */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-400">
                    {row.derrotas}
                  </td>

                  {/* Goals For */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-400 hidden md:table-cell">
                    {row.golsPro}
                  </td>

                  {/* Goals Against */}
                  <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-400 hidden md:table-cell">
                    {row.golsContra}
                  </td>

                  {/* Goal Differential */}
                  <td className={`py-3.5 px-2 text-center font-mono tabular-nums font-medium ${
                    row.saldoGols > 0 ? 'text-emerald-400' : row.saldoGols < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {row.saldoGols > 0 ? `+${row.saldoGols}` : row.saldoGols}
                  </td>

                  {/* Aproveitamento */}
                  <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-400 hidden sm:table-cell">
                    {row.aproveitamento ? `${row.aproveitamento}%` : '—'}
                  </td>

                  {/* Row action */}
                  <td className="py-3.5 pr-6 pl-2 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors inline-block" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer footnote */}
      <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Critérios: 1. Pontos · 2. Vitórias · 3. Saldo de Gols · 4. Gols Pró</span>
        <span>Toque em qualquer clube para abrir o Clubhouse e elenco</span>
      </div>
    </div>
  );
};
