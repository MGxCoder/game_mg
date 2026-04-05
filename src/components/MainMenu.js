/**
 * MAIN MENU - Entry point and hub
 * 
 * DESIGN: Minimal, inviting, clear call-to-action
 */

import React, { useState, useEffect } from 'react';
import { SKINS, getXPForLevel } from '../utils/constants';
import '../styles/MainMenu.css';

const MainMenu = ({ 
  gameState, 
  onStartGame, 
  onOpenShop, 
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenSettings 
}) => {
  const [animateTitle, setAnimateTitle] = useState(false);

  useEffect(() => {
    // Title animation on mount
    setTimeout(() => setAnimateTitle(true), 100);
  }, []);

  const currentSkin = SKINS.find(s => s.id === gameState.selectedSkin) || SKINS[0];
  const xpProgress = (gameState.xp / getXPForLevel(gameState.level)) * 100;

  return (
    <div className="main-menu">
      {/* Background particles */}
      <div className="menu-bg">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="bg-particle"
            style={{ 
              '--delay': `${i * 0.5}s`,
              '--x': `${Math.random() * 100}%`,
              '--duration': `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header with stats */}
      <div className="menu-header">
        <div className="stat-item coins">
          <span className="stat-icon">💎</span>
          <span className="stat-value">{gameState.coins.toLocaleString()}</span>
        </div>
        
        <div className="level-badge">
          <span className="level-number">LV.{gameState.level}</span>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className={`title-container ${animateTitle ? 'visible' : ''}`}>
        <h1 className="game-title">
          <span className="title-neon">NEON</span>
          <span className="title-surge">SURGE</span>
        </h1>
        <div className="title-glow" />
      </div>

      {/* Character preview */}
      <div className="character-preview">
        <div 
          className="preview-character"
          style={{ 
            backgroundColor: currentSkin.color,
            boxShadow: `0 0 30px ${currentSkin.color}`
          }}
        >
          <div className="character-eyes">
            <span className="eye" />
            <span className="eye" />
          </div>
          <div className="character-smile" />
        </div>
        <span className="skin-name">{currentSkin.name}</span>
      </div>

      {/* High Score */}
      <div className="high-score">
        <span className="hs-label">HIGH SCORE</span>
        <span className="hs-value">{gameState.highScore.toLocaleString()}</span>
      </div>

      {/* Play Button - MAIN CTA */}
      <button className="play-button" onClick={onStartGame}>
        <span className="play-text">TAP TO PLAY</span>
        <div className="play-glow" />
      </button>

      {/* Menu buttons */}
      <div className="menu-buttons">
        <button className="menu-btn" onClick={onOpenShop}>
          <span className="btn-icon">🛒</span>
          <span className="btn-label">Shop</span>
        </button>
        
        <button className="menu-btn" onClick={onOpenAchievements}>
          <span className="btn-icon">🏆</span>
          <span className="btn-label">Achievements</span>
        </button>
        
        <button className="menu-btn" onClick={onOpenLeaderboard}>
          <span className="btn-icon">📊</span>
          <span className="btn-label">Leaderboard</span>
        </button>
        
        <button className="menu-btn" onClick={onOpenSettings}>
          <span className="btn-icon">⚙️</span>
          <span className="btn-label">Settings</span>
        </button>
      </div>

      {/* Quick stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="qs-value">{gameState.totalGames}</span>
          <span className="qs-label">Games</span>
        </div>
        <div className="quick-stat">
          <span className="qs-value">{gameState.dailyStreak}</span>
          <span className="qs-label">Day Streak</span>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
