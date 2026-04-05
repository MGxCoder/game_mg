/**
 * DAILY REWARDS - Check and manage daily reward system
 * 
 * ADDICTION MECHANIC:
 * - Daily login rewards create habit
 * - Streak system adds loss aversion
 * - Increasing rewards encourage return visits
 */

import { DAILY_REWARDS } from './constants';

// Re-export for components that need the data
export { DAILY_REWARDS };

const ONE_DAY = 24 * 60 * 60 * 1000;

export function checkDailyReward(lastClaimed) {
  const now = Date.now();
  
  // First time player
  if (!lastClaimed) {
    return {
      available: true,
      day: 1,
      reward: DAILY_REWARDS[0]
    };
  }
  
  const timeSinceLastClaim = now - lastClaimed;
  const daysSinceLastClaim = Math.floor(timeSinceLastClaim / ONE_DAY);
  
  // Same day - already claimed
  if (daysSinceLastClaim < 1) {
    return {
      available: false,
      nextIn: ONE_DAY - timeSinceLastClaim
    };
  }
  
  return {
    available: true,
    // Reset streak if more than 2 days
    streakReset: daysSinceLastClaim > 2
  };
}

export function getDailyReward(streak) {
  const day = ((streak - 1) % 7) + 1;
  const reward = DAILY_REWARDS[day - 1];
  
  // Bonus multiplier for long streaks
  const streakBonus = Math.floor(streak / 7);
  const totalCoins = reward.coins + (streakBonus * 25);
  
  return {
    day,
    coins: totalCoins,
    special: reward.special,
    streak,
    isWeekComplete: day === 7
  };
}

export function formatTimeUntilReward(milliseconds) {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  return `${hours}h ${minutes}m`;
}
