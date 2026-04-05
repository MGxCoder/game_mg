/**
 * FIREBASE CONFIGURATION
 * 
 * Neon Surge Game - Firebase Setup
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCdftxPlxr8Bi-9LnlaIW4hl5cTE2dKHrc",
  authDomain: "neon-2bc9b.firebaseapp.com",
  projectId: "neon-2bc9b",
  storageBucket: "neon-2bc9b.firebasestorage.app",
  messagingSenderId: "483116107632",
  appId: "1:483116107632:web:9d16d2d6e3231bff8471b5",
  measurementId: "G-Y88K5BKKFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
