/**
 * LOADING SCREEN - Initial game loading
 * 
 * DESIGN: Quick, visually appealing, doesn't frustrate
 */

import React, { useState, useEffect } from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState('');

  const tips = [
    "Tap to jump over obstacles!",
    "Collect power-ups for special abilities!",
    "Near misses give bonus points!",
    "Build combos for higher scores!",
    "Daily rewards reset at midnight!",
    "Higher combos = more coins!",
    "Shield protects from one hit!",
    "Slow motion gives you more time!",
  ];

  useEffect(() => {
    // Set random tip
    setTip(tips[Math.floor(Math.random() * tips.length)]);

    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loading-screen">
      {/* Background effects */}
      <div className="loading-bg">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="loading-particle"
            style={{ 
              '--delay': `${i * 0.2}s`,
              '--x': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 10 + 5}px`
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="loading-logo">
        <h1 className="logo-text">
          <span className="logo-neon">NEON</span>
          <span className="logo-surge">SURGE</span>
        </h1>
        <div className="logo-glow" />
      </div>

      {/* Loading bar */}
      <div className="loading-bar-container">
        <div className="loading-bar">
          <div 
            className="loading-fill"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="loading-percent">{Math.min(100, Math.floor(progress))}%</span>
      </div>

      {/* Tip */}
      <div className="loading-tip">
        <span className="tip-icon">💡</span>
        <span className="tip-text">{tip}</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
