import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[280px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white font-['Fredoka']">
          GAME PAUSED
        </h3>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 font-['Fredoka']"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>

          {/* Sound */}
          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
