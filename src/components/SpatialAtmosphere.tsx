import React from 'react';
import stadiumPitchSunset from '../assets/images/stadium_pitch_sunset_1791553633665.jpg';

export const SpatialAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Stadium Pitch Sunset Image with intense Gaussian Blur & Rich Soccer Field Green Vibrancy */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 filter blur-[26px] saturate-[160%] brightness-[0.82] opacity-85"
        style={{
          backgroundImage: `url(${stadiumPitchSunset})`,
        }}
      />

      {/* Translucent Soccer Pitch Emerald Gradient Scrim for visionOS Glass Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02180e]/65 via-[#042817]/60 to-[#02110a]/85" />

      {/* Volumetric Warm Sunset & Stadium Floodlight Glow (Golden Horizon) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-amber-500/25 via-emerald-500/20 to-transparent rounded-full blur-[140px]" />

      {/* Lateral Soccer Pitch Turf Volumetric Emerald Radiance */}
      <div className="absolute top-1/4 -left-28 w-[750px] h-[750px] bg-emerald-500/25 rounded-full blur-[160px]" />
      <div className="absolute top-1/4 -right-28 w-[750px] h-[750px] bg-teal-400/20 rounded-full blur-[160px]" />
      <div className="absolute -bottom-24 left-1/4 w-[900px] h-[550px] bg-emerald-600/25 rounded-full blur-[160px]" />

      {/* Subtle Spatial Mesh Micro-Texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Deep Vignette on Borders for 10-foot Android TV Box Viewing */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#02110b]/30 to-[#010a06]/92" />
    </div>
  );
};
