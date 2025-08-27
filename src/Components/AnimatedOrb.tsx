import React from 'react';
import { AuraState } from '../types';

interface AnimatedOrbProps {
  auraState: AuraState;
  isListening: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  onRequestPermission: () => void;
}

// Color mapping for orb states
const orbColors: Record<string, string> = {
  idle: 'from-blue-400 via-purple-400 to-blue-500',
  listening: 'from-blue-400 via-purple-400 to-blue-500',
  active: 'from-yellow-400 via-orange-500 to-red-500',
  alert: 'from-red-500 via-orange-500 to-yellow-400',
  sos_active: 'from-green-400 via-green-500 to-green-600',
};

const orbShadow: Record<string, string> = {
  idle: 'shadow-blue-400/40',
  listening: 'shadow-blue-400/40',
  active: 'shadow-orange-400/60',
  alert: 'shadow-red-500/70',
  sos_active: 'shadow-green-500/60',
};

export const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  auraState,
  isListening,
  permissionStatus,
  onRequestPermission
}) => {
  // Determine orb color and animation based on state
  let colorClass = orbColors['idle'];
  let shadowClass = orbShadow['idle'];
  let pulseClass = 'animate-pulse-slow';

  if (permissionStatus !== 'granted') {
    colorClass = 'from-gray-300 via-gray-400 to-gray-500';
    shadowClass = 'shadow-gray-400/40';
    pulseClass = '';
  } else if (auraState === AuraState.ALERT) {
    colorClass = orbColors['alert'];
    shadowClass = orbShadow['alert'];
    pulseClass = 'animate-pulse-fast ripple';
  } else if (auraState === AuraState.SOS_ACTIVE) {
    colorClass = orbColors['sos_active'];
    shadowClass = orbShadow['sos_active'];
    pulseClass = 'animate-flash-green';
  } else if (auraState === AuraState.ACTIVE) {
    colorClass = orbColors['active'];
    shadowClass = orbShadow['active'];
    pulseClass = 'animate-pulse-fast';
  } else if (isListening) {
    colorClass = orbColors['listening'];
    shadowClass = orbShadow['listening'];
    pulseClass = 'animate-pulse-slow';
  }

  return (
    <div className={`relative flex items-center justify-center`} style={{ minHeight: 220 }}>
      {/* Orb SVG with animated gradient */}
      <div
        className={`w-48 h-48 rounded-full bg-gradient-to-tr ${colorClass} ${shadowClass} ${pulseClass} transition-all duration-500`}
        style={{ filter: 'blur(0.5px)', boxShadow: '0 0 60px 10px rgba(0,0,0,0.15)' }}
      >
        {/* Optionally, add SVG mesh or dots for more abstract look */}
        <svg width="100%" height="100%" viewBox="0 0 192 192" className="absolute top-0 left-0 z-10 pointer-events-none">
          <defs>
            <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="96" cy="96" r="92" fill="url(#orbGradient)" />
          {/* Dots mesh effect */}
          <g opacity="0.18">
            {Array.from({ length: 24 }).map((_, i) => (
              <circle
                key={i}
                cx={96 + 70 * Math.cos((i / 24) * 2 * Math.PI)}
                cy={96 + 70 * Math.sin((i / 24) * 2 * Math.PI)}
                r={2.5}
                fill="#fff"
              />
            ))}
          </g>
        </svg>
      </div>
      {/* Ripple effect for alert state */}
      {auraState === AuraState.ALERT && (
        <span className="absolute w-64 h-64 rounded-full border-4 border-red-400 animate-ripple z-0"></span>
      )}
      {/* Checkmark for SOS confirmation */}
      {auraState === AuraState.SOS_ACTIVE && (
        <svg className="absolute w-24 h-24 z-20" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="none" stroke="#22c55e" strokeWidth="4" />
          <polyline points="14,26 22,34 36,18" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

// Animations (add to your global CSS or Tailwind config)
// .animate-pulse-slow { animation: pulse 2.5s cubic-bezier(.4,0,.6,1) infinite; }
// .animate-pulse-fast { animation: pulse 0.7s cubic-bezier(.4,0,.6,1) infinite; }
// .animate-flash-green { animation: flash-green 1.2s cubic-bezier(.4,0,.6,1) 2; }
// .animate-ripple { animation: ripple 1.2s cubic-bezier(.4,0,.6,1) 2; }
// @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.07);} }
// @keyframes flash-green { 0%,100%{box-shadow:0 0 0 0 #22c55e44;} 50%{box-shadow:0 0 40px 10px #22c55e88;} }
// @keyframes ripple { 0%{transform:scale(1);opacity:0.7;} 100%{transform:scale(1.4);opacity:0;} }