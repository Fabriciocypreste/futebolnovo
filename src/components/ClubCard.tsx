import React from 'react';
import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { Team } from '../types/football';

interface ClubCardProps {
  team: Team;
  onSelect: (team: Team) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ team, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(team)}
      className="group relative rounded-2xl vision-card p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:border-emerald-400/30"
    >
      <div>
        {/* Top bar with state & foundation */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>{team.estado ? `${team.cidade || ''} · ${team.estado}` : team.cidade || 'Brasil'}</span>
          {team.fundacao && (
            <span className="font-mono tabular-nums text-slate-500">Fundado em {team.fundacao}</span>
          )}
        </div>

        {/* Center Badge & Name */}
        <div className="flex items-center gap-4 my-2">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] p-2.5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all shadow-md shrink-0 group-hover:scale-105">
            <img
              src={team.escudo}
              alt={team.nome}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain filter drop-shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
              }}
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {team.nome}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {team.nomeCompleto || team.nome}
            </p>
          </div>
        </div>

        {/* Stadium details */}
        {team.estadio && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{team.estadio}</span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
        <span className="font-medium text-[11px]">Ver Clubhouse & Elenco</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
