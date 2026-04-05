/**
 * PLAYER - Player character with physics and animation
 * 
 * GAME FEEL:
 * - Snappy jump with satisfying arc
 * - Visual feedback (squash/stretch)
 * - Trail effect while moving
 * - Glow effects based on state
 */

import { GAME_CONFIG } from '../utils/constants';

export class Player {
  constructor(canvas, skin) {
    this.canvas = canvas;
    this.skin = skin;
    
    // Position and size
    this.width = 40;
    this.height = 40;
    this.x = canvas.width * 0.15;
    this.y = canvas.height - GAME_CONFIG.GROUND_HEIGHT - this.height;
    this.groundY = this.y;
    
    // Physics
    this.velocityY = 0;
    this.gravity = GAME_CONFIG.GRAVITY;
    this.jumpForce = GAME_CONFIG.JUMP_FORCE;
    this.isGrounded = true;
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;
    
    // Animation state
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.targetScaleX = 1;
    this.targetScaleY = 1;
    
    // Trail effect
    this.trail = [];
    this.maxTrailLength = 8;
    
    // Power-up states
    this.hasShield = false;
    this.shieldPulse = 0;
    
    // Animation timing
    this.bobOffset = 0;
    this.glowIntensity = 0;
  }

  jump() {
    if (this.isGrounded) {
      // Primary jump
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      this.hasDoubleJumped = false;
      
      // Squash and stretch effect
      this.scaleX = 0.8;
      this.scaleY = 1.3;
      
      // Rotation on jump
      this.rotation = -0.2;
      
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      // Double jump (if unlocked)
      this.velocityY = this.jumpForce * 0.8;
      this.hasDoubleJumped = true;
      
      this.scaleX = 0.7;
      this.scaleY = 1.4;
    }
  }

  update(dt, gameSpeed) {
    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY += this.gravity * dt;
      this.y += this.velocityY * dt;
      
      // Rotation while in air
      if (this.velocityY < 0) {
        this.rotation = Math.max(-0.3, this.rotation - dt * 2);
      } else {
        this.rotation = Math.min(0.3, this.rotation + dt * 3);
      }
    }
    
    // Ground collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isGrounded = true;
      this.rotation = 0;
      
      // Landing squash
      if (!this.isGrounded) {
        this.scaleX = 1.3;
        this.scaleY = 0.7;
      }
    }
    
    // Smooth scale animation
    this.scaleX += (this.targetScaleX - this.scaleX) * 0.2;
    this.scaleY += (this.targetScaleY - this.scaleY) * 0.2;
    
    // Idle bob animation when grounded
    if (this.isGrounded) {
      this.bobOffset += dt * 5;
      this.y = this.groundY + Math.sin(this.bobOffset) * 2;
    }
    
    // Update trail
    this.updateTrail();
    
    // Update shield pulse
    if (this.hasShield) {
      this.shieldPulse += dt * 3;
    }
    
    // Glow animation
    this.glowIntensity = 0.5 + Math.sin(Date.now() / 500) * 0.3;
  }

  updateTrail() {
    // Add current position to trail
    this.trail.unshift({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      alpha: 1
    });
    
    // Limit trail length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }
    
    // Fade trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha = 1 - (i / this.trail.length);
    }
  }

  setShield(active) {
    this.hasShield = active;
    this.shieldPulse = 0;
  }

  getBounds() {
    // Slightly smaller hitbox for fairness (GOOD GAME FEEL)
    const margin = 5;
    return {
      x: this.x + margin,
      y: this.y + margin,
      width: this.width - margin * 2,
      height: this.height - margin * 2
    };
  }

  render(ctx) {
    ctx.save();
    
    // Draw trail
    this.renderTrail(ctx);
    
    // Translate to center for rotation
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);
    
    // Draw glow
    this.renderGlow(ctx);
    
    // Draw player body
    this.renderBody(ctx);
    
    // Draw face
    this.renderFace(ctx);
    
    ctx.restore();
    
    // Draw shield (outside transform)
    if (this.hasShield) {
      this.renderShield(ctx);
    }
  }

  renderTrail(ctx) {
    for (let i = 1; i < this.trail.length; i++) {
      const point = this.trail[i];
      const size = (this.width / 2) * (1 - i / this.trail.length);
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.skin.r}, ${this.skin.g}, ${this.skin.b}, ${point.alpha * 0.3})`;
      ctx.fill();
    }
  }

  renderGlow(ctx) {
    const glowRadius = this.width * 1.5 * this.glowIntensity;
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    gradient.addColorStop(0, `rgba(${this.skin.r}, ${this.skin.g}, ${this.skin.b}, 0.5)`);
    gradient.addColorStop(0.5, `rgba(${this.skin.r}, ${this.skin.g}, ${this.skin.b}, 0.2)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);
  }

  renderBody(ctx) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Main body with gradient
    const bodyGradient = ctx.createLinearGradient(-halfWidth, -halfHeight, halfWidth, halfHeight);
    bodyGradient.addColorStop(0, this.skin.colorLight);
    bodyGradient.addColorStop(1, this.skin.color);
    
    ctx.beginPath();
    ctx.roundRect(-halfWidth, -halfHeight, this.width, this.height, 8);
    ctx.fillStyle = bodyGradient;
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = this.skin.colorLight;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  renderFace(ctx) {
    // Eyes
    const eyeY = -5;
    const eyeSpacing = 8;
    
    // Left eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(eyeSpacing, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils (follow velocity)
    const pupilOffsetX = Math.min(2, Math.max(-2, this.velocityY * 0.1));
    const pupilOffsetY = this.velocityY < 0 ? -1 : 1;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    const mouthY = 8;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    if (this.velocityY < 0) {
      // Excited expression when jumping
      ctx.arc(0, mouthY - 2, 5, 0.2, Math.PI - 0.2);
    } else if (this.isGrounded) {
      // Happy expression
      ctx.arc(0, mouthY, 5, 0, Math.PI);
    } else {
      // Worried expression when falling
      ctx.arc(0, mouthY + 5, 5, Math.PI + 0.3, -0.3);
    }
    ctx.stroke();
  }

  renderShield(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = this.width * 0.9 + Math.sin(this.shieldPulse) * 3;
    
    // Shield glow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Main shield
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Shield shimmer
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 4, Math.PI / 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
