/**
 * PARTICLE SYSTEM - Visual effects for game feel
 * 
 * ADDICTION MECHANICS:
 * - Satisfying visual feedback on every action
 * - Screen shake and explosions create impact
 * - Makes the game feel "juicy" and responsive
 */

class Particle {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.velocityX = config.velocityX || (Math.random() - 0.5) * 200;
    this.velocityY = config.velocityY || (Math.random() - 0.5) * 200;
    this.size = config.size || Math.random() * 5 + 2;
    this.color = config.color || '#ffffff';
    this.alpha = 1;
    this.decay = config.decay || 0.02;
    this.gravity = config.gravity || 0;
    this.shape = config.shape || 'circle';
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 5;
  }

  update(dt) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.velocityY += this.gravity * dt;
    this.alpha -= this.decay;
    this.rotation += this.rotationSpeed * dt;
    this.size = Math.max(0, this.size - dt * 2);
  }

  isDead() {
    return this.alpha <= 0 || this.size <= 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    
    switch (this.shape) {
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      case 'star':
        this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
        break;
      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

export class ParticleSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.maxParticles = 200;
  }

  update(dt) {
    // Update particles
    for (const particle of this.particles) {
      particle.update(dt);
    }
    
    // Remove dead particles
    this.particles = this.particles.filter(p => !p.isDead());
    
    // Limit total particles for performance
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  }

  render(ctx) {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  // ADDICTION MECHANIC: Jump particles make every action feel weighty
  createJumpParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(x, y, {
        velocityX: (Math.random() - 0.5) * 150,
        velocityY: Math.random() * 50 + 30,
        size: Math.random() * 6 + 3,
        color: '#8a2be2',
        decay: 0.03,
        gravity: 200
      }));
    }
  }

  // ADDICTION MECHANIC: Near-miss particles add tension
  createNearMissParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * 100,
        velocityY: Math.sin(angle) * 100,
        size: Math.random() * 4 + 2,
        color: '#ffff00',
        decay: 0.05,
        shape: 'star'
      }));
    }
  }

  // Coin collection burst
  createCoinParticles(x, y) {
    const colors = ['#ffd700', '#ffec8b', '#fff68f'];
    
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, {
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: (Math.random() - 0.5) * 200,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: 0.04,
        shape: 'star'
      }));
    }
  }

  // Power-up collection effect
  createPowerUpParticles(x, y, color) {
    // Ring expansion
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * 150,
        velocityY: Math.sin(angle) * 150,
        size: Math.random() * 6 + 4,
        color: color,
        decay: 0.02,
        shape: 'square'
      }));
    }
  }

  // Shield break effect
  createShieldBreakParticles(x, y) {
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 / 25) * i;
      const speed = 100 + Math.random() * 100;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: '#00ccff',
        decay: 0.025,
        shape: Math.random() > 0.5 ? 'square' : 'circle'
      }));
    }
  }

  // ADDICTION MECHANIC: Satisfying death explosion
  createDeathExplosion(x, y) {
    const colors = ['#ff0000', '#ff4444', '#ff8888', '#ffffff'];
    
    // Main explosion
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: 0.02,
        gravity: 100,
        shape: Math.random() > 0.3 ? 'square' : 'circle'
      }));
    }
    
    // Secondary sparks
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 150;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        color: '#ffffff',
        decay: 0.05
      }));
    }
  }

  // Difficulty increase burst
  createDifficultyBurst(x, y) {
    const colors = ['#ff00ff', '#8a2be2', '#4b0082'];
    
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const speed = 80 + Math.random() * 40;
      this.particles.push(new Particle(x, y, {
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: 0.015
      }));
    }
  }

  // Combo celebration
  createComboCelebration(x, y, comboLevel) {
    const intensity = Math.min(comboLevel / 5, 3);
    const count = 10 + comboLevel * 2;
    
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, {
        velocityX: (Math.random() - 0.5) * 200 * intensity,
        velocityY: (Math.random() - 0.5) * 200 * intensity,
        size: Math.random() * 6 + 3,
        color: `hsl(${280 + Math.random() * 60}, 100%, 60%)`,
        decay: 0.02,
        shape: 'star'
      }));
    }
  }

  // Trail effect (for continuous movement)
  createTrailParticle(x, y, color) {
    this.particles.push(new Particle(x, y, {
      velocityX: (Math.random() - 0.5) * 20,
      velocityY: (Math.random() - 0.5) * 20,
      size: Math.random() * 4 + 2,
      color: color,
      decay: 0.08
    }));
  }
}
