import React, { useState } from 'react';
import { Play, Radio, MapPin, Calendar, Clock, Tv, Flame, Trophy, ChevronRight, Shield } from 'lucide-react';
import { Match } from '../types/football';
import { BroadcastBadge } from './BroadcastBadge';
import visionosStadiumAtmosphere from '../assets/images/visionos_stadium_atmosphere_1791551724185.jpg';

interface FlaFluHeroBannerProps {
  onWatchLive: (match: Match) => void;
  onOpenDetails: (match: Match) => void;
  onSelectTeam?: (teamSlug: string) => void;
}

export const FlaFluHeroBanner: React.FC<FlaFluHeroBannerProps> = ({
  onWatchLive,
  onOpenDetails,
  onSelectTeam,
}) => {
  // Construct the official Fla-Flu featured match object
  const flaFluMatch: Match = {
    id: 'fla-flu-classico-maracana-2026',
    dataISO: new Date().toISOString(),
    mandante: {
      espnId: '819',
      nome: 'Flamengo',
      escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/819.png',
    },
    visitante: {
      espnId: '3445',
      nome: 'Fluminense',
      escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3445.png',
    },
    placarMandante: null,
    placarVisitante: null,
    status: 'agendado',
    estadio: 'Estádio do Maracanã · Rio de Janeiro',
    campeonato: 'Brasileirão Série A · O Clássico das Multidões',
    rodada: 'Rodada 30',
    data: 'Hoje',
    horario: '21:00',
    transmissoes: ['PREMIERE CLUBES FHD', 'SporTV', 'TV Globo', 'CazéTV Live'],
  };

  return (
    <div className="relative rounded-3xl vision-3d-glass border border-white/25 shadow-[0_35px_90px_rgba(0,0,0,0.8)] overflow-hidden p-6 sm:p-8 lg:p-10 select-none group">
      {/* 3D Specular Highlight Line */}
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

      {/* Atmospheric Background Stadium Pitch Depth */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-[2px] transition-transform duration-700 group-hover:scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${visionosStadiumAtmosphere})`,
        }}
      />
      {/* Radial Gradient Vignette for VisionOS Glass Depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#03140d]/90 via-[#051f15]/75 to-[#04160e]/90 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Top Eyebrow Tag: Status & Competition */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/50 text-rose-300 text-xs font-black tracking-wide shadow-lg shadow-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              GRANDE CLÁSSICO EM DESTAQUE
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>O Clássico das Multidões · Fla-Flu</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-emerald-300 font-bold bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/15 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>HOJE · 21:00 (HORÁRIO DE BRASÍLIA)</span>
          </div>
        </div>

        {/* Center Fla-Flu Clash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 my-4">
          {/* FLAMENGO (Mandante) */}
          <div 
            className="flex items-center justify-start lg:justify-end gap-5 text-left lg:text-right cursor-pointer group/fla"
            onClick={() => onSelectTeam && onSelectTeam('flamengo')}
            title="Abrir página oficial do Flamengo"
          >
            <div>
              <div className="flex items-center lg:justify-end gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                <span>Mandante</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-mono text-slate-400 font-normal">G-4</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight drop-shadow-md group-hover/fla:text-rose-300 transition-colors">
                FLAMENGO
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Clube de Regatas do Flamengo
              </p>
            </div>

            {/* 3D Pedestal Crest */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl pedestal-3d p-4 flex items-center justify-center shrink-0 border border-rose-500/40 shadow-[0_15px_35px_rgba(225,29,72,0.3)] bg-gradient-to-br from-rose-950/40 to-black/60 group-hover/fla:scale-110 group-hover/fla:border-rose-400 transition-all duration-300">
              <img
                src="https://a.espncdn.com/i/teamlogos/soccer/500/819.png"
                alt="Flamengo"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
              />
            </div>
          </div>

          {/* CENTER VERSUS & STADIUM BADGE */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black font-display text-white tracking-widest">
                  VS
                </span>
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500/30 to-emerald-500/30 blur-lg pointer-events-none -z-10" />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estádio do Maracanã</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Rio de Janeiro · 72.000 Ingressos Esgotados
            </span>
          </div>

          {/* FLUMINENSE (Visitante) */}
          <div 
            className="flex items-center justify-start gap-5 text-left cursor-pointer group/flu"
            onClick={() => onSelectTeam && onSelectTeam('fluminense')}
            title="Abrir página oficial do Fluminense"
          >
            {/* 3D Pedestal Crest */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl pedestal-3d p-4 flex items-center justify-center shrink-0 border border-emerald-500/40 shadow-[0_15px_35px_rgba(16,185,129,0.3)] bg-gradient-to-br from-emerald-950/40 to-black/60 group-hover/flu:scale-110 group-hover/flu:border-emerald-400 transition-all duration-300">
              <img
                src="https://a.espncdn.com/i/teamlogos/soccer/500/3445.png"
                alt="Fluminense"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <span>Visitante</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-slate-400 font-normal">Tricolor</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight drop-shadow-md group-hover/flu:text-emerald-300 transition-colors">
                FLUMINENSE
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Fluminense Football Club
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: BROADCASTERS & INTERACTIVE ACTION BUTTONS */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 p-6 sm:p-8 rounded-b-3xl">
          {/* Emissoras que vão transmitir */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <BroadcastBadge channel="Premiere Clubes" size="lg" />
              <BroadcastBadge channel="SporTV" size="lg" />
              <BroadcastBadge channel="TV Globo" size="lg" />
              <BroadcastBadge channel="CazéTV" size="lg" />
            </div>
          </div>

          {/* Action CTAs (TV Box Remote Friendly) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onWatchLive(flaFluMatch)}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm tracking-wide shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Assistir Fla-Flu Ao Vivo</span>
            </button>

            <button
              onClick={() => onOpenDetails(flaFluMatch)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all hover:scale-105 active:scale-95"
            >
              <span>Ficha Técnica</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
