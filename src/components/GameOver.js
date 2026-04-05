/**
 * GAME OVER SCREEN
 * 
 * ADDICTION MECHANICS:
 * - Quick restart option (< 1 second to retry)
 * - "Continue" option creates loss aversion
 * - Score comparison creates competition
 * - Share functionality for viral spread
 */

import React, { useState, useEffect } from 'react';
import { shareScore } from '../utils/helpers';
import '../styles/GameOver.css';

const GameOver = ({ gameState, onRestart, onMenu, onContinue, playSound }) => {
  const [showContent, setShowContent] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [continuedOnce, setContinuedOnce] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);

  // Get the most recent score (stored in gameState after game ends)
  const score = gameState.highScore; // This would be the final score
  const previousHighScore = gameState.previousHighScore || 0;

  useEffect(() => {
    // Animate content in
    setTimeout(() => setShowContent(true), 300);
    
    // Check for new high score
    if (score > previousHighScore) {
      setIsNewHighScore(true);
    }
  }, [score, previousHighScore]);

  // ADDICTION MECHANIC: "Watch ad to continue" - creates second chance
  const handleContinue = () => {
    if (!continuedOnce) {
      setContinuedOnce(true);
      // In real implementation, show rewarded ad here
      // For now, just continue
      playSound('powerup');
      onContinue();
    }
  };

  // Share functionality for viral spread
  const handleShare = async () => {
    playSound('tap');
    const result = await shareScore(score, gameState.highScore);
    
    if (result === true) {
      setShareStatus('shared');
    } else if (result === 'copied') {
      setShareStatus('copied');
    } else {
      setShareStatus('failed');
    }
    
    setTimeout(() => setShareStatus(null), 2000);
  };

  return (
    <div className="game-over">
      {/* Background */}
      <div className="go-bg" />

      {/* Content */}
      <div className={`go-content ${showContent ? 'visible' : ''}`}>
        
        {/* Game Over Title */}
        <h1 className="go-title">GAME OVER</h1>

        {/* Score Display */}
        <div className="score-container">
          <div className="final-score">
            <span className="score-label">SCORE</span>
            <span className="score-number">{score.toLocaleString()}</span>
          </div>
          
          {isNewHighScore && (
            <div className="new-highscore">
              <span className="crown">👑</span>
              <span>NEW HIGH SCORE!</span>
            </div>
          )}
          
          <div className="best-score">
            <span className="best-label">BEST</span>
            <span className="best-number">{gameState.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats from this run */}
        <div className="run-stats">
          <div className="run-stat">
            <span className="rs-icon">💎</span>
            <span className="rs-value">+{gameState.lastCoinsEarned || 0}</span>
          </div>
          <div className="run-stat">
            <span className="rs-icon">⚡</span>
            <span className="rs-value">x{gameState.lastMaxCombo || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="go-buttons">
          
          {/* ADDICTION MECHANIC: Prominent restart button */}
          <button className="restart-btn" onClick={onRestart}>
            <span className="btn-icon">🔄</span>
            <span>PLAY AGAIN</span>
          </button>

          {/* Continue with ad (if not used) */}
          {!continuedOnce && !gameState.adsRemoved && (
            <button className="continue-btn" onClick={handleContinue}>
              <span className="btn-icon">▶️</span>
              <span>CONTINUE</span>
              <span className="ad-badge">FREE</span>
            </button>
          )}

          {/* Share button */}
          <button className="share-btn" onClick={handleShare}>
            <span className="btn-icon">📤</span>
            <span>
              {shareStatus === 'copied' ? 'COPIED!' : 
               shareStatus === 'shared' ? 'SHARED!' : 'SHARE'}
            </span>
          </button>

          {/* Menu button */}
          <button className="menu-btn" onClick={onMenu}>
            <span className="btn-icon">🏠</span>
            <span>MENU</span>
          </button>
        </div>

        {/* Tip / Motivational message */}
        <div className="motivational">
          {getMotivationalMessage(score, gameState.highScore)}
        </div>
      </div>
    </div>
  );
};

// ADDICTION MECHANIC: Motivational messages encourage retry
function getMotivationalMessage(score, highScore) {
  const messages = [
    "One more try! You've got this! 💪",
    "So close! Try again! 🔥",
    "Practice makes perfect! 🎯",
    "You're getting better! 📈",
    "Almost had it! 🎮",
    "Keep going! 🚀"
  ];
  
  const percentage = (score / Math.max(highScore, 1)) * 100;
  
  if (percentage >= 100) {
    return "🎉 Incredible! You beat your best! 🎉";
  } else if (percentage >= 80) {
    return "So close to your best! One more try! 🔥";
  } else if (percentage >= 50) {
    return "Great run! You can do even better! 💪";
  } else {
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export default GameOver;
