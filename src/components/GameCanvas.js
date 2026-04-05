/**
 * GAME CANVAS - Core rendering and game loop
 * 
 * ADDICTION MECHANICS IN THIS FILE:
 * - Responsive controls (instant feedback)
 * - Screen shake on impacts
 * - Particle effects for visual satisfaction
 * - Near-miss detection and feedback
 * - Combo system with multipliers
 * - Progressive difficulty scaling
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { SKINS } from '../utils/constants';
import '../styles/GameCanvas.css';

const GameCanvas = ({ gameState, onGameOver, playSound }) => {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const doubleTapDelayRef = useRef(300); // ms to detect double-tap
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [coins, setCoins] = useState(0);
  const [powerUp, setPowerUp] = useState(null);
  const [showCombo, setShowCombo] = useState(false);
  const [nearMiss, setNearMiss] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Get selected skin configuration
  const currentSkin = SKINS.find(s => s.id === gameState.selectedSkin) || SKINS[0];

  // Initialize game engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size for mobile
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize game engine with callbacks for UI updates
    gameEngineRef.current = new GameEngine(canvas, ctx, {
      skin: currentSkin,
      onScoreUpdate: (newScore) => setScore(newScore),
      onComboUpdate: (newCombo) => {
        setCombo(newCombo);
        if (newCombo > 1) {
          setShowCombo(true);
          playSound('combo');
          setTimeout(() => setShowCombo(false), 500);
        }
      },
      onCoinsCollected: (amount) => {
        setCoins(prev => prev + amount);
        playSound('coin');
      },
      onPowerUpCollected: (type) => {
        setPowerUp(type);
        playSound('powerup');
        // Auto-clear powerup display after duration
        setTimeout(() => setPowerUp(null), type.duration);
      },
      onNearMiss: () => {
        // ADDICTION MECHANIC: Near-miss creates excitement and "I almost had it" feeling
        setNearMiss(true);
        playSound('nearMiss');
        setTimeout(() => setNearMiss(false), 300);
      },
      onScreenShake: () => {
        // ADDICTION MECHANIC: Screen shake adds weight and impact to actions
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 100);
      },
      onGameOver: (finalScore, totalCoins, stats) => {
        cancelAnimationFrame(animationFrameRef.current);
        onGameOver(finalScore, totalCoins, stats);
      }
    });

    // Start game loop
    const gameLoop = (timestamp) => {
      if (!isPaused && gameEngineRef.current) {
        gameEngineRef.current.update(timestamp);
        gameEngineRef.current.render();
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentSkin, isPaused, onGameOver, playSound]);

  // ADDICTION MECHANIC: Responsive one-touch controls
  const handleTap = useCallback((e) => {
    e.preventDefault();
    if (gameEngineRef.current && !isPaused) {
      gameEngineRef.current.handleInput();
      playSound('jump');
    }
  }, [isPaused, playSound]);

  // Double-tap/double-click handler for double jump
  const handleDoubleTap = useCallback(() => {
    if (gameEngineRef.current && !isPaused) {
      // Trigger double jump by calling handleInput twice rapidly
      gameEngineRef.current.handleInput();
      playSound('jump');
    }
  }, [isPaused, playSound]);

  // Keyboard controls - Space to jump
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameEngineRef.current && !isPaused) {
          gameEngineRef.current.handleInput();
          playSound('jump');
        }
      }
      // Escape to pause
      if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
        playSound('tap');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, playSound]);

  // Touch and mouse event handlers with double-tap detection
  const handleInteraction = useCallback((e) => {
    // Don't trigger on pause button area
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches ? e.touches[0] : e;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if tap is in pause button area (top right)
    if (x > rect.width - 60 && y < 60) {
      setIsPaused(prev => !prev);
      playSound('tap');
      return;
    }
    
    // Double-tap/double-click detection
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTimeRef.current;
    
    if (timeSinceLastTap < doubleTapDelayRef.current && timeSinceLastTap > 50) {
      // This is a double-tap - trigger jump again for double jump
      handleDoubleTap();
    } else {
      // Single tap
      handleTap(e);
    }
    
    lastTapTimeRef.current = currentTime;
  }, [handleTap, handleDoubleTap, playSound]);

  // Handle native double-click event (for mouse)
  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    handleDoubleTap();
  }, [handleDoubleTap]);

  return (
    <div 
      className={`game-container ${screenShake ? 'shake' : ''}`}
      onTouchStart={handleInteraction}
      onMouseDown={handleInteraction}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="game-canvas" />
      
      {/* HUD Overlay */}
      <div className="game-hud">
        <div className="hud-top">
          <div className="score-display">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          
          <button 
            className="pause-button"
            onClick={() => { setIsPaused(prev => !prev); playSound('tap'); }}
          >
            {isPaused ? '▶' : '❚❚'}
          </button>
        </div>
        
        <div className="hud-stats">
          <div className="coins-display">
            <span className="coin-icon">💎</span>
            <span>{coins}</span>
          </div>
          
          {combo > 1 && (
            <div className={`combo-display ${showCombo ? 'pop' : ''}`}>
              <span className="combo-value">x{combo}</span>
              <span className="combo-label">COMBO!</span>
            </div>
          )}
        </div>
        
        {/* Near-miss feedback - ADDICTION MECHANIC */}
        {nearMiss && (
          <div className="near-miss-flash">
            <span>CLOSE CALL!</span>
          </div>
        )}
        
        {/* Active power-up indicator */}
        {powerUp && (
          <div className="powerup-active">
            <span className="powerup-icon">{powerUp.icon}</span>
            <span className="powerup-name">{powerUp.name}</span>
          </div>
        )}
      </div>
      
      {/* Pause Menu */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>PAUSED</h2>
            <button onClick={() => { setIsPaused(false); playSound('tap'); }}>
              RESUME
            </button>
            <button onClick={() => { 
              cancelAnimationFrame(animationFrameRef.current);
              onGameOver(score, coins, { earlyQuit: true });
            }}>
              QUIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
