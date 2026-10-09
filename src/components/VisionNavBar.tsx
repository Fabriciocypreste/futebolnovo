import React, { useState, useEffect } from 'react';
import { Tv, Play, Radio, Search } from 'lucide-react';

export type NavTab = 'jogos' | 'tv' | 'tabela' | 'clubes' | 'artilharia';

interface VisionNavBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenLiveStream: () => void;
  liveMatchCount?: number;
}

export const VisionNavBar: React.FC<VisionNavBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLiveStream,
  liveMatchCount = 0,
}) => {
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between gap-8 px-8 py-5 border-b border-white/10 bg-white/[0.04] backdrop-blur-2xl select-none">
      {/* Zone 1: Streaming Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('jogos');
          }}
          className="text-xl font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
          </div>
          <span className="font-display tracking-tight text-lg sm:text-xl font-extrabold text-white">
            FUTEBOL<span className="text-emerald-400">PLAY</span>
          </span>
        </a>
      </div>

      {/* Zone 2: 5 Concise Nav Links (TV Remote D-Pad friendly) */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('jogos')}
          className={`transition-all whitespace-nowrap shrink-0 pb-1 relative focus:outline-none focus-visible:text-emerald-400 focus-visible:scale-105 ${
            activeTab === 'jogos'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ao Vivo & Jogos
          {activeTab === 'jogos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tv')}
          className={`transition-all whitespace-nowrap shrink-0 pb-1 relative focus:outline-none focus-visible:text-emerald-400 focus-visible:scale-105 ${
            activeTab === 'tv'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Canais & TV
          {activeTab === 'tv' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tabela')}
          className={`transition-all whitespace-nowrap shrink-0 pb-1 relative focus:outline-none focus-visible:text-emerald-400 focus-visible:scale-105 ${
            activeTab === 'tabela'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Classificação
          {activeTab === 'tabela' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('clubes')}
          className={`transition-all whitespace-nowrap shrink-0 pb-1 relative focus:outline-none focus-visible:text-emerald-400 focus-visible:scale-105 ${
            activeTab === 'clubes'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Clubes & Elencos
          {activeTab === 'clubes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('artilharia')}
          className={`transition-all whitespace-nowrap shrink-0 pb-1 relative focus:outline-none focus-visible:text-emerald-400 focus-visible:scale-105 ${
            activeTab === 'artilharia'
              ? 'text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Artilharia
          {activeTab === 'artilharia' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
          )}
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action (Watch Live Stream / Player Launcher + Clock) */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline font-mono tabular-nums text-xs text-slate-400 font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          {clock || '12:00'}
        </span>

        <button
          onClick={onOpenLiveStream}
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Assistir Agora</span>
          {liveMatchCount > 0 && (
            <span className="ml-1 text-[10px] font-mono font-bold bg-slate-950/25 text-slate-950 px-1.5 py-0.5 rounded-full">
              {liveMatchCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
