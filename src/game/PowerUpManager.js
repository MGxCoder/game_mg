/**
 * POWER-UP MANAGER - Handles power-up spawning and collection
 * 
 * ADDICTION MECHANICS:
 * - Random spawns create anticipation
 * - Power-ups provide temporary god-like feeling
 * - Visual appeal draws player attention
 */

import { GAME_CONFIG, POWER_UPS } from '../utils/constants';

class PowerUp {
  constructor(canvas, type) {
    this.canvas = canvas;
    this.type = type;
    
    // Get config from constants
    const config = POWER_UPS[type];
    this.name = config.name;
    this.icon = config.icon;
    this.color = config.color;
    this.duration = config.duration;
    
    // Size and position
    this.width = 35;
    this.height = 35;
    this.x = canvas.width + 50;
    this.y = canvas.height - GAME_CONFIG.GROUND_HEIGHT - 100 - Math.random() * 150;
    
    // Animation
    this.floatOffset = Math.random() * Math.PI * 2;
    this.rotation = 0;
    this.pulsePhase = 0;
    this.collected = false;
  }

  update(dt, gameSpeed) {
    // Move left
    this.x -= gameSpeed * dt * 100;
    
    // Float animation
    this.y += Math.sin(Date.now() / 300 + this.floatOffset) * 0.5;
    
    // Rotation
    this.rotation += dt * 2;
    
    // Pulse
    this.pulsePhase += dt * 5;
  }

  isOffScreen() {
    return this.x + this.width < -50;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  render(ctx) {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    // Outer glow
    const glowRadius = this.width + Math.sin(this.pulsePhase) * 5;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, `${this.color}66`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Main body
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    
    // Hexagon shape
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const radius = this.width / 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Icon
    ctx.rotate(-this.rotation); // Counter-rotate for readable icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 0);
    
    ctx.restore();
  }
}

export class PowerUpManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.powerUps = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.POWERUP_SPAWN_INTERVAL;
    this.powerUpTypes = Object.keys(POWER_UPS);
  }

  update(dt, gameSpeed) {
    // Update spawn timer
    this.spawnTimer += dt;
    
    // ADDICTION MECHANIC: Random spawn creates anticipation
    if (this.spawnTimer >= this.spawnInterval) {
      // Random chance to spawn
      if (Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE) {
        this.spawnPowerUp();
      }
      this.spawnTimer = 0;
    }
    
    // Update existing power-ups
    for (const powerUp of this.powerUps) {
      powerUp.update(dt, gameSpeed);
    }
    
    // Remove off-screen power-ups
    this.powerUps = this.powerUps.filter(p => !p.isOffScreen());
  }

  spawnPowerUp() {
    // Random type selection
    const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
    const powerUp = new PowerUp(this.canvas, type);
    this.powerUps.push(powerUp);
  }

  removePowerUp(powerUp) {
    const index = this.powerUps.indexOf(powerUp);
    if (index > -1) {
      this.powerUps.splice(index, 1);
    }
  }

  render(ctx) {
    for (const powerUp of this.powerUps) {
      powerUp.render(ctx);
    }
  }
}
