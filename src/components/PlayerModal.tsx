import React from 'react';
import { X, Shield, Award, Activity, ExternalLink, User } from 'lucide-react';
import { Player } from '../types/football';

interface PlayerModalProps {
  player: Player | null;
  clubName?: string;
  clubBadge?: string;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  clubName,
  clubBadge,
  onClose,
}) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl vision-glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Club context */}
        {clubName && (
          <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
            {clubBadge && (
              <img src={clubBadge} alt={clubName} className="w-4 h-4 object-contain" />
            )}
            <span>{clubName}</span>
            <span aria-hidden="true">·</span>
            <span>Perfil Oficial do Atleta</span>
          </div>
        )}

        {/* Player Spotlight Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/10">
          {/* Player Portrait */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-1 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
            {player.foto ? (
              <img
                src={player.foto}
                alt={player.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <User className="w-16 h-16 text-slate-500" />
            )}

            {/* Jersey Number Badge */}
            {player.numero !== undefined && player.numero !== null && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-emerald-500 text-black font-mono font-black text-xs shadow-md">
                #{player.numero}
              </span>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white leading-tight">
              {player.nome}
            </h3>
            {player.nomeCompleto && player.nomeCompleto !== player.nome && (
              <p className="text-xs text-slate-400 mt-0.5">{player.nomeCompleto}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 font-medium">
                {player.posicao || 'Jogador'}
              </span>
              {player.nacionalidade && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5">
                  {player.bandeira && (
                    <img
                      src={player.bandeira}
                      alt={player.nacionalidade}
                      className="w-3.5 h-2.5 object-cover rounded-xs"
                    />
                  )}
                  <span>{player.nacionalidade}</span>
                </span>
              )}
            </div>

            {/* Physical Attributes */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Idade</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {player.idade ? `${player.idade} anos` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Altura</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {player.alturaCm ? `${player.alturaCm} cm` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Peso</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {player.pesoKg ? `${Math.round(player.pesoKg)} kg` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Season Performance Stats */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Estatísticas na Temporada
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Partidas</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
                {player.estatisticas?.jogos ?? player.estatisticas?.appearances ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Gols</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
                {player.estatisticas?.gols ?? player.estatisticas?.totalGoals ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Assistências</span>
              <span className="text-xl font-bold font-mono tabular-nums text-sky-400 mt-1 block">
                {player.estatisticas?.assistencias ?? player.estatisticas?.goalAssists ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">
                {player.posicao === 'Goleiro' ? 'Defesas' : 'Cartões'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1 block">
                {player.posicao === 'Goleiro'
                  ? player.estatisticas?.defesas ?? player.estatisticas?.saves ?? 0
                  : player.estatisticas?.cartoesAmarelos ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
