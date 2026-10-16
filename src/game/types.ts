/**
 * Types and interfaces for Sky Hopper
 */

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export interface BirdSkin {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  beakColor: string;
  eyeColor: string;
  wingColor: string;
  glowColor: string;
}

export interface Bird {
  x: number;
  y: number;
  vy: number;
  radius: number;
  rotation: number;
  targetRotation: number;
  wingAngle: number;
  wingSpeed: number;
  isFlapping: boolean;
  blinkTimer: number;
  isBlinking: boolean;
  skin: BirdSkin;
}

export interface PipePair {
  id: number;
  x: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  width: number;
  passed: boolean;
  colorVar: number;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
  puffs: { dx: number; dy: number; r: number }[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'feather' | 'sparkle' | 'puff' | 'star';
  rotation: number;
  vRot: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  alpha: number;
  scale: number;
  vy: number;
}

export type MedalTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface GameStats {
  bestScore: number;
  totalGames: number;
  totalPoints: number;
  unlockedMedals: Record<MedalTier, boolean>;
}
