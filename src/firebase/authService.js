/**
 * FIREBASE AUTH SERVICE
 * 
 * Anonymous authentication for seamless game experience
 * User can optionally link to Google/Email later
 */

import { 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from './config';

// Sign in anonymously (auto-creates user)
export async function signInAnon() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    return null;
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }
}

// Link anonymous account to Google (preserve game data)
export async function linkAnonymousToGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await linkWithPopup(auth.currentUser, provider);
    return result.user;
  } catch (error) {
    console.error('Account linking error:', error);
    return null;
  }
}

// Sign out
export async function logOut() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
}

// Listen to auth state changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Check if user is anonymous
export function isAnonymous() {
  return auth.currentUser?.isAnonymous ?? true;
}
