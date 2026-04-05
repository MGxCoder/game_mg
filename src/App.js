/**
 * NEON SURGE - Highly Addictive Mobile-First Casual Game
 * 
 * ADDICTION MECHANICS OVERVIEW:
 * 1. Quick Restart Loop - Death to gameplay in <1 second
 * 2. Progressive Difficulty - Speed increases gradually
 * 3. Near-Miss System - Audio/visual feedback when barely surviving
 * 4. Juice Effects - Screen shake, particles, glow effects
 * 5. Combo System - Consecutive dodges multiply score
 * 6. Random Rewards - Unpredictable loot drops
 * 7. Daily Rewards - Streak system for retention
 * 8. Loss Aversion - "Continue" option after death
 */

import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import Shop from './components/Shop';
import DailyReward from './components/DailyReward';
import Achievements from './components/Achievements';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import LoadingScreen from './components/LoadingScreen';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { checkDailyReward } from './utils/dailyRewards';
import './styles/App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [showDailyReward, setShowDailyReward] = useState(false);
  const { 
    gameState, 
    updateGameState, 
    saveGame, 
    loadGame,
    user,
    isSyncing,
    forceCloudSync 
  } = useGameState();
  const { playSound, toggleMusic, toggleSfx } = useAudio();

  // Initial load - check for daily rewards
  useEffect(() => {
    const initGame = async () => {
      await loadGame();
      
      // Simulate minimal loading for smooth experience
      setTimeout(() => {
        setCurrentScreen('menu');
        
        // Check daily reward after menu loads
        setTimeout(() => {
          const dailyReward = checkDailyReward(gameState.lastDailyReward);
          if (dailyReward.available) {
            setShowDailyReward(true);
          }
        }, 500);
      }, 1500);
    };
    
    initGame();
  }, []);

  // ADDICTION MECHANIC: Quick restart - instant transition back to game
  const handleQuickRestart = useCallback(() => {
    playSound('tap');
    setCurrentScreen('game');
  }, [playSound]);

  const handleStartGame = useCallback(() => {
    playSound('start');
    setCurrentScreen('game');
  }, [playSound]);

  const handleGameOver = useCallback((finalScore, coins, stats) => {
    playSound('death');
    updateGameState({
      coins: gameState.coins + coins,
      highScore: Math.max(gameState.highScore, finalScore),
      totalGames: gameState.totalGames + 1,
      totalScore: gameState.totalScore + finalScore,
      ...stats
    });
    saveGame();
    setCurrentScreen('gameover');
  }, [gameState, updateGameState, saveGame, playSound]);

  const handleCollectDailyReward = useCallback((reward) => {
    playSound('reward');
    updateGameState({
      coins: gameState.coins + reward.coins,
      dailyStreak: reward.streak,
      lastDailyReward: Date.now()
    });
    saveGame();
    setShowDailyReward(false);
  }, [gameState, updateGameState, saveGame, playSound]);

  const handlePurchase = useCallback((item) => {
    if (gameState.coins >= item.price) {
      playSound('purchase');
      updateGameState({
        coins: gameState.coins - item.price,
        ownedItems: [...gameState.ownedItems, item.id]
      });
      saveGame();
      return true;
    }
    playSound('error');
    return false;
  }, [gameState, updateGameState, saveGame, playSound]);

  const handleSelectSkin = useCallback((skinId) => {
    playSound('tap');
    updateGameState({ selectedSkin: skinId });
    saveGame();
  }, [updateGameState, saveGame, playSound]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
      
      case 'menu':
        return (
          <MainMenu
            gameState={gameState}
            onStartGame={handleStartGame}
            onOpenShop={() => { playSound('tap'); setCurrentScreen('shop'); }}
            onOpenAchievements={() => { playSound('tap'); setCurrentScreen('achievements'); }}
            onOpenLeaderboard={() => { playSound('tap'); setCurrentScreen('leaderboard'); }}
            onOpenSettings={() => { playSound('tap'); setCurrentScreen('settings'); }}
          />
        );
      
      case 'game':
        return (
          <GameCanvas
            gameState={gameState}
            onGameOver={handleGameOver}
            playSound={playSound}
          />
        );
      
      case 'gameover':
        return (
          <GameOver
            gameState={gameState}
            onRestart={handleQuickRestart}
            onMenu={() => { playSound('tap'); setCurrentScreen('menu'); }}
            onContinue={() => { /* Ad integration point */ handleQuickRestart(); }}
            playSound={playSound}
          />
        );
      
      case 'shop':
        return (
          <Shop
            gameState={gameState}
            onPurchase={handlePurchase}
            onSelectSkin={handleSelectSkin}
            onBack={() => { playSound('tap'); setCurrentScreen('menu'); }}
          />
        );
      
      case 'achievements':
        return (
          <Achievements
            gameState={gameState}
            onBack={() => { playSound('tap'); setCurrentScreen('menu'); }}
          />
        );
      
      case 'leaderboard':
        return (
          <Leaderboard
            gameState={gameState}
            onBack={() => { playSound('tap'); setCurrentScreen('menu'); }}
          />
        );
      
      case 'settings':
        return (
          <Settings
            gameState={gameState}
            onToggleMusic={toggleMusic}
            onToggleSfx={toggleSfx}
            onBack={() => { playSound('tap'); setCurrentScreen('menu'); }}
            updateGameState={updateGameState}
            saveGame={saveGame}
            user={user}
            isSyncing={isSyncing}
            forceCloudSync={forceCloudSync}
          />
        );
      
      default:
        return <MainMenu onStartGame={handleStartGame} />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
      
      {/* Daily Reward Modal - ADDICTION MECHANIC: Retention through daily engagement */}
      {showDailyReward && (
        <DailyReward
          streak={gameState.dailyStreak}
          onCollect={handleCollectDailyReward}
          onClose={() => setShowDailyReward(false)}
        />
      )}
    </div>
  );
}

export default App;
