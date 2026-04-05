/**
 * OBSTACLE MANAGER - Spawns and manages obstacles
 * 
 * ADDICTION MECHANICS:
 * - Random spawn patterns keep gameplay fresh
 * - Difficulty scaling increases spawn rate and speed
 * - Variety of obstacle types for interest
 */

import { GAME_CONFIG } from '../utils/constants';

class Obstacle {
  constructor(canvas, type, difficultyLevel) {
    this.canvas = canvas;
    this.type = type;
    this.difficultyLevel = difficultyLevel;
    
    // Set properties based on type
    this.setProperties();
    
    // Position (start off-screen right)
    this.x = canvas.width + 50;
    this.y = this.calculateY();
    
    // State
    this.passedPlayer = false;
    this.triggeredNearMiss = false;
    this.rotation = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  setProperties() {
    switch (this.type) {
      case 'spike':
        this.width = 30 + Math.random() * 20;
        this.height = 40 + Math.random() * 30;
        this.color = '#ff4444';
        this.glowColor = 'rgba(255, 68, 68, 0.5)';
        this.isFlying = false;
        break;
        
      case 'block':
        this.width = 40 + Math.random() * 20;
        this.height = 40 + Math.random() * 30;
        this.color = '#ff6600';
        this.glowColor = 'rgba(255, 102, 0, 0.5)';
        this.isFlying = false;
        break;
        
      case 'flying':
        this.width = 50;
        this.height = 25;
        this.color = '#ff00ff';
        this.glowColor = 'rgba(255, 0, 255, 0.5)';
        this.isFlying = true;
        this.floatAmplitude = 20 + Math.random() * 20;
        this.floatSpeed = 2 + Math.random() * 2;
        this.floatOffset = Math.random() * Math.PI * 2;
        break;
        
      case 'wide':
        this.width = 80 + Math.random() * 40;
        this.height = 25;
        this.color = '#ff3366';
        this.glowColor = 'rgba(255, 51, 102, 0.5)';
        this.isFlying = false;
        break;
        
      default:
        this.width = 40;
        this.height = 40;
        this.color = '#ff4444';
        this.glowColor = 'rgba(255, 68, 68, 0.5)';
        this.isFlying = false;
    }
  }

  calculateY() {
    const groundY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT;
    
    if (this.isFlying) {
      // Flying obstacles at various heights
      return groundY - 100 - Math.random() * 100;
    }
    
    // Ground obstacles
    return groundY - this.height;
  }

  update(dt, gameSpeed) {
    // Move left
    this.x -= gameSpeed * dt * 100;
    
    // Flying obstacle float animation
    if (this.isFlying) {
      this.y = this.calculateY() + Math.sin(Date.now() / 500 * this.floatSpeed + this.floatOffset) * this.floatAmplitude;
    }
    
    // Rotation animation
    this.rotation += dt * 2;
    this.pulsePhase += dt * 5;
  }

  isOffScreen() {
    return this.x + this.width < -50;
  }

  getBounds() {
    // Slightly smaller hitbox for fairness
    const margin = 3;
    return {
      x: this.x + margin,
      y: this.y + margin,
      width: this.width - margin * 2,
      height: this.height - margin * 2
    };
  }

  render(ctx) {
    ctx.save();
    
    // Draw glow
    const glowSize = 10 + Math.sin(this.pulsePhase) * 3;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = glowSize;
    
    // Draw based on type
    switch (this.type) {
      case 'spike':
        this.renderSpike(ctx);
        break;
      case 'flying':
        this.renderFlying(ctx);
        break;
      default:
        this.renderBlock(ctx);
    }
    
    ctx.restore();
  }

  renderSpike(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Highlight
    ctx.strokeStyle = '#ff8888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + 5);
    ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.6);
    ctx.stroke();
  }

  renderBlock(ctx) {
    // Main block
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 4);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + 5, this.y + 5);
    ctx.lineTo(this.x + this.width - 5, this.y + 5);
    ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
    ctx.lineTo(this.x + 5, this.y + this.height - 5);
    ctx.closePath();
    ctx.stroke();
  }

  renderFlying(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Main body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings animation
    const wingPhase = Date.now() / 100;
    const wingOffset = Math.sin(wingPhase) * 10;
    
    ctx.fillStyle = 'rgba(255, 150, 255, 0.8)';
    
    // Left wing
    ctx.beginPath();
    ctx.ellipse(-this.width / 3, wingOffset, 15, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.ellipse(this.width / 3, wingOffset, 15, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -3, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  darkenColor(color) {
    // Simple color darkening
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const r = Math.max(0, (num >> 16) - 50);
      const g = Math.max(0, ((num >> 8) & 0x00FF) - 50);
      const b = Math.max(0, (num & 0x0000FF) - 50);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
  }
}

export class ObstacleManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.baseSpawnInterval = GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL;
    this.obstacleTypes = ['spike', 'block', 'flying', 'wide'];
  }

  update(dt, gameSpeed, difficultyLevel) {
    // Update spawn timer
    this.spawnTimer += dt;
    
    // Calculate spawn interval based on difficulty
    // ADDICTION MECHANIC: Spawn rate increases with difficulty
    const spawnInterval = Math.max(
      0.8,
      this.baseSpawnInterval - (difficultyLevel - 1) * 0.1
    );
    
    // Spawn new obstacles
    if (this.spawnTimer >= spawnInterval) {
      this.spawnObstacle(gameSpeed, difficultyLevel);
      this.spawnTimer = 0;
    }
    
    // Update existing obstacles
    for (const obstacle of this.obstacles) {
      obstacle.update(dt, gameSpeed);
    }
    
    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
  }

  spawnObstacle(gameSpeed, difficultyLevel) {
    // ADDICTION MECHANIC: Random obstacle types keep gameplay fresh
    // Higher difficulty = more flying obstacles
    let typeWeights;
    
    if (difficultyLevel < 3) {
      typeWeights = [0.5, 0.4, 0.0, 0.1]; // No flying at start
    } else if (difficultyLevel < 5) {
      typeWeights = [0.3, 0.3, 0.2, 0.2];
    } else {
      typeWeights = [0.25, 0.25, 0.3, 0.2]; // More flying at high difficulty
    }
    
    const type = this.weightedRandomType(typeWeights);
    const obstacle = new Obstacle(this.canvas, type, difficultyLevel);
    
    // Ensure minimum spacing from last obstacle
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    if (lastObstacle) {
      const minSpacing = 150 + Math.random() * 100;
      if (this.canvas.width + 50 - lastObstacle.x < minSpacing) {
        obstacle.x = lastObstacle.x + lastObstacle.width + minSpacing;
      }
    }
    
    this.obstacles.push(obstacle);
    
    // Random double obstacle spawn (harder)
    if (difficultyLevel > 3 && Math.random() < 0.2) {
      setTimeout(() => {
        const extraObstacle = new Obstacle(this.canvas, 'flying', difficultyLevel);
        extraObstacle.x = obstacle.x + 100;
        this.obstacles.push(extraObstacle);
      }, 100);
    }
  }

  weightedRandomType(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return this.obstacleTypes[i];
      }
    }
    
    return this.obstacleTypes[0];
  }

  removeObstacle(obstacle) {
    const index = this.obstacles.indexOf(obstacle);
    if (index > -1) {
      this.obstacles.splice(index, 1);
    }
  }

  render(ctx) {
    for (const obstacle of this.obstacles) {
      obstacle.render(ctx);
    }
  }
}
