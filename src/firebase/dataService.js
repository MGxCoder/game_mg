/**
 * FIREBASE DATA SERVICE
 * 
 * Handles all Firestore operations:
 * - User game data (save/load)
 * - Leaderboard (global scores)
 * - Achievements sync
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  where,
  increment
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './authService';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  LEADERBOARD: 'leaderboard',
  GLOBAL_STATS: 'globalStats'
};

/**
 * SAVE GAME DATA
 * Saves complete game state to Firestore
 */
export async function saveGameData(gameState) {
  const user = getCurrentUser();
  if (!user) {
    console.warn('No user signed in, cannot save to cloud');
    return false;
  }

  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    
    // Prepare data for saving
    const dataToSave = {
      ...gameState,
      lastUpdated: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName || `Player_${user.uid.slice(0, 6)}`,
      isAnonymous: user.isAnonymous
    };

    await setDoc(userRef, dataToSave, { merge: true });
    console.log('Game saved to cloud');
    return true;
  } catch (error) {
    console.error('Error saving game data:', error);
    return false;
  }
}

/**
 * LOAD GAME DATA
 * Loads game state from Firestore
 */
export async function loadGameData() {
  const user = getCurrentUser();
  if (!user) {
    console.warn('No user signed in, cannot load from cloud');
    return null;
  }

  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove Firestore-specific fields before returning
      const { lastUpdated, userId, displayName, isAnonymous, ...gameState } = data;
      console.log('Game loaded from cloud');
      return gameState;
    }
    
    console.log('No cloud save found');
    return null;
  } catch (error) {
    console.error('Error loading game data:', error);
    return null;
  }
}

/**
 * UPDATE HIGH SCORE
 * Atomic update for high score (also updates leaderboard)
 */
export async function updateHighScore(score, playerName) {
  const user = getCurrentUser();
  if (!user) return false;

  try {
    // Update user's high score
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await updateDoc(userRef, {
      highScore: score,
      lastUpdated: serverTimestamp()
    });

    // Update leaderboard entry
    const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, user.uid);
    await setDoc(leaderboardRef, {
      userId: user.uid,
      displayName: playerName || user.displayName || `Player_${user.uid.slice(0, 6)}`,
      score: score,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating high score:', error);
    return false;
  }
}

/**
 * GET LEADERBOARD
 * Fetches top players globally
 */
export async function getLeaderboard(limitCount = 100) {
  try {
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD);
    const q = query(
      leaderboardRef, 
      orderBy('score', 'desc'), 
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const leaderboard = [];
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboard.push({
        rank: leaderboard.length + 1,
        id: doc.id,
        name: data.displayName,
        score: data.score,
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * GET PLAYER RANK
 * Gets current player's rank on leaderboard
 */
export async function getPlayerRank(score) {
  try {
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD);
    const q = query(
      leaderboardRef,
      where('score', '>', score)
    );

    const snapshot = await getDocs(q);
    return snapshot.size + 1; // Rank is number of players with higher score + 1
  } catch (error) {
    console.error('Error getting player rank:', error);
    return null;
  }
}

/**
 * UPDATE GLOBAL STATS
 * Track global game statistics (optional)
 */
export async function updateGlobalStats(gamesPlayed = 1) {
  try {
    const statsRef = doc(db, COLLECTIONS.GLOBAL_STATS, 'stats');
    await updateDoc(statsRef, {
      totalGames: increment(gamesPlayed),
      lastUpdated: serverTimestamp()
    }).catch(async () => {
      // Create if doesn't exist
      await setDoc(statsRef, {
        totalGames: gamesPlayed,
        lastUpdated: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating global stats:', error);
  }
}

/**
 * SYNC LOCAL TO CLOUD
 * Merges local data with cloud data (cloud wins for scores, local for preferences)
 */
export async function syncWithCloud(localState) {
  const cloudState = await loadGameData();
  
  if (!cloudState) {
    // No cloud data, save local to cloud
    await saveGameData(localState);
    return localState;
  }

  // Merge: higher scores from cloud, merge achievements, keep newer timestamps
  const mergedState = {
    ...localState,
    ...cloudState,
    // Always take higher score
    highScore: Math.max(localState.highScore || 0, cloudState.highScore || 0),
    // Take higher coin count
    coins: Math.max(localState.coins || 0, cloudState.coins || 0),
    // Take higher level
    level: Math.max(localState.level || 1, cloudState.level || 1),
    xp: Math.max(localState.xp || 0, cloudState.xp || 0),
    // Merge owned items
    ownedItems: [...new Set([
      ...(localState.ownedItems || []),
      ...(cloudState.ownedItems || [])
    ])],
    // Merge achievements
    achievements: {
      ...(localState.achievements || {}),
      ...(cloudState.achievements || {})
    }
  };

  // Save merged state
  await saveGameData(mergedState);
  return mergedState;
}
