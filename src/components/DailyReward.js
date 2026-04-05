/**
 * DAILY REWARD - Daily login reward popup
 * 
 * ADDICTION MECHANIC:
 * - Creates daily habit
 * - Streak system adds commitment
 * - Escalating rewards encourage return
 */

import React, { useState, useEffect } from 'react';
import { getDailyReward, DAILY_REWARDS } from '../utils/dailyRewards';
import '../styles/DailyReward.css';

const DailyReward = ({ streak, onCollect, onClose }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const reward = getDailyReward(streak + 1); // Next day's reward

  useEffect(() => {
    // Animate in
    setTimeout(() => setShowReward(true), 100);
  }, []);

  const handleCollect = () => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    
    // Play collection animation
    setTimeout(() => {
      onCollect({
        coins: reward.coins,
        streak: streak + 1
      });
    }, 500);
  };

  return (
    <div className="daily-reward-overlay" onClick={onClose}>
      <div 
        className={`daily-reward-modal ${showReward ? 'visible' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="dr-title">DAILY REWARD</h2>
        
        {/* Streak display */}
        <div className="streak-display">
          <span className="streak-icon">🔥</span>
          <span className="streak-count">{streak + 1} Day Streak</span>
        </div>

        {/* Weekly calendar */}
        <div className="reward-calendar">
          {DAILY_REWARDS.map((day, index) => {
            const dayNum = index + 1;
            const isCurrent = dayNum === reward.day;
            const isPast = dayNum < reward.day;
            const isFuture = dayNum > reward.day;
            
            return (
              <div 
                key={dayNum}
                className={`calendar-day ${isCurrent ? 'current' : ''} ${isPast ? 'collected' : ''} ${isFuture ? 'locked' : ''}`}
              >
                <span className="day-label">Day {dayNum}</span>
                <div className="day-reward">
                  {day.special ? (
                    <span className="special-icon">🎁</span>
                  ) : (
                    <>
                      <span className="coin-icon">💎</span>
                      <span className="coin-amount">{day.coins}</span>
                    </>
                  )}
                </div>
                {isPast && <span className="check-mark">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Today's reward highlight */}
        <div className={`todays-reward ${isCollecting ? 'collecting' : ''}`}>
          <span className="reward-label">TODAY'S REWARD</span>
          <div className="reward-amount">
            <span className="coin-icon">💎</span>
            <span className="amount">{reward.coins}</span>
          </div>
          {reward.isWeekComplete && (
            <span className="bonus-text">+ Mystery Box! 🎁</span>
          )}
        </div>

        {/* Collect button */}
        <button 
          className={`collect-btn ${isCollecting ? 'collecting' : ''}`}
          onClick={handleCollect}
          disabled={isCollecting}
        >
          {isCollecting ? 'COLLECTING...' : 'COLLECT'}
        </button>

        {/* Motivational text */}
        <p className="dr-motivation">
          Come back tomorrow for more rewards!
        </p>
      </div>
    </div>
  );
};

export default DailyReward;
