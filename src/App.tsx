/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { MedalBadge } from './components/MedalBadge';
import { PauseModal } from './components/PauseModal';
import { StartScreen } from './components/StartScreen';
import { GAME_HEIGHT, GAME_WIDTH } from './game/constants';
import { MedalTier } from './game/types';
import { useGameEngine } from './game/useGameEngine';
import { Trophy, HelpCircle, X } from 'lucide-react';

export default function App() {
  const {
    canvasRef,
    gameState,
    score,
    bestScore,
    isNewBest,
    isMuted,
    isPaused,
    selectedSkin,
    medalTier,
    flap,
    restartGame,
    returnToStart,
    togglePause,
    toggleAudio,
    changeSkin,
  } = useGameEngine();

  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Handle direct pointer interaction with the game arena
  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicking a functional UI button, let the button handle it
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    e.preventDefault();
    flap();
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden p-0 sm:p-4 select-none">
      {/* Background ambient stylized lighting glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-800 via-slate-950 to-slate-950" />

      {/* Main Arcade Cabinet / Handheld Frame */}
      <div className="relative z-10 w-full max-w-[440px] h-full sm:h-auto sm:max-h-[94vh] flex flex-col items-center justify-center">
        {/* Game Canvas Container */}
        <div
          onPointerDown={handlePointerDown}
          className="relative w-full aspect-[440/680] max-h-full sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-0 sm:border-4 border-slate-800/80 bg-sky-300 touch-none cursor-pointer"
          style={{ maxWidth: `${GAME_WIDTH}px` }}
        >
          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Start Screen Overlay */}
          {gameState === 'START' && (
            <StartScreen
              bestScore={bestScore}
              selectedSkin={selectedSkin}
              isMuted={isMuted}
              onPlay={flap}
              onSelectSkin={changeSkin}
              onToggleMute={toggleAudio}
            />
          )}

          {/* In-Game HUD Overlay */}
          {gameState === 'PLAYING' && (
            <HUD
              score={score}
              bestScore={bestScore}
              isMuted={isMuted}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onToggleMute={toggleAudio}
            />
          )}

          {/* Game Over Modal */}
          {gameState === 'GAME_OVER' && (
            <GameOverModal
              score={score}
              bestScore={bestScore}
              isNewBest={isNewBest}
              medalTier={medalTier}
              isMuted={isMuted}
              onRestart={restartGame}
              onHome={returnToStart}
              onToggleMute={toggleAudio}
            />
          )}

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              onResume={togglePause}
              onRestart={restartGame}
              isMuted={isMuted}
              onToggleMute={toggleAudio}
            />
          )}
        </div>

        {/* Desktop Helper Bar below canvas */}
        <div className="hidden sm:flex items-center justify-between w-full px-3 py-2.5 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-semibold text-[10px]">SPACE</kbd>
              <span>Flap</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-semibold text-[10px]">P</kbd>
              <span>Pause</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-semibold text-[10px]">M</kbd>
              <span>Mute</span>
            </span>
          </div>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Medals & Rules</span>
          </button>
        </div>
      </div>

      {/* Rules & Medals Guide Dialog */}
      {showHowToPlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200 relative">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white font-['Fredoka'] mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Sky Hopper Guide</span>
            </h3>

            {/* Rules */}
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed mb-5">
              <p>• <strong>Flap:</strong> Click, tap the screen, or hit <kbd className="px-1 bg-slate-800 rounded text-white">SPACE</kbd> to jump upward.</p>
              <p>• <strong>Dodge:</strong> Avoid hitting green pipes, the sky ceiling, or the grassy ground.</p>
              <p>• <strong>Score:</strong> Earn 1 point for every pipe gate cleared. Speed increases gradually!</p>
            </div>

            {/* Medal Tiers */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Medal Milestones
            </h4>
            <div className="grid grid-cols-4 gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 text-center">
              {(['bronze', 'silver', 'gold', 'platinum'] as MedalTier[]).map((tier) => (
                <div key={tier} className="flex flex-col items-center">
                  <MedalBadge tier={tier} size={32} />
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    {tier === 'bronze' && '5+ pts'}
                    {tier === 'silver' && '15+ pts'}
                    {tier === 'gold' && '30+ pts'}
                    {tier === 'platinum' && '50+ pts'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full mt-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-transform active:scale-95 cursor-pointer font-['Fredoka']"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
