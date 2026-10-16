import { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from './audio';
import {
  BIRD_HITBOX_RADIUS,
  BIRD_RADIUS,
  BIRD_SKINS,
  FLAP_VELOCITY,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  GROUND_Y,
  INITIAL_PIPE_GAP,
  INITIAL_PIPE_SPEED,
  MAX_FALL_SPEED,
  MAX_PIPE_SPEED,
  MIN_PIPE_GAP,
  PIPE_WIDTH,
} from './constants';
import { GameRenderer } from './renderer';
import {
  Bird,
  BirdSkin,
  Cloud,
  GameState,
  MedalTier,
  Particle,
  PipePair,
  ScorePopup,
} from './types';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level React states for UI overlays
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('skyhopper_best_score');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [selectedSkin, setSelectedSkin] = useState<BirdSkin>(BIRD_SKINS[0]);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // References for the 60fps game loop
  const stateRef = useRef<GameState>('START');
  const scoreRef = useRef<number>(0);
  const bestScoreRef = useRef<number>(bestScore);
  const isPausedRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(0);
  const animFrameId = useRef<number>(0);
  const canRestartRef = useRef<boolean>(true);

  // Screen shake trauma
  const traumaRef = useRef<number>(0);

  // Renderer instance
  const rendererRef = useRef<GameRenderer | null>(null);

  // Entities
  const birdRef = useRef<Bird>({
    x: 110,
    y: 280,
    vy: 0,
    radius: BIRD_RADIUS,
    rotation: 0,
    targetRotation: 0,
    wingAngle: 0,
    wingSpeed: 0.15,
    isFlapping: false,
    blinkTimer: 180,
    isBlinking: false,
    skin: BIRD_SKINS[0],
  });

  const pipesRef = useRef<PipePair[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<ScorePopup[]>([]);
  const nextPipeId = useRef<number>(1);
  const hoverCounterRef = useRef<number>(0);

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Update bird skin when user selects
  const changeSkin = useCallback((skin: BirdSkin) => {
    setSelectedSkin(skin);
    birdRef.current.skin = skin;
    sound.playButton();
  }, []);

  // Initialize Clouds
  const initClouds = useCallback(() => {
    const clouds: Cloud[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      clouds.push({
        x: (i * (GAME_WIDTH / count)) + Math.random() * 40,
        y: 40 + Math.random() * 180,
        scale: 0.6 + Math.random() * 0.7,
        speed: 0.25 + Math.random() * 0.45,
        opacity: 0.75 + Math.random() * 0.2,
        puffs: [
          { dx: 0, dy: 0, r: 24 },
          { dx: 18, dy: -8, r: 20 },
          { dx: 36, dy: 2, r: 22 },
          { dx: -18, dy: 3, r: 18 },
        ],
      });
    }
    cloudsRef.current = clouds;
  }, []);

  // Spawn a pipe pair with progressive difficulty
  const spawnPipePair = useCallback(() => {
    const currentScore = scoreRef.current;
    // Gradually decrease gap (min 132)
    const gap = Math.max(MIN_PIPE_GAP, INITIAL_PIPE_GAP - Math.min(24, Math.floor(currentScore / 4) * 2));

    const minTop = 60;
    const maxTop = GROUND_Y - gap - 60;
    const topHeight = Math.floor(minTop + Math.random() * (maxTop - minTop));
    const bottomY = topHeight + gap;

    pipesRef.current.push({
      id: nextPipeId.current++,
      x: GAME_WIDTH + 10,
      topHeight,
      bottomY,
      gap,
      width: PIPE_WIDTH,
      passed: false,
      colorVar: 0,
    });
  }, []);

  // Spawn particles
  const spawnFeatherParticles = useCallback((x: number, y: number, count: number = 5, color?: string) => {
    const bird = birdRef.current;
    const pColor = color || bird.skin.primaryColor;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 4,
        color: pColor,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        type: 'feather',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }, []);

  const spawnSparkles = useCallback((x: number, y: number, count: number = 10) => {
    const colors = ['#FDE047', '#38BDF8', '#4ADE80', '#F472B6', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 4.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.03 + Math.random() * 0.025,
        type: 'sparkle',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
      });
    }
  }, []);

  const spawnFlapPuff = useCallback((x: number, y: number) => {
    particlesRef.current.push({
      x: x - 12,
      y: y + 8,
      vx: -1.2 + (Math.random() - 0.5) * 0.5,
      vy: 0.8 + Math.random() * 0.8,
      size: 6,
      color: 'rgba(255, 255, 255, 0.7)',
      alpha: 0.8,
      decay: 0.05,
      type: 'puff',
      rotation: 0,
      vRot: 0,
    });
  }, []);

  // Trigger collision game over
  const triggerGameOver = useCallback(() => {
    if (stateRef.current === 'GAME_OVER') return;

    stateRef.current = 'GAME_OVER';
    setGameState('GAME_OVER');
    canRestartRef.current = false;

    // Play hit sound and shake screen
    sound.playHit();
    traumaRef.current = 1.0;

    // Burst feathers
    const bird = birdRef.current;
    spawnFeatherParticles(bird.x, bird.y, 18);

    // Save statistics
    const finalScore = scoreRef.current;
    const currentBest = bestScoreRef.current;

    const isNew = finalScore > currentBest;
    if (isNew) {
      setIsNewBest(true);
      setBestScore(finalScore);
      localStorage.setItem('skyhopper_best_score', String(finalScore));
      setTimeout(() => {
        sound.playNewBest();
      }, 350);
    } else {
      setIsNewBest(false);
    }

    // Update total games played
    const gamesPlayed = parseInt(localStorage.getItem('skyhopper_games_played') || '0', 10) + 1;
    localStorage.setItem('skyhopper_games_played', String(gamesPlayed));

    // Allow restart after short grace period
    setTimeout(() => {
      canRestartRef.current = true;
    }, 450);
  }, [spawnFeatherParticles]);

  // Main action: Jump / Flap
  const flap = useCallback(() => {
    sound.unlock();

    if (stateRef.current === 'START') {
      stateRef.current = 'PLAYING';
      setGameState('PLAYING');
      scoreRef.current = 0;
      setScore(0);
      setIsNewBest(false);

      // Start music on first play
      sound.startMusic();

      const bird = birdRef.current;
      bird.vy = FLAP_VELOCITY;
      bird.wingAngle = -Math.PI * 0.35;
      sound.playFlap();
      spawnFlapPuff(bird.x, bird.y);
      return;
    }

    if (stateRef.current === 'PLAYING') {
      if (isPausedRef.current) return;

      const bird = birdRef.current;
      bird.vy = FLAP_VELOCITY;
      bird.wingAngle = -Math.PI * 0.4;
      sound.playFlap();
      spawnFlapPuff(bird.x, bird.y);
      return;
    }

    if (stateRef.current === 'GAME_OVER') {
      if (canRestartRef.current) {
        restartGame();
      }
    }
  }, [spawnFlapPuff]);

  // Reset & restart game
  const restartGame = useCallback(() => {
    sound.unlock();
    sound.playButton();

    stateRef.current = 'PLAYING';
    setGameState('PLAYING');
    scoreRef.current = 0;
    setScore(0);
    setIsNewBest(false);
    setIsPaused(false);
    isPausedRef.current = false;
    traumaRef.current = 0;

    birdRef.current = {
      x: 110,
      y: 280,
      vy: FLAP_VELOCITY * 0.6,
      radius: BIRD_RADIUS,
      rotation: 0,
      targetRotation: 0,
      wingAngle: 0,
      wingSpeed: 0.2,
      isFlapping: false,
      blinkTimer: 180,
      isBlinking: false,
      skin: selectedSkin,
    };

    pipesRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];

    // Ensure music is rolling
    sound.startMusic();
  }, [selectedSkin]);

  // Return to start menu
  const returnToStart = useCallback(() => {
    sound.unlock();
    sound.playButton();
    stateRef.current = 'START';
    setGameState('START');
    setIsPaused(false);
    isPausedRef.current = false;

    birdRef.current = {
      x: 110,
      y: 280,
      vy: 0,
      radius: BIRD_RADIUS,
      rotation: 0,
      targetRotation: 0,
      wingAngle: 0,
      wingSpeed: 0.15,
      isFlapping: false,
      blinkTimer: 180,
      isBlinking: false,
      skin: selectedSkin,
    };

    pipesRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
  }, [selectedSkin]);

  // Toggle Pause
  const togglePause = useCallback(() => {
    if (stateRef.current !== 'PLAYING') return;
    sound.unlock();
    sound.playButton();
    setIsPaused((prev) => !prev);
  }, []);

  // Toggle Mute
  const toggleAudio = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Check Circle vs AABB Collision
  const checkCollisionWithPipe = (
    bx: number,
    by: number,
    br: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean => {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rx, Math.min(bx, rx + rw));
    const closestY = Math.max(ry, Math.min(by, ry + rh));

    const dx = bx - closestX;
    const dy = by - closestY;
    return dx * dx + dy * dy < br * br;
  };

  // Main 60fps Game Loop
  useEffect(() => {
    initClouds();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    rendererRef.current = new GameRenderer(ctx);

    const updateAndRender = (time: number) => {
      animFrameId.current = requestAnimationFrame(updateAndRender);

      // Handle pause
      if (isPausedRef.current) {
        return;
      }

      // Delta time normalization
      if (!lastTimeRef.current) lastTimeRef.current = time;
      lastTimeRef.current = time;

      const currentState = stateRef.current;
      const bird = birdRef.current;
      const currentScore = scoreRef.current;

      // Calculate dynamic speed (from 2.4 to 3.6 based on score)
      const currentSpeed = Math.min(
        MAX_PIPE_SPEED,
        INITIAL_PIPE_SPEED + Math.floor(currentScore / 5) * 0.14
      );

      // 1. Update Clouds (parallax)
      for (const cloud of cloudsRef.current) {
        cloud.x -= cloud.speed;
        if (cloud.x < -80) {
          cloud.x = GAME_WIDTH + 40;
          cloud.y = 40 + Math.random() * 180;
        }
      }

      // 2. Update Ground Parallax
      if (currentState === 'PLAYING' || currentState === 'START') {
        rendererRef.current?.updateGroundOffset(currentState === 'PLAYING' ? currentSpeed : 1.2);
      }

      // 3. State-specific Updates
      if (currentState === 'START') {
        // Idle hover animation
        hoverCounterRef.current += 0.06;
        bird.y = 280 + Math.sin(hoverCounterRef.current) * 12;
        bird.rotation = Math.sin(hoverCounterRef.current * 0.5) * 0.08;
        bird.wingAngle = Math.sin(hoverCounterRef.current * 2) * 0.35;

        // Blinking
        bird.blinkTimer--;
        if (bird.blinkTimer <= 0) {
          bird.isBlinking = true;
          if (bird.blinkTimer <= -10) {
            bird.isBlinking = false;
            bird.blinkTimer = 180 + Math.random() * 120;
          }
        }
      } else if (currentState === 'PLAYING') {
        // Apply Bird Gravity
        bird.vy += GRAVITY;
        if (bird.vy > MAX_FALL_SPEED) {
          bird.vy = MAX_FALL_SPEED;
        }
        bird.y += bird.vy;

        // Dynamic Rotation Physics
        if (bird.vy < 0) {
          // Jumping up
          bird.targetRotation = -0.42; // ~ -24 degrees
          bird.wingAngle = Math.sin(time * 0.035) * 0.45;
        } else {
          // Falling down
          bird.targetRotation = Math.min(1.25, -0.42 + (bird.vy / MAX_FALL_SPEED) * 1.65);
          bird.wingAngle = Math.sin(time * 0.015) * 0.2;
        }
        bird.rotation += (bird.targetRotation - bird.rotation) * 0.14;

        // Blinking
        bird.blinkTimer--;
        if (bird.blinkTimer <= 0) {
          bird.isBlinking = true;
          if (bird.blinkTimer <= -10) {
            bird.isBlinking = false;
            bird.blinkTimer = 180 + Math.random() * 120;
          }
        }

        // Ceiling collision
        if (bird.y - BIRD_HITBOX_RADIUS <= 0) {
          bird.y = BIRD_HITBOX_RADIUS;
          bird.vy = 0;
          triggerGameOver();
        }

        // Ground collision
        if (bird.y + BIRD_HITBOX_RADIUS >= GROUND_Y) {
          bird.y = GROUND_Y - BIRD_HITBOX_RADIUS;
          triggerGameOver();
        }

        // Spawn Pipes
        const pipes = pipesRef.current;
        const lastPipe = pipes[pipes.length - 1];
        if (!lastPipe || lastPipe.x <= GAME_WIDTH - 210) {
          spawnPipePair();
        }

        // Move Pipes & Check Collisions
        for (let i = pipes.length - 1; i >= 0; i--) {
          const pipe = pipes[i];
          pipe.x -= currentSpeed;

          // Check Score passing
          if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sound.playPoint();

            // Spawn floating "+1" popup
            popupsRef.current.push({
              x: bird.x + 22,
              y: bird.y - 18,
              text: '+1',
              alpha: 1,
              scale: 0.6,
              vy: -1.8,
            });

            // Golden star sparkles around gap center
            const gapCenterY = pipe.topHeight + pipe.gap / 2;
            spawnSparkles(pipe.x + PIPE_WIDTH / 2, gapCenterY, 14);

            // Check if beat high score during run
            if (scoreRef.current > bestScoreRef.current) {
              setBestScore(scoreRef.current);
            }
          }

          // Collision Detection with Top Pipe
          const lipHeight = 24;
          const lipOverhang = 6;
          const lipWidth = PIPE_WIDTH + lipOverhang * 2;

          // Stem top
          const hitTopStem = checkCollisionWithPipe(
            bird.x,
            bird.y,
            BIRD_HITBOX_RADIUS,
            pipe.x,
            0,
            PIPE_WIDTH,
            pipe.topHeight - lipHeight
          );

          // Lip top
          const hitTopLip = checkCollisionWithPipe(
            bird.x,
            bird.y,
            BIRD_HITBOX_RADIUS,
            pipe.x - lipOverhang,
            pipe.topHeight - lipHeight,
            lipWidth,
            lipHeight
          );

          // Bottom stem
          const hitBottomStem = checkCollisionWithPipe(
            bird.x,
            bird.y,
            BIRD_HITBOX_RADIUS,
            pipe.x,
            pipe.bottomY + lipHeight,
            PIPE_WIDTH,
            GROUND_Y - (pipe.bottomY + lipHeight)
          );

          // Bottom lip
          const hitBottomLip = checkCollisionWithPipe(
            bird.x,
            bird.y,
            BIRD_HITBOX_RADIUS,
            pipe.x - lipOverhang,
            pipe.bottomY,
            lipWidth,
            lipHeight
          );

          if (hitTopStem || hitTopLip || hitBottomStem || hitBottomLip) {
            triggerGameOver();
          }

          // Remove offscreen pipes
          if (pipe.x + PIPE_WIDTH + 20 < 0) {
            pipes.splice(i, 1);
          }
        }
      } else if (currentState === 'GAME_OVER') {
        // Fall to ground if in air
        if (bird.y + BIRD_HITBOX_RADIUS < GROUND_Y) {
          bird.vy += GRAVITY * 1.2;
          bird.y += bird.vy;
          bird.rotation = Math.min(1.4, bird.rotation + 0.12);
        } else {
          bird.y = GROUND_Y - BIRD_HITBOX_RADIUS;
        }
      }

      // 4. Update Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.type === 'feather') {
          p.vy += 0.08; // gentle fall
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // 5. Update Score Popups
      const popups = popupsRef.current;
      for (let i = popups.length - 1; i >= 0; i--) {
        const pop = popups[i];
        pop.y += pop.vy;
        pop.scale = Math.min(1.2, pop.scale + 0.08);
        pop.alpha -= 0.025;

        if (pop.alpha <= 0) {
          popups.splice(i, 1);
        }
      }

      // 6. Calculate Screen Shake
      let shakeX = 0;
      let shakeY = 0;
      if (traumaRef.current > 0) {
        const amount = Math.pow(traumaRef.current, 2) * 12;
        shakeX = (Math.random() * 2 - 1) * amount;
        shakeY = (Math.random() * 2 - 1) * amount;
        traumaRef.current = Math.max(0, traumaRef.current - 0.04);
      }

      // 7. Render Everything onto Canvas
      rendererRef.current?.render(
        bird,
        pipesRef.current,
        cloudsRef.current,
        particlesRef.current,
        popupsRef.current,
        scoreRef.current,
        shakeX,
        shakeY
      );
    };

    animFrameId.current = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [initClouds, spawnPipePair, spawnSparkles, triggerGameOver]);

  // Global Keyboard Controls (prevent spacebar scroll)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        flap();
      } else if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flap, togglePause, toggleAudio]);

  // Determine Medal unlocked
  const getMedalTier = (points: number): MedalTier => {
    if (points >= 50) return 'platinum';
    if (points >= 30) return 'gold';
    if (points >= 15) return 'silver';
    if (points >= 5) return 'bronze';
    return 'none';
  };

  return {
    canvasRef,
    gameState,
    score,
    bestScore,
    isNewBest,
    isMuted,
    isPaused,
    selectedSkin,
    medalTier: getMedalTier(score),
    flap,
    restartGame,
    returnToStart,
    togglePause,
    toggleAudio,
    changeSkin,
  };
}
