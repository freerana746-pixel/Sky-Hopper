import React from 'react';
import { Play, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { BirdSkin } from '../game/types';
import { BIRD_SKINS } from '../game/constants';

interface StartScreenProps {
  bestScore: number;
  selectedSkin: BirdSkin;
  isMuted: boolean;
  onPlay: () => void;
  onSelectSkin: (skin: BirdSkin) => void;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  bestScore,
  selectedSkin,
  isMuted,
  onPlay,
  onSelectSkin,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 pointer-events-auto select-none bg-black/15 backdrop-blur-[1px]">
      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-900 dark:text-amber-200 font-semibold text-xs shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>BEST {bestScore}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200 transition-transform active:scale-95 cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
        </button>
      </div>

      {/* Main Center Title & Actions */}
      <div className="flex flex-col items-center text-center mt-4">
        {/* Logo Title */}
        <div className="relative mb-2">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] [text-shadow:_0_3px_0_#0f766e,_0_6px_0_#115e59,_0_8px_12px_rgba(0,0,0,0.5)] font-['Fredoka']">
            SKY HOPPER
          </h1>
          <div className="absolute -top-3 -right-3 text-amber-300 animate-pulse">
            <Sparkles className="w-6 h-6 fill-amber-300" />
          </div>
        </div>

        <p className="text-sm font-semibold text-white/90 drop-shadow-md tracking-wide mb-6">
          Fly high, dodge pipes & set high scores!
        </p>

        {/* Character Skin Selector */}
        <div className="flex flex-col items-center gap-2 mb-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/40">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Choose Bird Skin
          </span>
          <div className="flex items-center gap-2.5">
            {BIRD_SKINS.map((skin) => {
              const isSelected = selectedSkin.id === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => onSelectSkin(skin)}
                  className={`relative p-1 rounded-full transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'scale-115 ring-3 ring-amber-400 ring-offset-2 shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={skin.name}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center border-2 border-white/60"
                    style={{ backgroundColor: skin.primaryColor }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: skin.beakColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Start / Play Button */}
        <button
          onClick={onPlay}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 active:to-amber-600 text-slate-900 font-black text-xl rounded-2xl shadow-[0_6px_0_#b45309,_0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_#b45309,_0_6px_15px_rgba(0,0,0,0.25)] hover:translate-y-0.5 active:translate-y-1.5 active:shadow-[0_1px_0_#b45309] transition-all cursor-pointer font-['Fredoka']"
        >
          <Play className="w-6 h-6 fill-slate-900 group-hover:scale-110 transition-transform" />
          <span>PLAY NOW</span>
        </button>
      </div>

      {/* Bottom Controls Guide */}
      <div className="w-full flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/40 backdrop-blur-sm text-white/95 text-xs font-medium border border-white/20">
          <span>Tap, Click, or press</span>
          <kbd className="px-1.5 py-0.5 text-[11px] font-bold bg-white text-slate-900 rounded-md shadow-xs">
            SPACE
          </kbd>
          <span>to flap</span>
        </div>
      </div>
    </div>
  );
};
