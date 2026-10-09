import React, { useState, useEffect } from 'react';
import { Radio, Tv, Trophy, Shield, Flame, Play, Clock, Sparkles } from 'lucide-react';

export type NavTab = 'jogos' | 'tv' | 'tabela' | 'clubes' | 'artilharia';

interface NavigationMenuButtonsProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenLiveStream: () => void;
  liveMatchCount?: number;
}

interface MenuItem {
  id: NavTab;
  label: string;
  shortLabel: string;
  badge?: string;
  shortcut: string;
  icon: React.ReactNode;
}

export const NavigationMenuButtons: React.FC<NavigationMenuButtonsProps> = ({
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

  const menuItems: MenuItem[] = [
    {
      id: 'jogos',
      label: 'Ao Vivo & Jogos',
      shortLabel: 'Jogos',
      badge: liveMatchCount > 0 ? `${liveMatchCount} AO VIVO` : 'Partidas',
      shortcut: '1',
      icon: (
        <Radio
          className={`w-4 h-4 ${
            liveMatchCount > 0 ? 'text-red-400 animate-pulse' : ''
          }`}
        />
      ),
    },
    {
      id: 'tv',
      label: 'Canais & TV',
      shortLabel: 'Canais TV',
      badge: 'Guia EPG',
      shortcut: '2',
      icon: <Tv className="w-4 h-4" />,
    },
    {
      id: 'tabela',
      label: 'Classificação',
      shortLabel: 'Tabela',
      badge: 'Série A',
      shortcut: '3',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'clubes',
      label: 'Clubes & Elencos',
      shortLabel: 'Clubes',
      badge: '20 Times',
      shortcut: '4',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'artilharia',
      label: 'Artilharia',
      shortLabel: 'Gols',
      badge: 'Top Goleadores',
      shortcut: '5',
      icon: <Flame className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full select-none pt-1">
      {/* Menu Header with subtle clock and navigation hint */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Menu de Navegação
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {clock && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/10">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="font-semibold tabular-nums">{clock}</span>
          </div>
        )}
      </div>

      {/* Grid of prominent interactive menu buttons directly under club logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-2xl shadow-xl shadow-black/30">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex flex-col items-center justify-center py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02] border border-emerald-300'
                  : 'bg-white/[0.06] hover:bg-white/[0.13] text-slate-200 hover:text-white border border-white/10 hover:border-white/25 active:scale-95'
              }`}
            >
              {/* Keyboard / Remote Shortcut Indicator */}
              <span
                className={`absolute top-1.5 right-2 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isActive
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
                title={`Atalho: Tecla ${item.shortcut}`}
              >
                [{item.shortcut}]
              </span>

              {/* Icon & Label */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-slate-950' : 'text-emerald-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </div>

              {/* Badge / Pill */}
              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : item.id === 'jogos' && liveMatchCount > 0
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/10 text-slate-300 group-hover:bg-white/15'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* 6th Button: Direct Live Stream Launcher Button */}
        <button
          onClick={onOpenLiveStream}
          className="group relative flex flex-col items-center justify-center py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-rose-600/90 to-red-600/90 hover:from-rose-500 hover:to-red-500 text-white font-black shadow-[0_0_20px_rgba(225,29,72,0.3)] border border-rose-400/50 hover:border-rose-300 transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
              Assistir Ao Vivo
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/30 text-rose-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Player FHD
          </span>
        </button>
      </div>
    </div>
  );
};
