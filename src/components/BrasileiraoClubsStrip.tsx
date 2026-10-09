import React, { useState } from 'react';
import { Shield, LayoutGrid, Rows } from 'lucide-react';
import { Team } from '../types/football';
import { getClubTheme } from '../services/teamThemes';

interface BrasileiraoClubsStripProps {
  teams?: Team[];
  selectedTeamSlug?: string | null;
  onSelectTeam: (teamSlug: string) => void;
}

// Canonical 20 Serie A clubs with verified high-res ESPN crests and official primary colors
export const CANONICAL_20_CLUBS = [
  { slug: 'flamengo', nome: 'Flamengo', apelido: 'CRF', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/819.png', cor: '#c4122d' },
  { slug: 'palmeiras', nome: 'Palmeiras', apelido: 'SEP', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2029.png', cor: '#006437' },
  { slug: 'corinthians', nome: 'Corinthians', apelido: 'SCCP', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/874.png', cor: '#ffffff' },
  { slug: 'sao-paulo', nome: 'São Paulo', apelido: 'SPFC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2026.png', cor: '#ba1419' },
  { slug: 'vasco', nome: 'Vasco da Gama', apelido: 'CRVG', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3454.png', cor: '#ffffff' },
  { slug: 'fluminense', nome: 'Fluminense', apelido: 'FFC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3445.png', cor: '#7a1027' },
  { slug: 'botafogo', nome: 'Botafogo', apelido: 'BFR', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6086.png', cor: '#ffffff' },
  { slug: 'santos', nome: 'Santos', apelido: 'SFC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2674.png', cor: '#38bdf8' },
  { slug: 'gremio', nome: 'Grêmio', apelido: 'FBPA', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png', cor: '#0d80bf' },
  { slug: 'internacional', nome: 'Internacional', apelido: 'SCI', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1936.png', cor: '#e50510' },
  { slug: 'atletico-mg', nome: 'Atlético-MG', apelido: 'CAM', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/7632.png', cor: '#f59e0b' },
  { slug: 'cruzeiro', nome: 'Cruzeiro', apelido: 'CEC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/2022.png', cor: '#005ca9' },
  { slug: 'bahia', nome: 'Bahia', apelido: 'ECB', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9967.png', cor: '#0070ba' },
  { slug: 'athletico-pr', nome: 'Athletico-PR', apelido: 'CAP', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3458.png', cor: '#c8102e' },
  { slug: 'chapecoense', nome: 'Chapecoense', apelido: 'ACF', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9318.png', cor: '#00843d' },
  { slug: 'coritiba', nome: 'Coritiba', apelido: 'CFC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3456.png', cor: '#00563f' },
  { slug: 'mirassol', nome: 'Mirassol', apelido: 'MFC', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/9169.png', cor: '#eab308' },
  { slug: 'bragantino', nome: 'RB Bragantino', apelido: 'RBB', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/6079.png', cor: '#d91d36' },
  { slug: 'remo', nome: 'Remo', apelido: 'REM', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/4936.png', cor: '#0f2942' },
  { slug: 'vitoria', nome: 'Vitória', apelido: 'ECV', escudo: 'https://a.espncdn.com/i/teamlogos/soccer/500/3457.png', cor: '#e20613' },
];

export const BrasileiraoClubsStrip: React.FC<BrasileiraoClubsStripProps> = ({
  teams,
  selectedTeamSlug,
  onSelectTeam,
}) => {
  // Merge loaded teams with canonical 20 list to ensure badges and slugs are 100% accurate
  const displayClubs = CANONICAL_20_CLUBS.map((canonical) => {
    const apiMatch = teams?.find(
      (t) =>
        t.slug === canonical.slug ||
        t.nome.toLowerCase() === canonical.nome.toLowerCase() ||
        t.slug?.replace(/-/g, '') === canonical.slug.replace(/-/g, '')
    );
    const theme = getClubTheme(canonical.slug);
    return {
      slug: canonical.slug,
      nome: apiMatch?.nome || canonical.nome,
      apelido: canonical.apelido,
      escudo: apiMatch?.escudo || canonical.escudo,
      cor: canonical.cor || theme.accent,
      theme,
    };
  });

  return (
    <div className="w-full relative py-2 select-none">
      {/* Header with Title and Info Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase font-display">
                Todos os 20 Clubes da Série A
              </h3>
              <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                20 Times
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Clique em qualquer escudo para abrir a página oficial com cores, história, elenco, classificação e jogos
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 self-start sm:self-auto bg-white/[0.04] border border-white/10 px-3 py-1 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Acesso direto aos 20 times</span>
        </div>
      </div>

      {/* FULL RESPONSIVE 20-CLUB GRID DISPLAY
          All 20 clubs appear neatly arranged without getting lost:
          - On large screens: 10 columns x 2 rows (fits all 20 beautifully)
          - On medium screens: 5 columns x 4 rows
          - On mobile: 4 columns x 5 rows
          Every single club is visible and clickable with its vibrant club colors!
      */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
        {displayClubs.map((club, idx) => {
          const isSelected = selectedTeamSlug === club.slug;

          return (
            <button
              key={club.slug}
              onClick={() => onSelectTeam(club.slug)}
              title={`Abrir página oficial do ${club.nome}`}
              style={{
                borderColor: isSelected ? club.theme.accent : undefined,
                boxShadow: isSelected
                  ? `0 0 20px ${club.theme.glow}`
                  : undefined,
              }}
              className={`group relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-white/15 border-2 scale-[1.04] z-10'
                  : 'bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Dynamic Club Color Ambient Aura on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none rounded-xl"
                style={{ backgroundColor: club.theme.primary }}
              />

              {/* Number index pill */}
              <div className="w-full flex items-center justify-between pointer-events-none mb-1">
                <span className="text-[9px] font-mono font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                  #{idx + 1}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: club.theme.accent }}
                />
              </div>

              {/* Club Crest with 3D drop shadow */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center my-0.5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                <img
                  src={club.escudo}
                  alt={`Escudo do ${club.nome}`}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';
                  }}
                  className="w-full h-full object-contain filter group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                />
              </div>

              {/* Club Nickname / Short Name */}
              <div className="w-full text-center mt-1 pointer-events-none">
                <p className="text-[11px] sm:text-xs font-black text-white truncate group-hover:text-white transition-colors">
                  {club.apelido}
                </p>
                <p className="text-[9px] text-slate-400 truncate hidden sm:block">
                  {club.nome}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
