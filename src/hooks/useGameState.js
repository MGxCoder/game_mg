/**
 * USE GAME STATE - Manages persistent game data
 * 
 * ADDICTION MECHANICS:
 * - Persistent progress creates investment
 * - Stats tracking enables achievements
 * - Cloud sync ensures no progress is lost
 * 
 * NOW WITH FIREBASE:
 * - Anonymous auth for seamless experience
 * - Firestore for cloud saves
 * - localStorage as fallback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SKINS, getXPForLevel } from '../utils/constants';
import { 
  signInAnon, 
  onAuthChange, 
  getCurrentUser,
  saveGameData, 
  loadGameData, 
  syncWithCloud,
  updateHighScore 
} from '../firebase';

const STORAGE_KEY = 'neon_surge_save';
const CLOUD_SYNC_INTERVAL = 30000; // Sync every 30 seconds

const DEFAULT_STATE = {
  // Currency
  coins: 0,
  
  // Progression
  level: 1,
  xp: 0,
  highScore: 0,
  
  // Stats
  totalGames: 0,
  totalScore: 0,
  totalCoins: 0,
  totalObstaclesDodged: 0,
  totalNearMisses: 0,
  maxCombo: 0,
  totalTimePlayed: 0,
  
  // Customization
  selectedSkin: 'default',
  ownedItems: ['default'],
  
  // Daily rewards
  dailyStreak: 0,
  lastDailyReward: null,
  
  // Achievements
  unlockedAchievements: [],
  
  // Settings
  musicEnabled: true,
  sfxEnabled: true,
  hapticEnabled: true,
  
  // Monetization
  adsRemoved: false,
  
  // First time user
  isFirstTime: true,
  gamesPlayedToday: 0,
  lastPlayDate: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);
  const pendingSaveRef = useRef(false);

  // Initialize Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // User signed in, try to sync with cloud
        try {
          setIsSyncing(true);
          const localData = loadFromLocalStorage();
          const syncedData = await syncWithCloud(localData || DEFAULT_STATE);
          if (syncedData) {
            setGameState(prev => ({
              ...DEFAULT_STATE,
              ...syncedData,
              ownedItems: syncedData.ownedItems?.includes('default')
                ? syncedData.ownedItems
                : ['default', ...(syncedData.ownedItems || [])]
            }));
          }
        } catch (error) {
          console.error('Cloud sync failed:', error);
        } finally {
          setIsSyncing(false);
          setIsLoaded(true);
        }
      }
    });

    // Sign in anonymously if no user
    const initAuth = async () => {
      if (!getCurrentUser()) {
        await signInAnon();
      }
    };
    initAuth();

    return () => unsubscribe();
  }, []);

  // Periodic cloud sync
  useEffect(() => {
    if (!user || !isLoaded) return;

    const syncInterval = setInterval(async () => {
      if (pendingSaveRef.current) {
        await saveToCloud(gameState);
        pendingSaveRef.current = false;
      }
    }, CLOUD_SYNC_INTERVAL);

    return () => clearInterval(syncInterval);
  }, [user, isLoaded, gameState]);

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  };

  // Save to localStorage
  const saveToLocalStorage = useCallback((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  // Save to cloud
  const saveToCloud = useCallback(async (state) => {
    if (!user) return false;
    try {
      await saveGameData(state);
      return true;
    } catch (error) {
      console.error('Failed to save to cloud:', error);
      return false;
    }
  }, [user]);

  // Load game state
  const loadGame = useCallback(async () => {
    try {
      // Try local first (faster)
      const localData = loadFromLocalStorage();
      if (localData) {
        setGameState(prev => ({
          ...DEFAULT_STATE,
          ...localData,
          ownedItems: localData.ownedItems?.includes('default')
            ? localData.ownedItems
            : ['default', ...(localData.ownedItems || [])]
        }));
      }
      
      // If we have a user, sync with cloud
      if (user) {
        const cloudData = await loadGameData();
        if (cloudData) {
          const merged = {
            ...DEFAULT_STATE,
            ...localData,
            ...cloudData,
            highScore: Math.max(localData?.highScore || 0, cloudData.highScore || 0),
            coins: Math.max(localData?.coins || 0, cloudData.coins || 0),
            ownedItems: [...new Set([
              ...(localData?.ownedItems || ['default']),
              ...(cloudData.ownedItems || [])
            ])]
          };
          setGameState(merged);
          saveToLocalStorage(merged);
        }
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load game state:', error);
      setIsLoaded(true);
    }
  }, [user, saveToLocalStorage]);

  // Save game state (to both local and cloud)
  const saveGame = useCallback(async () => {
    saveToLocalStorage(gameState);
    pendingSaveRef.current = true;
    
    // Immediate cloud save for important updates
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      saveToCloud(gameState);
      pendingSaveRef.current = false;
    }, 2000); // Debounce cloud saves
  }, [gameState, saveToLocalStorage, saveToCloud]);

  // Update game state with partial updates
  const updateGameState = useCallback((updates) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      
      // Calculate level from XP
      if (updates.xp !== undefined || updates.totalScore !== undefined) {
        let currentXP = newState.xp;
        let currentLevel = newState.level;
        let xpForNext = getXPForLevel(currentLevel);
        
        while (currentXP >= xpForNext && currentLevel < 100) {
          currentXP -= xpForNext;
          currentLevel++;
          xpForNext = getXPForLevel(currentLevel);
        }
        
        newState.level = currentLevel;
        newState.xp = currentXP;
      }
      
      // Update total coins if coins changed
      if (updates.coins !== undefined && updates.coins > prev.coins) {
        newState.totalCoins = (prev.totalCoins || 0) + (updates.coins - prev.coins);
      }

      // If high score updated, sync to leaderboard
      if (updates.highScore !== undefined && updates.highScore > prev.highScore) {
        const playerName = user?.displayName || `Player_${user?.uid?.slice(0, 6) || 'Anon'}`;
        updateHighScore(updates.highScore, playerName).catch(console.error);
      }
      
      return newState;
    });
  }, [user]);

  // Add XP from game score
  const addXP = useCallback((score) => {
    const xpGained = Math.floor(score * 0.1);
    updateGameState({
      xp: gameState.xp + xpGained
    });
  }, [gameState.xp, updateGameState]);

  // Check and unlock achievements
  const checkAchievements = useCallback((stats) => {
    // This would check all achievements against current stats
    // Returns array of newly unlocked achievements
    return [];
  }, []);

  // Get skin by ID
  const getSkin = useCallback((skinId) => {
    return SKINS.find(s => s.id === skinId) || SKINS[0];
  }, []);

  // Check if player owns a skin
  const ownsSkin = useCallback((skinId) => {
    return gameState.ownedItems.includes(skinId);
  }, [gameState.ownedItems]);

  // Reset all progress (for testing)
  const resetProgress = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(DEFAULT_STATE);
    // Also clear cloud data
    if (user) {
      await saveGameData(DEFAULT_STATE);
    }
  }, [user]);

  // Force cloud sync
  const forceCloudSync = useCallback(async () => {
    if (!user) return false;
    setIsSyncing(true);
    try {
      await saveToCloud(gameState);
      return true;
    } finally {
      setIsSyncing(false);
    }
  }, [user, gameState, saveToCloud]);

  return {
    gameState,
    updateGameState,
    saveGame,
    loadGame,
    addXP,
    checkAchievements,
    getSkin,
    ownsSkin,
    resetProgress,
    isLoaded,
    // Cloud-related
    user,
    isSyncing,
    forceCloudSync
  };
}
