import React from 'react';
import { Home, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from 'lucide-react';
import { MedalTier } from '../game/types';
import { MedalBadge } from './MedalBadge';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  medalTier: MedalTier;
  isMuted: boolean;
  onRestart: () => void;
  onHome: () => void;
  onToggleMute: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewBest,
  medalTier,
  isMuted,
  onRestart,
  onHome,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-xs select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Game Over Title Banner */}
      <div className="mb-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-rose-500 font-['Fredoka'] tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] [text-shadow:_0_3px_0_#9f1239,_0_5px_0_#881337,_0_6px_10px_rgba(0,0,0,0.6)]">
          GAME OVER
        </h2>
      </div>

      {/* Main Scoreboard Card */}
      <div className="w-full max-w-[320px] bg-amber-50 dark:bg-slate-900 border-4 border-amber-400 dark:border-amber-500 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
        {/* New Record Banner if applicable */}
        {isNewBest && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 uppercase tracking-wider animate-bounce-subtle">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>New Best Score!</span>
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
        )}

        {/* Score & Medal Container */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Medal Box */}
          <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[90px] shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Medal
            </span>
            <MedalBadge tier={medalTier} size={42} />
          </div>

          {/* Scores column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Score
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-['Fredoka']">
                {score}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                <span>Best</span>
              </div>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Fredoka']">
                {bestScore}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Play Again Button */}
        <button
          onClick={onRestart}
          className="group w-full py-3 px-4 bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 active:from-emerald-500 active:to-emerald-600 text-slate-900 font-black text-lg rounded-2xl shadow-[0_5px_0_#065f46,_0_8px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_3px_0_#065f46] hover:translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#065f46] transition-all flex items-center justify-center gap-2 cursor-pointer font-['Fredoka']"
        >
          <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
          <span>PLAY AGAIN</span>
        </button>

        {/* Secondary Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Helpful keyboard hint */}
      <p className="mt-4 text-white/80 text-xs font-medium">
        Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded-md font-bold">SPACE</kbd> to restart immediately
      </p>
    </div>
  );
};
