import React, { useState, useRef } from 'react';
import { Calendar, MapPin, Tv, Play, Radio, ChevronRight, Sparkles } from 'lucide-react';
import { Match } from '../types/football';
import { helperGetTeamBadge, helperGetTeamName } from '../services/futebolApi';
import { BroadcastBadge } from './BroadcastBadge';

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  onWatchStream?: (match: Match) => void;
  onSelectTeam?: (teamName: string) => void;
  featured?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onSelect,
  onWatchStream,
  onSelectTeam,
  featured = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const homeName = helperGetTeamName(match.mandante);
  const awayName = helperGetTeamName(match.visitante);
  const homeBadge = helperGetTeamBadge(match.mandante, match.escudoMandante);
  const awayBadge = helperGetTeamBadge(match.visitante, match.escudoVisitante);

  const isLive = match.status === 'ao_vivo' || match.status === 'in_progress';
  const isFinished = match.status === 'encerrado' || match.status === 'finished';

  const formattedTime =
    match.horario ||
    (match.dataISO
      ? new Date(match.dataISO).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--');

  const formattedDate =
    match.data ||
    (match.dataISO
      ? new Date(match.dataISO).toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        })
      : '');

  // 3D Tilt calculation on pointer move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Subtle tilt: max ~7 degrees
    const rotateX = ((centerY - y) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const broadcasters = match.transmissoes && match.transmissoes.length > 0
    ? match.transmissoes
    : [];

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      onClick={() => onSelect(match)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(match);
      }}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
      }}
      className={`group relative rounded-3xl cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 vision-3d-glass overflow-hidden ${
        featured
          ? 'p-7 sm:p-8 border-white/30 shadow-[0_30px_70px_rgba(0,0,0,0.7)]'
          : 'p-6 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.55)]'
      }`}
    >
      {/* 3D Specular Light Edge on Top */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {/* Dynamic light sheen that follows mouse cursor in 3D */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.18), transparent 70%)`,
          }}
        />
      )}

      {/* TOP HEADER: Competition, Round & Kickoff Status */}
      <div className="flex items-center justify-between text-xs text-slate-300 mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-xs tracking-wide">
            {match.campeonato || 'Brasileirão Série A'}
          </span>
          {match.rodada && (
            <>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">Rodada {match.rodada}</span>
            </>
          )}
          {formattedDate && (
            <>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="capitalize text-emerald-300 font-medium">{formattedDate}</span>
            </>
          )}
        </div>

        {/* Live or Kickoff Time Indicator */}
        {isLive ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/50 text-rose-300 text-xs font-black shadow-lg shadow-rose-500/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            AO VIVO
          </span>
        ) : isFinished ? (
          <span className="text-xs text-slate-400 font-medium px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
            Encerrado
          </span>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/15 text-emerald-300 font-mono tabular-nums text-xs font-bold shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedTime}</span>
          </div>
        )}
      </div>

      {/* CENTER TEAMS SHOWCASE WITH 3D PEDESTALS */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 my-3 relative z-10">
        {/* Mandante (Home Team) */}
        <div 
          className="flex flex-col items-center text-center gap-2.5 cursor-pointer group/home"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectTeam) onSelectTeam(homeName);
          }}
          title={`Ver página oficial do ${homeName}`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl pedestal-3d p-3 flex items-center justify-center shrink-0 group-hover/home:scale-110 group-hover/home:border-emerald-400/50 transition-all">
            <img
              src={homeBadge}
              alt={homeName}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
              }}
            />
          </div>
          <span className="text-sm font-bold text-white group-hover/home:text-emerald-300 transition-colors line-clamp-1 max-w-[130px]">
            {homeName}
          </span>
        </div>

        {/* Versus or Live Score */}
        <div className="flex flex-col items-center justify-center px-2">
          {match.placarMandante !== null && match.placarMandante !== undefined ? (
            <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black font-mono tabular-nums text-white bg-black/50 px-4 py-1.5 rounded-2xl border border-white/20 shadow-xl shadow-black/60">
              <span className="text-emerald-300">{match.placarMandante}</span>
              <span className="text-slate-600">:</span>
              <span className="text-emerald-300">{match.placarVisitante ?? 0}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-xs text-slate-300 shadow-md">
                VS
              </div>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums mt-1.5 font-bold">
                {formattedTime}
              </span>
            </div>
          )}
        </div>

        {/* Visitante (Away Team) */}
        <div 
          className="flex flex-col items-center text-center gap-2.5 cursor-pointer group/away"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectTeam) onSelectTeam(awayName);
          }}
          title={`Ver página oficial do ${awayName}`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl pedestal-3d p-3 flex items-center justify-center shrink-0 group-hover/away:scale-110 group-hover/away:border-emerald-400/50 transition-all">
            <img
              src={awayBadge}
              alt={awayName}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
              }}
            />
          </div>
          <span className="text-sm font-bold text-white group-hover/away:text-emerald-300 transition-colors line-clamp-1 max-w-[130px]">
            {awayName}
          </span>
        </div>
      </div>

      {/* HIGHLIGHTED BROADCASTING NETWORKS (BADGES DIRETOS) */}
      <div className="mt-5 p-3 rounded-2xl bg-black/35 border border-white/15 backdrop-blur-xl relative z-10 shadow-inner">
        {broadcasters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {broadcasters.map((channel, i) => (
              <BroadcastBadge key={i} channel={channel} size="md" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-0.5">
            <Tv className="w-3.5 h-3.5 text-slate-500" />
            <span>Grade em confirmação no guia de canais</span>
          </div>
        )}
      </div>

      {/* FOOTER BAR: STADIUM + ASSISTIR AGORA ACTION */}
      <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div
          className="flex items-center gap-1.5 truncate max-w-[170px]"
          title={match.estadio || 'Estádio'}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate text-slate-300 font-medium">
            {match.estadio || 'Estádio a confirmar'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onWatchStream) onWatchStream(match);
              else onSelect(match);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Assistir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
