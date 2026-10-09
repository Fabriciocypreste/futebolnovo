import React from 'react';
import { X, MapPin, Calendar, Clock, Tv, ExternalLink, Shield, Radio, Play } from 'lucide-react';
import { Match } from '../types/football';
import { helperGetTeamBadge, helperGetTeamName } from '../services/futebolApi';
import { BroadcastBadge } from './BroadcastBadge';

interface MatchModalProps {
  match: Match | null;
  onClose: () => void;
  onSelectTeam?: (teamName: string) => void;
  onWatchStream?: (match: Match) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, onClose, onSelectTeam, onWatchStream }) => {
  if (!match) return null;

  const homeName = helperGetTeamName(match.mandante);
  const awayName = helperGetTeamName(match.visitante);
  const homeBadge = helperGetTeamBadge(match.mandante, match.escudoMandante);
  const awayBadge = helperGetTeamBadge(match.visitante, match.escudoVisitante);

  const formattedDate = match.data || (match.dataISO ? new Date(match.dataISO).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'Data a confirmar');
  const formattedTime = match.horario || (match.dataISO ? new Date(match.dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário a definir');

  const broadcasters = match.transmissoes && match.transmissoes.length > 0 ? match.transmissoes : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-3xl vision-glass-panel p-6 sm:p-8 border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular line */}
        <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Header with Title & Close button */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-extrabold">
              {(match.campeonato || 'Brasileirão Série A').toUpperCase()}
            </span>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              {homeName} vs {awayName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Teams Showcase */}
        <div className="my-6 py-6 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-4">
          {/* Home Team */}
          <div 
            className="flex flex-col items-center text-center cursor-pointer group"
            onClick={() => onSelectTeam && onSelectTeam(homeName)}
          >
            <div className="w-20 h-20 rounded-2xl pedestal-3d p-3 flex items-center justify-center border border-white/15 group-hover:border-emerald-400/50 transition-all shadow-xl group-hover:scale-105">
              <img
                src={homeBadge}
                alt={homeName}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>
            <span className="mt-3 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {homeName}
            </span>
            <span className="text-xs text-slate-400">Mandante</span>
          </div>

          {/* Versus / Score */}
          <div className="flex flex-col items-center">
            {match.placarMandante !== null && match.placarMandante !== undefined ? (
              <div className="text-3xl font-extrabold font-mono tabular-nums text-white bg-black/50 px-5 py-2 rounded-2xl border border-white/20">
                {match.placarMandante} : {match.placarVisitante ?? 0}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">VS</span>
                <span className="text-xs font-mono tabular-nums text-emerald-400 mt-1 font-bold">
                  {formattedTime}
                </span>
              </div>
            )}
            <span className="text-[11px] text-slate-400 mt-2 font-medium">
              {match.status === 'ao_vivo' ? 'Tempo Real' : match.status === 'encerrado' ? 'Partida Finalizada' : 'Confirmado'}
            </span>
          </div>

          {/* Away Team */}
          <div 
            className="flex flex-col items-center text-center cursor-pointer group"
            onClick={() => onSelectTeam && onSelectTeam(awayName)}
          >
            <div className="w-20 h-20 rounded-2xl pedestal-3d p-3 flex items-center justify-center border border-white/15 group-hover:border-emerald-400/50 transition-all shadow-xl group-hover:scale-105">
              <img
                src={awayBadge}
                alt={awayName}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>
            <span className="mt-3 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {awayName}
            </span>
            <span className="text-xs text-slate-400">Visitante</span>
          </div>
        </div>

        {/* Emissoras que vão transmitir (Broadcasting Network Section) */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/15 mb-5 shadow-inner">
          {broadcasters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {broadcasters.map((can, idx) => (
                <BroadcastBadge key={idx} channel={can} size="lg" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Grade de transmissão em atualização pelo guia esportivo de canais.
            </p>
          )}
        </div>

        {/* Match Logistics info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Data & Horário</span>
              <p className="text-sm font-semibold text-white capitalize">{formattedDate}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Às {formattedTime} (Horário de Brasília)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-400 block">Local da Partida</span>
              <p className="text-sm font-semibold text-white">{match.estadio || 'Estádio a confirmar'}</p>
              <p className="text-xs text-slate-400 mt-0.5">Gramado Oficial · Padrão FIFA</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onWatchStream && (
            <button
              onClick={() => {
                onClose();
                onWatchStream(match);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Assistir Transmissão Ao Vivo</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

