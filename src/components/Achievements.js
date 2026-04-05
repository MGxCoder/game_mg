/**
 * ACHIEVEMENTS - Achievement display and progress
 * 
 * ADDICTION MECHANIC:
 * - Goals create purpose and direction
 * - Rewards for milestones
 * - Progress bars encourage completion
 */

import React, { useState, useMemo } from 'react';
import { ACHIEVEMENTS } from '../utils/constants';
import '../styles/Achievements.css';

const Achievements = ({ gameState, onBack }) => {
  const [filter, setFilter] = useState('all');

  // Calculate achievement progress
  const achievementsWithProgress = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let currentValue = 0;
      
      switch (achievement.type) {
        case 'survival':
          currentValue = gameState.totalTimePlayed || 0;
          break;
        case 'score':
          currentValue = gameState.highScore || 0;
          break;
        case 'combo':
          currentValue = gameState.maxCombo || 0;
          break;
        case 'totalCoins':
          currentValue = gameState.totalCoins || 0;
          break;
        case 'nearMisses':
          currentValue = gameState.totalNearMisses || 0;
          break;
        case 'totalGames':
          currentValue = gameState.totalGames || 0;
          break;
        default:
          currentValue = 0;
      }

      const progress = Math.min(100, (currentValue / achievement.target) * 100);
      const isUnlocked = gameState.unlockedAchievements?.includes(achievement.id);
      const isComplete = currentValue >= achievement.target;

      return {
        ...achievement,
        currentValue,
        progress,
        isUnlocked,
        isComplete
      };
    });
  }, [gameState]);

  const filteredAchievements = achievementsWithProgress.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'completed') return a.isComplete;
    if (filter === 'inProgress') return !a.isComplete;
    return true;
  });

  const completedCount = achievementsWithProgress.filter(a => a.isComplete).length;
  const totalCount = achievementsWithProgress.length;

  return (
    <div className="achievements">
      {/* Header */}
      <div className="ach-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>ACHIEVEMENTS</h1>
        <span className="ach-count">{completedCount}/{totalCount}</span>
      </div>

      {/* Progress summary */}
      <div className="ach-summary">
        <div className="summary-bar">
          <div 
            className="summary-fill"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="summary-text">
          {Math.round((completedCount / totalCount) * 100)}% Complete
        </span>
      </div>

      {/* Filters */}
      <div className="ach-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-btn ${filter === 'inProgress' ? 'active' : ''}`}
          onClick={() => setFilter('inProgress')}
        >
          In Progress
        </button>
      </div>

      {/* Achievement list */}
      <div className="ach-list">
        {filteredAchievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`ach-item ${achievement.isComplete ? 'complete' : ''} ${achievement.isUnlocked ? 'unlocked' : ''}`}
          >
            {/* Icon */}
            <div className="ach-icon">
              {achievement.isComplete ? '🏆' : getAchievementIcon(achievement.type)}
            </div>

            {/* Info */}
            <div className="ach-info">
              <span className="ach-name">{achievement.name}</span>
              <span className="ach-desc">{achievement.description}</span>
              
              {/* Progress bar */}
              {!achievement.isComplete && (
                <div className="ach-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {formatValue(achievement.currentValue, achievement.type)} / {formatValue(achievement.target, achievement.type)}
                  </span>
                </div>
              )}
            </div>

            {/* Reward */}
            <div className="ach-reward">
              <span className="coin-icon">💎</span>
              <span className="reward-amount">{achievement.reward}</span>
              {achievement.isComplete && !achievement.isUnlocked && (
                <span className="claim-badge">CLAIM</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getAchievementIcon(type) {
  const icons = {
    survival: '⏱️',
    score: '📊',
    combo: '⚡',
    totalCoins: '💎',
    nearMisses: '😰',
    totalGames: '🎮'
  };
  return icons[type] || '🎯';
}

function formatValue(value, type) {
  if (type === 'survival') {
    // Format seconds
    if (value >= 60) {
      return `${Math.floor(value / 60)}m ${Math.floor(value % 60)}s`;
    }
    return `${Math.floor(value)}s`;
  }
  return value.toLocaleString();
}

export default Achievements;
