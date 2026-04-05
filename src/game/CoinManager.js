/**
 * COIN MANAGER - Handles coin spawning and collection
 * 
 * ADDICTION MECHANICS:
 * - Random coin values create excitement
 * - Coin patterns encourage risk-taking
 * - Visual appeal of shiny collectibles
 */

import { GAME_CONFIG } from '../utils/constants';

class Coin {
  constructor(canvas, type = 'normal') {
    this.canvas = canvas;
    this.type = type;
    
    // Different coin types with different values
    switch (type) {
      case 'gold':
        this.value = 5;
        this.color = '#ffd700';
        this.size = 20;
        break;
      case 'diamond':
        this.value = 25;
        this.color = '#00ffff';
        this.size = 25;
        break;
      default:
        this.value = 1;
        this.color = '#c0c0c0';
        this.size = 15;
    }
    
    // Position
    this.x = canvas.width + 50;
    this.y = canvas.height - GAME_CONFIG.GROUND_HEIGHT - 50 - Math.random() * 200;
    this.width = this.size;
    this.height = this.size;
    
    // Animation
    this.floatOffset = Math.random() * Math.PI * 2;
    this.rotation = 0;
    this.shimmerPhase = 0;
    this.scaleX = 1;
  }

  update(dt, gameSpeed) {
    // Move left
    this.x -= gameSpeed * dt * 100;
    
    // Float animation
    this.y += Math.sin(Date.now() / 200 + this.floatOffset) * 0.3;
    
    // Rotation (3D spin effect)
    this.rotation += dt * 3;
    this.scaleX = Math.abs(Math.cos(this.rotation));
    
    // Shimmer
    this.shimmerPhase += dt * 8;
  }

  isOffScreen() {
    return this.x + this.width < -50;
  }

  getBounds() {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      width: this.size,
      height: this.size
    };
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, 1);
    
    // Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10 + Math.sin(this.shimmerPhase) * 3;
    
    // Main coin body
    if (this.type === 'diamond') {
      // Diamond shape
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.lineTo(this.size / 2, 0);
      ctx.lineTo(0, this.size / 2);
      ctx.lineTo(-this.size / 2, 0);
      ctx.closePath();
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.lineTo(this.size / 4, -this.size / 4);
      ctx.lineTo(0, 0);
      ctx.lineTo(-this.size / 4, -this.size / 4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Circle coin
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = this.type === 'gold' ? '#ffec8b' : '#e0e0e0';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size / 3, this.size / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-this.size / 6, -this.size / 6, this.size / 6, this.size / 8, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

export class CoinManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.coins = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.COIN_SPAWN_INTERVAL;
  }

  update(dt, gameSpeed) {
    // Update spawn timer
    this.spawnTimer += dt;
    
    // Spawn coins
    if (this.spawnTimer >= this.spawnInterval) {
      if (Math.random() < GAME_CONFIG.COIN_SPAWN_CHANCE) {
        this.spawnCoinPattern();
      }
      this.spawnTimer = 0;
    }
    
    // Update existing coins
    for (const coin of this.coins) {
      coin.update(dt, gameSpeed);
    }
    
    // Remove off-screen coins
    this.coins = this.coins.filter(c => !c.isOffScreen());
  }

  spawnCoinPattern() {
    // ADDICTION MECHANIC: Random coin patterns
    const patterns = ['single', 'line', 'arc', 'cluster'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Random coin type with weighted probability
    const typeRoll = Math.random();
    let coinType;
    if (typeRoll < 0.7) {
      coinType = 'normal';
    } else if (typeRoll < 0.95) {
      coinType = 'gold';
    } else {
      coinType = 'diamond';
    }
    
    switch (pattern) {
      case 'line':
        this.spawnLine(coinType);
        break;
      case 'arc':
        this.spawnArc(coinType);
        break;
      case 'cluster':
        this.spawnCluster(coinType);
        break;
      default:
        this.coins.push(new Coin(this.canvas, coinType));
    }
  }

  spawnLine(type) {
    const count = 3 + Math.floor(Math.random() * 4);
    const baseY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - 100 - Math.random() * 100;
    
    for (let i = 0; i < count; i++) {
      const coin = new Coin(this.canvas, type);
      coin.x = this.canvas.width + 50 + i * 40;
      coin.y = baseY;
      this.coins.push(coin);
    }
  }

  spawnArc(type) {
    const count = 5;
    const baseY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - 80;
    
    for (let i = 0; i < count; i++) {
      const coin = new Coin(this.canvas, type);
      coin.x = this.canvas.width + 50 + i * 35;
      // Arc shape
      const arcProgress = i / (count - 1);
      coin.y = baseY - Math.sin(arcProgress * Math.PI) * 100;
      this.coins.push(coin);
    }
  }

  spawnCluster(type) {
    const count = 3 + Math.floor(Math.random() * 3);
    const centerY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT - 120 - Math.random() * 80;
    
    for (let i = 0; i < count; i++) {
      const coin = new Coin(this.canvas, type);
      coin.x = this.canvas.width + 50 + (Math.random() - 0.5) * 60;
      coin.y = centerY + (Math.random() - 0.5) * 60;
      this.coins.push(coin);
    }
  }

  removeCoin(coin) {
    const index = this.coins.indexOf(coin);
    if (index > -1) {
      this.coins.splice(index, 1);
    }
  }

  render(ctx) {
    for (const coin of this.coins) {
      coin.render(ctx);
    }
  }
}
