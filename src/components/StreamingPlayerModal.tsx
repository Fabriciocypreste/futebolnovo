import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Tv, Radio, Shield, Settings } from 'lucide-react';
import { Match } from '../types/football';
import { helperGetTeamBadge, helperGetTeamName } from '../services/futebolApi';
import visionosFootballHero from '../assets/images/visionos_football_hero_1791551732746.jpg';

interface StreamingPlayerModalProps {
  match: Match | null;
  onClose: () => void;
}

export const StreamingPlayerModal: React.FC<StreamingPlayerModalProps> = ({ match, onClose }) => {
  if (!match) return null;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeChannel, setActiveChannel] = useState<string>(
    match.transmissoes?.[0] || 'Transmissão Principal FHD'
  );
  const [resolution, setResolution] = useState<string>('1080p 60fps');

  const homeName = helperGetTeamName(match.mandante);
  const awayName = helperGetTeamName(match.visitante);
  const homeBadge = helperGetTeamBadge(match.mandante, match.escudoMandante);
  const awayBadge = helperGetTeamBadge(match.visitante, match.escudoVisitante);

  const availableChannels = match.transmissoes && match.transmissoes.length > 0
    ? match.transmissoes
    : ['Premiere HD 1', 'SporTV FHD', 'ESPN 4', 'CazéTV Live'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-3xl vision-glass-panel border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              SINAL AO VIVO
            </span>
            <span className="text-sm font-bold text-white truncate">
              {homeName} × {awayName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Canal: <span className="text-emerald-400 font-medium">{activeChannel}</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Fechar Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen Simulation */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          {/* Background simulated pitch stream frame */}
          <img
            src={visionosFootballHero}
            alt="Transmissão ao vivo"
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
          />

          {/* Stadium lighting overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Floating On-Screen Scoreboard (visionOS Glass Style) */}
          <div className="absolute top-5 left-6 rounded-xl vision-glass px-4 py-2 border border-white/20 shadow-xl flex items-center gap-3 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <img src={homeBadge} alt={homeName} className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-white uppercase">{homeName.slice(0, 3)}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 font-mono font-bold text-xs text-white">
              <span>{match.placarMandante ?? 0}</span>
              <span className="text-slate-500">:</span>
              <span>{match.placarVisitante ?? 0}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white uppercase">{awayName.slice(0, 3)}</span>
              <img src={awayBadge} alt={awayName} className="w-5 h-5 object-contain" />
            </div>

            <span className="text-[11px] font-mono font-semibold text-emerald-400 border-l border-white/15 pl-2">
              74'
            </span>
          </div>

          {/* Center Play/Pause button on hover */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all transform group-hover:scale-110 shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          {/* Bottom On-Screen Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between text-xs text-slate-300 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-emerald-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-emerald-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <span className="font-mono tabular-nums text-slate-400">
                Ao Vivo · Sinal Estável
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-emerald-300 border border-white/10">
                {resolution}
              </span>
              <Maximize2 className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>

        {/* TV Box Channel Selector & Quality Options */}
        <div className="p-6 bg-black/40 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Selecione a Fonte de Transmissão (Canais Disponíveis)
            </span>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    activeChannel === ch
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{ch}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setResolution(resolution === '4K UHD' ? '1080p 60fps' : '4K UHD')}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Qualidade: <span className="font-bold text-emerald-400">{resolution}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
