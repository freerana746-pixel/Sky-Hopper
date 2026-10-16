import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_HEIGHT,
  GROUND_Y,
  PIPE_WIDTH,
} from './constants';
import { Bird, Cloud, Particle, PipePair, ScorePopup } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = GAME_WIDTH;
  private height: number = GAME_HEIGHT;
  private groundOffset: number = 0;
  private hillsOffset: number = 0;
  private distantOffset: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public updateGroundOffset(speed: number) {
    this.groundOffset = (this.groundOffset + speed) % 24;
    this.hillsOffset = (this.hillsOffset + speed * 0.4) % 120;
    this.distantOffset = (this.distantOffset + speed * 0.15) % 240;
  }

  public render(
    bird: Bird,
    pipes: PipePair[],
    clouds: Cloud[],
    particles: Particle[],
    popups: ScorePopup[],
    score: number,
    shakeX: number = 0,
    shakeY: number = 0
  ) {
    const ctx = this.ctx;

    ctx.save();
    // Screen shake
    ctx.translate(shakeX, shakeY);

    // 1. Sky backdrop
    this.drawSky(score);

    // 2. Parallax clouds
    this.drawClouds(clouds);

    // 3. Parallax distant mountains
    this.drawDistantMountains(score);

    // 4. Parallax rolling hills & trees
    this.drawMidgroundHills(score);

    // 5. Pipes
    this.drawPipes(pipes);

    // 6. Ground & Grass
    this.drawGround();

    // 7. Particles behind bird
    this.drawParticles(particles.filter((p) => p.type === 'puff'));

    // 8. Bird Character
    this.drawBird(bird);

    // 9. Foreground particles (feathers, sparkles)
    this.drawParticles(particles.filter((p) => p.type !== 'puff'));

    // 10. Floating score popups
    this.drawScorePopups(popups);

    ctx.restore();
  }

  private drawSky(score: number) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);

    if (score < 15) {
      // Sunny Day Sky
      grad.addColorStop(0, '#38BDF8'); // Vivid cyan
      grad.addColorStop(0.55, '#7DD3FC');
      grad.addColorStop(1, '#BAE6FD'); // Light horizon
    } else if (score < 35) {
      // Golden Sunset Sky
      grad.addColorStop(0, '#FB923C'); // Warm orange
      grad.addColorStop(0.5, '#F472B6'); // Rose
      grad.addColorStop(1, '#FED7AA'); // Warm gold horizon
    } else {
      // Magical Twilight Sky
      grad.addColorStop(0, '#1E1B4B'); // Deep indigo
      grad.addColorStop(0.6, '#4338CA');
      grad.addColorStop(1, '#818CF8'); // Lavender glow
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Sun / Celestial body
    ctx.save();
    if (score < 35) {
      // Golden Sun
      const sunX = this.width - 70;
      const sunY = 90;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 65);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.45)');
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Twilight Crescent Moon
      const moonX = this.width - 70;
      const moonY = 85;
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Shadow overlay for crescent
      ctx.fillStyle = '#312E81';
      ctx.beginPath();
      ctx.arc(moonX - 9, moonY - 5, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawClouds(clouds: Cloud[]) {
    const ctx = this.ctx;
    ctx.save();

    for (const cloud of clouds) {
      ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
      ctx.beginPath();
      for (const puff of cloud.puffs) {
        ctx.arc(
          cloud.x + puff.dx * cloud.scale,
          cloud.y + puff.dy * cloud.scale,
          puff.r * cloud.scale,
          0,
          Math.PI * 2
        );
      }
      ctx.fill();
    }

    ctx.restore();
  }

  private drawDistantMountains(score: number) {
    const ctx = this.ctx;
    ctx.save();

    const mountainColor =
      score < 15
        ? 'rgba(186, 230, 253, 0.65)'
        : score < 35
        ? 'rgba(244, 114, 182, 0.45)'
        : 'rgba(99, 102, 241, 0.35)';

    ctx.fillStyle = mountainColor;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);

    const segmentWidth = 120;
    const startX = -this.distantOffset;

    for (let x = startX - segmentWidth; x < this.width + segmentWidth * 2; x += segmentWidth) {
      ctx.lineTo(x + segmentWidth * 0.5, GROUND_Y - 95);
      ctx.lineTo(x + segmentWidth, GROUND_Y);
    }
    ctx.lineTo(this.width, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawMidgroundHills(score: number) {
    const ctx = this.ctx;
    ctx.save();

    const hillColor =
      score < 15
        ? '#86EFAC'
        : score < 35
        ? '#FDA4AF'
        : '#6366F1';

    const hillShadow =
      score < 15
        ? '#4ADE80'
        : score < 35
        ? '#F43F5E'
        : '#4338CA';

    // Rolling hill waves
    const waveWidth = 80;
    const startX = -this.hillsOffset;

    ctx.fillStyle = hillColor;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);

    for (let x = startX - waveWidth; x < this.width + waveWidth * 2; x += waveWidth) {
      ctx.quadraticCurveTo(x + waveWidth * 0.5, GROUND_Y - 55, x + waveWidth, GROUND_Y);
    }
    ctx.lineTo(this.width, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Little cartoon trees on top of hills
    ctx.fillStyle = hillShadow;
    for (let x = startX - waveWidth + 30; x < this.width + waveWidth * 2; x += 110) {
      const treeY = GROUND_Y - 32;
      ctx.beginPath();
      ctx.arc(x, treeY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#78350F';
      ctx.fillRect(x - 1.5, treeY + 7, 3, 7);
      ctx.fillStyle = hillShadow;
    }

    ctx.restore();
  }

  private drawPipes(pipes: PipePair[]) {
    const ctx = this.ctx;
    const lipHeight = 24;
    const lipOverhang = 6;
    const lipWidth = PIPE_WIDTH + lipOverhang * 2;

    for (const pipe of pipes) {
      // 1. Top pipe
      this.drawSinglePipe(
        pipe.x,
        0,
        PIPE_WIDTH,
        pipe.topHeight - lipHeight,
        pipe.x - lipOverhang,
        pipe.topHeight - lipHeight,
        lipWidth,
        lipHeight,
        true
      );

      // 2. Bottom pipe
      const bottomHeight = GROUND_Y - pipe.bottomY;
      this.drawSinglePipe(
        pipe.x,
        pipe.bottomY + lipHeight,
        PIPE_WIDTH,
        bottomHeight - lipHeight,
        pipe.x - lipOverhang,
        pipe.bottomY,
        lipWidth,
        lipHeight,
        false
      );
    }
  }

  private drawSinglePipe(
    stemX: number,
    stemY: number,
    stemW: number,
    stemH: number,
    lipX: number,
    lipY: number,
    lipW: number,
    lipH: number,
    isTop: boolean
  ) {
    const ctx = this.ctx;
    ctx.save();

    // --- STEM ---
    const stemGrad = ctx.createLinearGradient(stemX, 0, stemX + stemW, 0);
    stemGrad.addColorStop(0, '#22C55E'); // Bright emerald
    stemGrad.addColorStop(0.2, '#86EFAC'); // Gloss highlight
    stemGrad.addColorStop(0.5, '#16A34A');
    stemGrad.addColorStop(0.85, '#15803D'); // Shaded edge
    stemGrad.addColorStop(1, '#166534');

    ctx.fillStyle = stemGrad;
    ctx.fillRect(stemX, stemY, stemW, stemH);

    // Stem Outline
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#14532D';
    ctx.strokeRect(stemX, stemY, stemW, stemH);

    // Interior shadow under/above the lip
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    if (isTop) {
      ctx.fillRect(stemX, stemH - 6, stemW, 6);
    } else {
      ctx.fillRect(stemX, stemY, stemW, 6);
    }

    // --- LIP / CAP ---
    const lipGrad = ctx.createLinearGradient(lipX, 0, lipX + lipW, 0);
    lipGrad.addColorStop(0, '#4ADE80');
    lipGrad.addColorStop(0.22, '#BBF7D0'); // Bright gloss shine
    lipGrad.addColorStop(0.5, '#16A34A');
    lipGrad.addColorStop(0.85, '#15803D');
    lipGrad.addColorStop(1, '#14532D');

    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.roundRect(lipX, lipY, lipW, lipH, 4);
    ctx.fill();

    // Lip outline
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gloss highlight stripe on lip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(lipX + 12, lipY + 3, 8, lipH - 6, 2);
    ctx.fill();

    ctx.restore();
  }

  private drawGround() {
    const ctx = this.ctx;
    ctx.save();

    // Top grass layer (vibrant green)
    const grassHeight = 16;
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(0, GROUND_Y, this.width, grassHeight);

    // Decorative grass blade spikes
    ctx.fillStyle = '#16A34A';
    for (let x = -this.groundOffset; x < this.width + 24; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + grassHeight);
      ctx.lineTo(x + 6, GROUND_Y + 2);
      ctx.lineTo(x + 12, GROUND_Y + grassHeight);
      ctx.fill();
    }

    // Dirt base gradient
    const dirtGrad = ctx.createLinearGradient(0, GROUND_Y + grassHeight, 0, this.height);
    dirtGrad.addColorStop(0, '#D97706'); // Warm amber dirt
    dirtGrad.addColorStop(0.6, '#B45309');
    dirtGrad.addColorStop(1, '#78350F');

    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, GROUND_Y + grassHeight, this.width, GROUND_HEIGHT - grassHeight);

    // Stylized diagonal brick / pebble pattern on ground
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
    ctx.lineWidth = 2;
    const stripeWidth = 24;
    for (let x = -this.groundOffset; x < this.width + 50; x += stripeWidth) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + grassHeight);
      ctx.lineTo(x - 20, this.height);
      ctx.stroke();
    }

    // Top border line
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(this.width, GROUND_Y);
    ctx.stroke();

    ctx.restore();
  }

  private drawBird(bird: Bird) {
    const ctx = this.ctx;
    const { skin } = bird;

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Shadow on ground when close to ground
    const distToGround = GROUND_Y - bird.y;
    if (distToGround < 120 && distToGround > 0) {
      ctx.save();
      ctx.rotate(-bird.rotation); // unrotate shadow
      const shadowAlpha = Math.max(0, (1 - distToGround / 120) * 0.35);
      const shadowScale = Math.max(0.4, 1 - distToGround / 180);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, distToGround - 4, 18 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tail feathers
    ctx.save();
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-24, -4);
    ctx.lineTo(-22, 5);
    ctx.lineTo(-25, 11);
    ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Body (Round, cuddly cartoon silhouette)
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(-3, -4, 4, 0, 0, 20);
    bodyGrad.addColorStop(0, '#FFFFFF'); // Specular highlight
    bodyGrad.addColorStop(0.2, skin.primaryColor);
    bodyGrad.addColorStop(0.85, skin.primaryColor);
    bodyGrad.addColorStop(1, skin.secondaryColor);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // Belly patch
    ctx.save();
    ctx.fillStyle = skin.bellyColor;
    ctx.beginPath();
    ctx.ellipse(3, 5, 10, 8, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rosy Cheeks
    ctx.save();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(6, 6, 4.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Animated Wing
    ctx.save();
    ctx.translate(-4, 2);
    ctx.rotate(bird.wingAngle);

    const wingGrad = ctx.createLinearGradient(0, -6, 0, 10);
    wingGrad.addColorStop(0, '#FFFFFF');
    wingGrad.addColorStop(0.3, skin.wingColor);
    wingGrad.addColorStop(1, skin.secondaryColor);

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 11, 7, -Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Feather division line on wing
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(3, 1);
    ctx.stroke();
    ctx.restore();

    // Beak
    ctx.save();
    ctx.fillStyle = skin.beakColor;
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(24, 2);
    ctx.lineTo(14, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Beak smile line
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, 2.5);
    ctx.lineTo(20, 2.5);
    ctx.stroke();
    ctx.restore();

    // Big Cartoon Eye
    ctx.save();
    const eyeX = 9;
    const eyeY = -5;
    const eyeR = 6.5;

    // Sclera (White of eye)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Blinking effect
    if (bird.isBlinking) {
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR - 1, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Pupil (looks forward/down based on velocity)
      const pupilLookX = eyeX + 2;
      const pupilLookY = eyeY + Math.max(-1.5, Math.min(2, bird.vy * 0.25));

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(pupilLookX, pupilLookY, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Shiny catchlight reflection
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pupilLookX - 1, pupilLookY - 1, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.restore();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'feather') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.7, 0);
        ctx.lineTo(p.size * 0.7, 0);
        ctx.stroke();
      } else if (p.type === 'sparkle' || p.type === 'star') {
        ctx.fillStyle = p.color;
        this.drawStar(ctx, 0, 0, 4, p.size, p.size * 0.4);
      } else if (p.type === 'puff') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  private drawScorePopups(popups: ScorePopup[]) {
    const ctx = this.ctx;

    for (const pop of popups) {
      ctx.save();
      ctx.globalAlpha = pop.alpha;
      ctx.translate(pop.x, pop.y);
      ctx.scale(pop.scale, pop.scale);

      ctx.font = '900 24px "Fredoka", "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick black stroke
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.strokeText(pop.text, 0, 0);

      // Gold text fill
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(pop.text, 0, 0);

      ctx.restore();
    }
  }
}
