/**
 * GAME CONSTANTS - Configuration for all game systems
 * 
 * TUNING GUIDELINES:
 * - Lower INITIAL_SPEED makes game more accessible
 * - Higher COMBO_TIMEOUT makes combos easier to maintain
 * - Adjust spawn rates for difficulty
 */

export const GAME_CONFIG = {
  // Physics
  GRAVITY: 2000,
  JUMP_FORCE: -700,
  GROUND_HEIGHT: 80,
  
  // Game Speed
  INITIAL_SPEED: 4,
  MAX_SPEED: 12,
  
  // Scoring
  SCORE_PER_SECOND: 10,
  NEAR_MISS_BONUS: 50,
  
  // Combo System - ADDICTION MECHANIC
  COMBO_TIMEOUT: 2.5, // Seconds before combo decays
  MAX_COMBO_MULTIPLIER: 5,
  
  // Spawn Rates
  OBSTACLE_SPAWN_INTERVAL: 1.8, // Base seconds between obstacles
  COIN_SPAWN_INTERVAL: 2.0,
  COIN_SPAWN_CHANCE: 0.7,
  POWERUP_SPAWN_INTERVAL: 8.0,
  POWERUP_SPAWN_CHANCE: 0.6,
};

// ADDICTION MECHANIC: Difficulty increases feel natural
export const DIFFICULTY_CURVE = {
  LEVEL_INTERVAL: 10, // Seconds between difficulty increases
  SPEED_INCREMENT: 0.5, // Speed increase per level
  SPAWN_REDUCTION: 0.08, // Spawn interval reduction per level
};

// Power-up configurations
export const POWER_UPS = {
  shield: {
    name: 'Shield',
    icon: '🛡️',
    color: '#00ccff',
    duration: 5000, // 5 seconds
    description: 'Blocks one hit'
  },
  slowMotion: {
    name: 'Slow Motion',
    icon: '⏱️',
    color: '#00ff88',
    duration: 4000, // 4 seconds
    description: 'Slows down time'
  },
  multiplier: {
    name: 'Score x2',
    icon: '⭐',
    color: '#ffdd00',
    duration: 6000, // 6 seconds
    description: 'Double score'
  }
};

// Player skins - PROGRESSION/MONETIZATION
export const SKINS = [
  {
    id: 'default',
    name: 'Starter',
    color: '#8a2be2',
    colorLight: '#b366ff',
    r: 138, g: 43, b: 226,
    price: 0,
    owned: true
  },
  {
    id: 'neon_blue',
    name: 'Neon Blue',
    color: '#00aaff',
    colorLight: '#66ccff',
    r: 0, g: 170, b: 255,
    price: 100
  },
  {
    id: 'fire',
    name: 'Fire',
    color: '#ff4400',
    colorLight: '#ff8844',
    r: 255, g: 68, b: 0,
    price: 150
  },
  {
    id: 'gold',
    name: 'Golden',
    color: '#ffd700',
    colorLight: '#ffec8b',
    r: 255, g: 215, b: 0,
    price: 300
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    color: '#ff00ff',
    colorLight: '#ff66ff',
    r: 255, g: 0, b: 255,
    price: 500,
    special: true
  },
  {
    id: 'void',
    name: 'Void',
    color: '#1a0033',
    colorLight: '#4a0066',
    r: 26, g: 0, b: 51,
    price: 750,
    special: true
  },
  {
    id: 'diamond',
    name: 'Diamond',
    color: '#00ffff',
    colorLight: '#88ffff',
    r: 0, g: 255, b: 255,
    price: 1000,
    legendary: true
  }
];

// Achievements - ADDICTION MECHANIC: Goals create purpose
export const ACHIEVEMENTS = [
  // Survival achievements
  { id: 'survive_30', name: 'First Steps', description: 'Survive 30 seconds', type: 'survival', target: 30, reward: 25 },
  { id: 'survive_60', name: 'Getting Started', description: 'Survive 1 minute', type: 'survival', target: 60, reward: 50 },
  { id: 'survive_120', name: 'Endurance', description: 'Survive 2 minutes', type: 'survival', target: 120, reward: 100 },
  { id: 'survive_300', name: 'Marathon', description: 'Survive 5 minutes', type: 'survival', target: 300, reward: 250 },
  
  // Score achievements
  { id: 'score_1000', name: 'Scorer', description: 'Score 1,000 points', type: 'score', target: 1000, reward: 25 },
  { id: 'score_5000', name: 'High Scorer', description: 'Score 5,000 points', type: 'score', target: 5000, reward: 75 },
  { id: 'score_10000', name: 'Master', description: 'Score 10,000 points', type: 'score', target: 10000, reward: 150 },
  { id: 'score_50000', name: 'Legend', description: 'Score 50,000 points', type: 'score', target: 50000, reward: 500 },
  
  // Combo achievements
  { id: 'combo_5', name: 'Combo Starter', description: 'Get a 5x combo', type: 'combo', target: 5, reward: 30 },
  { id: 'combo_10', name: 'Combo Master', description: 'Get a 10x combo', type: 'combo', target: 10, reward: 75 },
  { id: 'combo_20', name: 'Combo King', description: 'Get a 20x combo', type: 'combo', target: 20, reward: 200 },
  
  // Collection achievements
  { id: 'coins_100', name: 'Collector', description: 'Collect 100 coins total', type: 'totalCoins', target: 100, reward: 25 },
  { id: 'coins_1000', name: 'Treasure Hunter', description: 'Collect 1,000 coins total', type: 'totalCoins', target: 1000, reward: 100 },
  { id: 'coins_10000', name: 'Rich', description: 'Collect 10,000 coins total', type: 'totalCoins', target: 10000, reward: 300 },
  
  // Near miss achievements
  { id: 'nearmiss_10', name: 'Risk Taker', description: 'Get 10 near misses', type: 'nearMisses', target: 10, reward: 40 },
  { id: 'nearmiss_50', name: 'Daredevil', description: 'Get 50 near misses', type: 'nearMisses', target: 50, reward: 100 },
  
  // Games played
  { id: 'games_10', name: 'Dedicated', description: 'Play 10 games', type: 'totalGames', target: 10, reward: 20 },
  { id: 'games_100', name: 'Addicted', description: 'Play 100 games', type: 'totalGames', target: 100, reward: 150 },
  { id: 'games_500', name: 'No Life', description: 'Play 500 games', type: 'totalGames', target: 500, reward: 500 }
];

// Daily reward schedule - ADDICTION MECHANIC: Daily engagement hooks
export const DAILY_REWARDS = [
  { day: 1, coins: 25, special: null },
  { day: 2, coins: 50, special: null },
  { day: 3, coins: 75, special: null },
  { day: 4, coins: 100, special: null },
  { day: 5, coins: 150, special: null },
  { day: 6, coins: 200, special: null },
  { day: 7, coins: 500, special: 'mystery_box' },
];

// Shop items - MONETIZATION
export const SHOP_ITEMS = {
  coins: [
    { id: 'coins_100', amount: 100, price: '$0.99', priceValue: 0.99 },
    { id: 'coins_500', amount: 500, price: '$3.99', priceValue: 3.99, bonus: '10% bonus' },
    { id: 'coins_1500', amount: 1500, price: '$9.99', priceValue: 9.99, bonus: '25% bonus', popular: true },
    { id: 'coins_5000', amount: 5000, price: '$24.99', priceValue: 24.99, bonus: '50% bonus', bestValue: true },
  ],
  removeAds: {
    id: 'remove_ads',
    name: 'Remove Ads',
    price: '$2.99',
    priceValue: 2.99,
    description: 'Remove all ads forever'
  }
};

// Level system - PROGRESSION
export const LEVEL_CONFIG = {
  BASE_XP: 100,
  XP_MULTIPLIER: 1.5,
  SCORE_TO_XP_RATIO: 0.1,
  MAX_LEVEL: 100
};

// Calculate XP required for a level
export const getXPForLevel = (level) => {
  return Math.floor(LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.XP_MULTIPLIER, level - 1));
};

// Limited time offers - MONETIZATION / URGENCY
export const LIMITED_OFFERS = [
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    originalPrice: '$9.99',
    discountPrice: '$4.99',
    discount: 50,
    contents: ['500 Coins', 'Neon Blue Skin'],
    duration: 24 * 60 * 60 * 1000 // 24 hours
  },
  {
    id: 'mega_bundle',
    name: 'Mega Bundle',
    originalPrice: '$29.99',
    discountPrice: '$14.99',
    discount: 50,
    contents: ['2000 Coins', 'Rainbow Skin', 'Remove Ads'],
    duration: 48 * 60 * 60 * 1000 // 48 hours
  }
];
