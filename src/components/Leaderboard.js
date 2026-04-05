/**
 * LEADERBOARD - Global leaderboard with Firebase
 * 
 * SOCIAL/VIRAL:
 * - Competition drives engagement
 * - Real-time global rankings
 * - Player rank tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getLeaderboard, getPlayerRank, getCurrentUser } from '../firebase';
import '../styles/Leaderboard.css';

const Leaderboard = ({ gameState, onBack }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch real leaderboard from Firebase
      const data = await getLeaderboard(50);
      const currentUser = getCurrentUser();
      
      // Mark current player's entry
      const processedData = data.map(entry => ({
        ...entry,
        isPlayer: entry.id === currentUser?.uid
      }));

      // Check if player is in leaderboard
      const playerInList = processedData.some(e => e.isPlayer);
      
      // Get player's rank if not in top list
      if (!playerInList && gameState.highScore > 0) {
        const rank = await getPlayerRank(gameState.highScore);
        setPlayerRank(rank);
        
        // Add player to end of list for visibility
        processedData.push({
          rank: rank,
          id: currentUser?.uid || 'local',
          name: 'You',
          score: gameState.highScore,
          isPlayer: true
        });
      } else {
        const playerEntry = processedData.find(e => e.isPlayer);
        if (playerEntry) {
          setPlayerRank(playerEntry.rank);
        }
      }

      setLeaderboardData(processedData);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
      
      // Fallback: show player's score only
      setLeaderboardData([{
        rank: 1,
        name: 'You',
        score: gameState.highScore,
        isPlayer: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [gameState.highScore]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="leaderboard">
      {/* Header */}
      <div className="lb-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>LEADERBOARD</h1>
      </div>

      {/* Tabs */}
      <div className="lb-tabs">
        <button 
          className={`tab ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Global
        </button>
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👥 Friends
        </button>
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          📅 Weekly
        </button>
      </div>

      {/* Player's rank */}
      {playerRank && (
        <div className="player-rank">
          <span className="rank-label">Your Rank</span>
          <span className="rank-value">#{playerRank}</span>
          <span className="rank-score">{gameState.highScore.toLocaleString()} pts</span>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="lb-list">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading rankings...</span>
          </div>
        ) : activeTab === 'friends' ? (
          <div className="no-friends">
            <span className="nf-icon">👥</span>
            <span className="nf-title">No Friends Yet</span>
            <span className="nf-desc">Challenge friends to see them here!</span>
            <button className="invite-btn">
              📤 Invite Friends
            </button>
          </div>
        ) : (
          leaderboardData.map((entry, index) => (
            <div 
              key={index}
              className={`lb-entry ${entry.isPlayer ? 'player' : ''} ${entry.rank <= 3 ? 'top-three' : ''}`}
            >
              {/* Rank */}
              <div className="entry-rank">
                {entry.rank === 1 && <span className="medal">🥇</span>}
                {entry.rank === 2 && <span className="medal">🥈</span>}
                {entry.rank === 3 && <span className="medal">🥉</span>}
                {entry.rank > 3 && <span className="rank-num">#{entry.rank}</span>}
              </div>

              {/* Avatar placeholder */}
              <div className={`entry-avatar ${entry.isPlayer ? 'you' : ''}`}>
                {entry.isPlayer ? '😎' : '👤'}
              </div>

              {/* Name */}
              <div className="entry-name">
                {entry.name}
                {entry.isPlayer && <span className="you-badge">YOU</span>}
              </div>

              {/* Score */}
              <div className="entry-score">
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Challenge button */}
      {activeTab === 'global' && (
        <div className="challenge-section">
          <button className="challenge-btn" onClick={fetchLeaderboard}>
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="lb-error">
          <span>{error}</span>
          <button onClick={fetchLeaderboard}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
