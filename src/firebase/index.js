/**
 * FIREBASE SERVICES INDEX
 */

export { db, auth } from './config';
export { 
  signInAnon, 
  signInWithGoogle, 
  linkAnonymousToGoogle, 
  logOut, 
  onAuthChange,
  getCurrentUser,
  isAnonymous 
} from './authService';
export { 
  saveGameData, 
  loadGameData, 
  updateHighScore, 
  getLeaderboard, 
  getPlayerRank,
  syncWithCloud 
} from './dataService';
