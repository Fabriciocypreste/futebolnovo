import React from 'react';
import { Tv, Sparkles, Radio } from 'lucide-react';

interface BroadcastBadgeProps {
  channel: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BroadcastBadge: React.FC<BroadcastBadgeProps> = ({ channel, size = 'md' }) => {
  const chLower = channel.toLowerCase();

  // Determine styling based on the television broadcaster
  let badgeStyle = 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 shadow-emerald-500/10';
  let dotColor = 'bg-emerald-400';
  let label = channel;

  if (chLower.includes('premiere')) {
    badgeStyle = 'bg-gradient-to-r from-amber-500/25 to-yellow-500/15 border-amber-400/50 text-amber-200 shadow-amber-500/20';
    dotColor = 'bg-amber-400';
    label = 'PREMIERE';
  } else if (chLower.includes('sportv') || chLower.includes('sp2') || chLower.includes('sp3')) {
    badgeStyle = 'bg-gradient-to-r from-sky-500/25 to-blue-600/15 border-sky-400/50 text-sky-200 shadow-sky-500/20';
    dotColor = 'bg-sky-400';
    if (chLower.includes('sportv 2') || chLower.includes('sp2')) label = 'SPORTV 2';
    else if (chLower.includes('sportv 3') || chLower.includes('sp3')) label = 'SPORTV 3';
    else label = 'SPORTV';
  } else if (chLower.includes('espn')) {
    badgeStyle = 'bg-gradient-to-r from-rose-600/25 to-red-500/15 border-rose-500/50 text-rose-200 shadow-rose-500/20';
    dotColor = 'bg-rose-400';
    if (chLower.includes('espn 2') || chLower.includes('es2')) label = 'ESPN 2';
    else if (chLower.includes('espn 3') || chLower.includes('es3')) label = 'ESPN 3';
    else if (chLower.includes('espn 4') || chLower.includes('es4')) label = 'ESPN 4';
    else label = 'ESPN';
  } else if (chLower.includes('globo')) {
    badgeStyle = 'bg-gradient-to-r from-slate-200/20 to-white/10 border-white/40 text-white shadow-white/15';
    dotColor = 'bg-white';
    label = 'TV GLOBO';
  } else if (chLower.includes('cazé') || chLower.includes('caze')) {
    badgeStyle = 'bg-gradient-to-r from-emerald-500/25 to-yellow-400/15 border-emerald-400/50 text-emerald-300 shadow-emerald-500/20';
    dotColor = 'bg-yellow-400';
    label = 'CAZÉTV';
  } else if (chLower.includes('bandsports') || chLower.includes('bsp')) {
    badgeStyle = 'bg-gradient-to-r from-teal-500/25 to-emerald-500/15 border-teal-400/50 text-teal-200 shadow-teal-500/20';
    dotColor = 'bg-teal-400';
    label = 'BANDSPORTS';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-bold gap-2'
      : 'px-2.5 py-1 text-[11px] font-semibold gap-1.5';

  return (
    <div
      className={`inline-flex items-center rounded-xl border backdrop-blur-md shadow-md ${sizeClasses} ${badgeStyle} tracking-wide select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse shrink-0`} />
      <Tv className="w-3 h-3 shrink-0 opacity-80" />
      <span className="truncate uppercase font-bold">{label}</span>
    </div>
  );
};
