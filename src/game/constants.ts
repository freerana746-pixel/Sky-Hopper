import { BirdSkin } from './types';

export const GAME_WIDTH = 440;
export const GAME_HEIGHT = 680;
export const GROUND_HEIGHT = 100;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;

export const GRAVITY = 0.38;
export const FLAP_VELOCITY = -8.2;
export const MAX_FALL_SPEED = 9.8;
export const BIRD_RADIUS = 18;
export const BIRD_HITBOX_RADIUS = 14; // Fair collision radius

export const INITIAL_PIPE_SPEED = 2.4;
export const MAX_PIPE_SPEED = 3.6;
export const PIPE_WIDTH = 68;
export const INITIAL_PIPE_GAP = 156;
export const MIN_PIPE_GAP = 132;
export const PIPE_SPAWN_INTERVAL = 175; // frames between pipes

export const BIRD_SKINS: BirdSkin[] = [
  {
    id: 'yellow',
    name: 'Sunshine',
    primaryColor: '#FBBF24', // Amber/Yellow
    secondaryColor: '#D97706',
    bellyColor: '#FEF3C7',
    beakColor: '#F97316',
    eyeColor: '#1F2937',
    wingColor: '#F59E0B',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  {
    id: 'blue',
    name: 'Sky Blue',
    primaryColor: '#38BDF8',
    secondaryColor: '#0284C7',
    bellyColor: '#E0F2FE',
    beakColor: '#F97316',
    eyeColor: '#1F2937',
    wingColor: '#0EA5E9',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
  {
    id: 'coral',
    name: 'Robin Coral',
    primaryColor: '#FB7185',
    secondaryColor: '#E11D48',
    bellyColor: '#FFE4E6',
    beakColor: '#F59E0B',
    eyeColor: '#1F2937',
    wingColor: '#F43F5E',
    glowColor: 'rgba(251, 113, 133, 0.4)',
  },
  {
    id: 'mint',
    name: 'Kiwi Mint',
    primaryColor: '#34D399',
    secondaryColor: '#059669',
    bellyColor: '#ECFDF5',
    beakColor: '#EA580C',
    eyeColor: '#1F2937',
    wingColor: '#10B981',
    glowColor: 'rgba(52, 211, 153, 0.4)',
  },
];
