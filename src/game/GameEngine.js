/**
 * GAME ENGINE - Core game logic and physics
 * 
 * ADDICTION MECHANICS:
 * 1. Progressive Difficulty - Speed increases every 10 seconds
 * 2. Near-Miss Detection - Calculates close calls for emotional impact
 * 3. Combo System - Rewards consecutive successful dodges
 * 4. Random Rewards - Unpredictable coin/powerup spawns
 * 5. Satisfying Physics - Snappy, responsive movement
 */

import { Player } from './Player';
import { ObstacleManager } from './ObstacleManager';
import { ParticleSystem } from './ParticleSystem';
import { PowerUpManager } from './PowerUpManager';
import { CoinManager } from './CoinManager';
import { GAME_CONFIG, DIFFICULTY_CURVE } from '../utils/constants';

export class GameEngine {
  constructor(canvas, ctx, callbacks) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    
    // Game state
    this.isRunning = true;
    this.score = 0;
    this.gameTime = 0;
    this.lastTimestamp = 0;
    this.deltaTime = 0;
    
    // ADDICTION MECHANIC: Combo system for consecutive success
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    
    // Difficulty scaling
    this.difficultyLevel = 1;
    this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
    
    // Active power-ups
    this.activePowerUps = {
      shield: false,
      slowMotion: false,
      scoreMultiplier: 1
    };
    
    // Initialize game objects
    this.player = new Player(canvas, callbacks.skin);
    this.obstacleManager = new ObstacleManager(canvas);
    this.particleSystem = new ParticleSystem(canvas, ctx);
    this.powerUpManager = new PowerUpManager(canvas);
    this.coinManager = new CoinManager(canvas);
    
    // Stats for achievements
    this.stats = {
      obstaclesDodged: 0,
      coinsCollected: 0,
      powerUpsUsed: 0,
      nearMisses: 0,
      maxCombo: 0,
      survivalTime: 0
    };
    
    // Background elements
    this.backgroundStars = this.createBackgroundStars();
    this.backgroundOffset = 0;
  }

  createBackgroundStars() {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.3
      });
    }
    return stars;
  }

  handleInput() {
    if (!this.isRunning) return;
    
    // Player jump/action
    this.player.jump();
    
    // ADDICTION MECHANIC: Instant responsive feedback
    this.particleSystem.createJumpParticles(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height
    );
  }

  update(timestamp) {
    if (!this.isRunning) return;

    // Calculate delta time for smooth animation
    this.deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    // Cap delta time to prevent huge jumps
    if (this.deltaTime > 50) this.deltaTime = 16.67;
    
    const dt = this.deltaTime / 1000;
    this.gameTime += dt;
    
    // ADDICTION MECHANIC: Progressive difficulty
    this.updateDifficulty();
    
    // Apply slow motion power-up
    const timeScale = this.activePowerUps.slowMotion ? 0.5 : 1;
    const scaledDt = dt * timeScale;
    
    // Update game objects
    this.player.update(scaledDt, this.gameSpeed);
    this.obstacleManager.update(scaledDt, this.gameSpeed, this.difficultyLevel);
    this.powerUpManager.update(scaledDt, this.gameSpeed);
    this.coinManager.update(scaledDt, this.gameSpeed);
    this.particleSystem.update(scaledDt);
    this.updateBackground(scaledDt);
    
    // Collision detection
    this.checkCollisions();
    
    // Update score based on time survived
    this.updateScore(dt);
    
    // ADDICTION MECHANIC: Combo timer decay
    this.updateCombo(dt);
    
    // Update stats
    this.stats.survivalTime = this.gameTime;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
  }

  updateDifficulty() {
    // ADDICTION MECHANIC: Gradual difficulty increase keeps players engaged
    const newLevel = Math.floor(this.gameTime / DIFFICULTY_CURVE.LEVEL_INTERVAL) + 1;
    
    if (newLevel > this.difficultyLevel) {
      this.difficultyLevel = newLevel;
      
      // Increase game speed
      this.gameSpeed = Math.min(
        GAME_CONFIG.INITIAL_SPEED + (this.difficultyLevel - 1) * DIFFICULTY_CURVE.SPEED_INCREMENT,
        GAME_CONFIG.MAX_SPEED
      );
      
      // Visual feedback for difficulty increase
      this.particleSystem.createDifficultyBurst(this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  updateScore(dt) {
    // Base score from time
    const baseScore = dt * GAME_CONFIG.SCORE_PER_SECOND;
    
    // Apply combo and power-up multipliers
    const multiplier = this.getScoreMultiplier();
    
    this.score += baseScore * multiplier;
    this.callbacks.onScoreUpdate(Math.floor(this.score));
  }

  getScoreMultiplier() {
    let multiplier = 1;
    
    // Combo multiplier (caps at 5x)
    multiplier += Math.min(this.combo * 0.1, 4);
    
    // Power-up multiplier
    multiplier *= this.activePowerUps.scoreMultiplier;
    
    return multiplier;
  }

  updateCombo(dt) {
    // ADDICTION MECHANIC: Combo decays over time, encouraging continuous success
    if (this.combo > 0) {
      this.comboTimer += dt;
      if (this.comboTimer > GAME_CONFIG.COMBO_TIMEOUT) {
        this.combo = Math.max(0, this.combo - 1);
        this.comboTimer = 0;
        this.callbacks.onComboUpdate(this.combo);
      }
    }
  }

  checkCollisions() {
    const playerBounds = this.player.getBounds();
    
    // Check obstacle collisions
    for (const obstacle of this.obstacleManager.obstacles) {
      const obstacleBounds = obstacle.getBounds();
      
      if (this.checkAABBCollision(playerBounds, obstacleBounds)) {
        // Shield protection
        if (this.activePowerUps.shield) {
          this.activePowerUps.shield = false;
          this.obstacleManager.removeObstacle(obstacle);
          this.callbacks.onScreenShake();
          this.particleSystem.createShieldBreakParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2
          );
          continue;
        }
        
        // Game over
        this.gameOver();
        return;
      }
      
      // ADDICTION MECHANIC: Near-miss detection
      if (!obstacle.passedPlayer && this.checkNearMiss(playerBounds, obstacleBounds)) {
        obstacle.triggeredNearMiss = true;
        this.callbacks.onNearMiss();
        this.stats.nearMisses++;
        
        // Bonus points for near-miss
        this.score += GAME_CONFIG.NEAR_MISS_BONUS;
        
        // Increase combo
        this.combo++;
        this.comboTimer = 0;
        this.callbacks.onComboUpdate(this.combo);
      }
      
      // Check if obstacle passed player (for combo)
      if (!obstacle.passedPlayer && obstacle.x + obstacle.width < this.player.x) {
        obstacle.passedPlayer = true;
        this.stats.obstaclesDodged++;
      }
    }
    
    // Check power-up collisions
    for (const powerUp of this.powerUpManager.powerUps) {
      if (this.checkAABBCollision(playerBounds, powerUp.getBounds())) {
        this.collectPowerUp(powerUp);
        this.powerUpManager.removePowerUp(powerUp);
      }
    }
    
    // Check coin collisions
    for (const coin of this.coinManager.coins) {
      if (this.checkAABBCollision(playerBounds, coin.getBounds())) {
        this.collectCoin(coin);
        this.coinManager.removeCoin(coin);
      }
    }
  }

  checkAABBCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  checkNearMiss(playerBounds, obstacleBounds) {
    // ADDICTION MECHANIC: Detect when player barely avoids obstacle
    const nearMissThreshold = 15;
    
    // Horizontal proximity check
    const horizontalClose = Math.abs((playerBounds.x + playerBounds.width) - obstacleBounds.x) < nearMissThreshold ||
                           Math.abs(playerBounds.x - (obstacleBounds.x + obstacleBounds.width)) < nearMissThreshold;
    
    // Vertical proximity check
    const verticalClose = Math.abs((playerBounds.y + playerBounds.height) - obstacleBounds.y) < nearMissThreshold ||
                         Math.abs(playerBounds.y - (obstacleBounds.y + obstacleBounds.height)) < nearMissThreshold;
    
    return horizontalClose || verticalClose;
  }

  collectPowerUp(powerUp) {
    this.stats.powerUpsUsed++;
    
    const powerUpConfig = {
      type: powerUp.type,
      name: powerUp.name,
      icon: powerUp.icon,
      duration: powerUp.duration
    };
    
    switch (powerUp.type) {
      case 'shield':
        this.activePowerUps.shield = true;
        this.player.setShield(true);
        setTimeout(() => {
          this.activePowerUps.shield = false;
          this.player.setShield(false);
        }, powerUp.duration);
        break;
        
      case 'slowMotion':
        this.activePowerUps.slowMotion = true;
        setTimeout(() => {
          this.activePowerUps.slowMotion = false;
        }, powerUp.duration);
        break;
        
      case 'multiplier':
        this.activePowerUps.scoreMultiplier = 2;
        setTimeout(() => {
          this.activePowerUps.scoreMultiplier = 1;
        }, powerUp.duration);
        break;
        
      default:
        break;
    }
    
    this.particleSystem.createPowerUpParticles(powerUp.x, powerUp.y, powerUp.color);
    this.callbacks.onPowerUpCollected(powerUpConfig);
  }

  collectCoin(coin) {
    this.stats.coinsCollected++;
    
    // ADDICTION MECHANIC: Random coin values create excitement
    const value = coin.value * (1 + Math.floor(this.combo / 5)); // Combo affects coin value
    
    this.particleSystem.createCoinParticles(coin.x, coin.y);
    this.callbacks.onCoinsCollected(value);
  }

  updateBackground(dt) {
    // Parallax scrolling background
    this.backgroundOffset += this.gameSpeed * dt * 0.3;
    
    for (const star of this.backgroundStars) {
      star.x -= star.speed * this.gameSpeed * dt * 50;
      
      if (star.x < 0) {
        star.x = this.canvas.width;
        star.y = Math.random() * this.canvas.height;
      }
    }
  }

  gameOver() {
    this.isRunning = false;
    this.callbacks.onScreenShake();
    
    // Death explosion particles
    this.particleSystem.createDeathExplosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );
    
    // Final stats
    const finalStats = {
      ...this.stats,
      maxCombo: this.maxCombo
    };
    
    // Small delay for death animation
    setTimeout(() => {
      this.callbacks.onGameOver(
        Math.floor(this.score),
        this.stats.coinsCollected,
        finalStats
      );
    }, 500);
  }

  render() {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background gradient
    this.renderBackground();
    
    // Draw background stars
    this.renderStars();
    
    // Draw ground
    this.renderGround();
    
    // Draw game objects (order matters for layering)
    this.coinManager.render(ctx);
    this.powerUpManager.render(ctx);
    this.obstacleManager.render(ctx);
    this.player.render(ctx);
    this.particleSystem.render(ctx);
    
    // Draw foreground effects
    this.renderSlowMotionEffect();
  }

  renderBackground() {
    const ctx = this.ctx;
    
    // Dark purple gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a0a2a');
    gradient.addColorStop(1, '#0a1a2a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Subtle grid lines for depth
    ctx.strokeStyle = 'rgba(100, 50, 150, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const offsetX = this.backgroundOffset % gridSize;
    
    for (let x = -offsetX; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
  }

  renderStars() {
    const ctx = this.ctx;
    
    for (const star of this.backgroundStars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 150, 255, ${star.alpha})`;
      ctx.fill();
    }
  }

  renderGround() {
    const ctx = this.ctx;
    const groundY = this.canvas.height - GAME_CONFIG.GROUND_HEIGHT;
    
    // Ground glow
    const glowGradient = ctx.createLinearGradient(0, groundY - 20, 0, groundY);
    glowGradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
    glowGradient.addColorStop(1, 'rgba(138, 43, 226, 0.4)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, groundY - 20, this.canvas.width, 20);
    
    // Main ground
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
    groundGradient.addColorStop(0, '#4a1a6a');
    groundGradient.addColorStop(1, '#2a0a4a');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, this.canvas.width, GAME_CONFIG.GROUND_HEIGHT);
    
    // Ground line
    ctx.strokeStyle = '#8a2be2';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#8a2be2';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.canvas.width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  renderSlowMotionEffect() {
    if (this.activePowerUps.slowMotion) {
      const ctx = this.ctx;
      
      // Blue tint overlay
      ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Vignette effect
      const gradient = ctx.createRadialGradient(
        this.canvas.width / 2, this.canvas.height / 2, 0,
        this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 50, 150, 0.3)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
