import React from 'react';
import { Pause, Play, Trophy, Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
  score: number;
  bestScore: number;
  isMuted: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  isMuted,
  isPaused,
  onTogglePause,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between z-10 select-none">
      {/* Top Bar with Best Score and Controls */}
      <div className="flex items-center justify-between">
        {/* Best Score pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/35 backdrop-blur-sm rounded-full text-white text-xs font-semibold border border-white/20 shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="tracking-wide">BEST {bestScore}</span>
        </div>

        {/* Action buttons (pointer-events-auto) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onTogglePause}
            className="p-2 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title={isPaused ? 'Resume' : 'Pause'}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Primary Score Counter (Centered Arcade Text) */}
      <div className="flex justify-center -mt-16">
        <span className="text-7xl font-black text-white font-['Fredoka'] tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] [text-shadow:_0_3px_0_#0f172a,_0_6px_0_#0f172a,_0_7px_10px_rgba(0,0,0,0.5)]">
          {score}
        </span>
      </div>

      {/* Bottom spacer */}
      <div />
    </div>
  );
};
