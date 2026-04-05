/**
 * SETTINGS - Game settings and options
 */

import React, { useState } from 'react';
import { signInWithGoogle, linkAnonymousToGoogle, isAnonymous } from '../firebase';
import '../styles/Settings.css';

const Settings = ({ 
  gameState, 
  onToggleMusic, 
  onToggleSfx, 
  onBack,
  updateGameState,
  saveGame,
  user,
  isSyncing,
  forceCloudSync 
}) => {
  const [isLinking, setIsLinking] = useState(false);

  const handleToggle = (setting) => {
    updateGameState({ [setting]: !gameState[setting] });
    saveGame();
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure? This will delete ALL your progress!')) {
      if (window.confirm('This action cannot be undone. Really reset?')) {
        localStorage.removeItem('neon_surge_save');
        window.location.reload();
      }
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinking(true);
    try {
      if (isAnonymous()) {
        await linkAnonymousToGoogle();
      } else {
        await signInWithGoogle();
      }
      alert('Account linked successfully!');
    } catch (error) {
      console.error('Failed to link account:', error);
      alert('Failed to link account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleCloudSync = async () => {
    if (forceCloudSync) {
      const success = await forceCloudSync();
      if (success) {
        alert('Game synced to cloud!');
      } else {
        alert('Sync failed. Please try again.');
      }
    }
  };

  return (
    <div className="settings">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>SETTINGS</h1>
      </div>

      {/* Settings list */}
      <div className="settings-list">
        
        {/* Audio Section */}
        <div className="settings-section">
          <h2 className="section-title">Audio</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🎵</span>
              <span className="setting-name">Music</span>
            </div>
            <button 
              className={`toggle-btn ${gameState.musicEnabled ? 'on' : 'off'}`}
              onClick={() => { handleToggle('musicEnabled'); onToggleMusic(); }}
            >
              {gameState.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔊</span>
              <span className="setting-name">Sound Effects</span>
            </div>
            <button 
              className={`toggle-btn ${gameState.sfxEnabled ? 'on' : 'off'}`}
              onClick={() => { handleToggle('sfxEnabled'); onToggleSfx(); }}
            >
              {gameState.sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">📳</span>
              <span className="setting-name">Haptic Feedback</span>
            </div>
            <button 
              className={`toggle-btn ${gameState.hapticEnabled ? 'on' : 'off'}`}
              onClick={() => handleToggle('hapticEnabled')}
            >
              {gameState.hapticEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h2 className="section-title">Account</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">☁️</span>
              <span className="setting-name">Cloud Save</span>
            </div>
            <button 
              className={`sync-btn ${isSyncing ? 'syncing' : ''}`}
              onClick={handleCloudSync}
              disabled={isSyncing}
            >
              {isSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🔗</span>
              <span className="setting-name">
                {user && !user.isAnonymous ? 'Linked Account' : 'Connect Account'}
              </span>
            </div>
            {user && !user.isAnonymous ? (
              <span className="linked-status">✓ {user.email || 'Google'}</span>
            ) : (
              <button 
                className="link-btn"
                onClick={handleLinkGoogle}
                disabled={isLinking}
              >
                {isLinking ? '...' : '🔗 Google'}
              </button>
            )}
          </div>

          {user && (
            <div className="setting-item info">
              <div className="setting-info">
                <span className="setting-icon">👤</span>
                <span className="setting-name">Player ID</span>
              </div>
              <span className="player-id">{user.uid?.slice(0, 8)}...</span>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="settings-section">
          <h2 className="section-title">Support</h2>
          
          <div className="setting-item clickable" onClick={() => window.open('mailto:support@neonsurge.com')}>
            <div className="setting-info">
              <span className="setting-icon">📧</span>
              <span className="setting-name">Contact Support</span>
            </div>
            <span className="arrow">→</span>
          </div>

          <div className="setting-item clickable">
            <div className="setting-info">
              <span className="setting-icon">⭐</span>
              <span className="setting-name">Rate Us</span>
            </div>
            <span className="arrow">→</span>
          </div>

          <div className="setting-item clickable">
            <div className="setting-info">
              <span className="setting-icon">📜</span>
              <span className="setting-name">Privacy Policy</span>
            </div>
            <span className="arrow">→</span>
          </div>

          <div className="setting-item clickable">
            <div className="setting-info">
              <span className="setting-icon">📋</span>
              <span className="setting-name">Terms of Service</span>
            </div>
            <span className="arrow">→</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger">
          <h2 className="section-title">Danger Zone</h2>
          
          <button className="reset-btn" onClick={handleResetProgress}>
            🗑️ Reset All Progress
          </button>
        </div>
      </div>

      {/* Version info */}
      <div className="version-info">
        <span>Neon Surge v1.0.0</span>
        <span>Made with ❤️</span>
      </div>
    </div>
  );
};

export default Settings;
