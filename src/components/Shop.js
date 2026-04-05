/**
 * SHOP - In-game store for skins and purchases
 * 
 * MONETIZATION:
 * - Clear pricing display
 * - "Best Value" badges
 * - Visual skin previews
 */

import React, { useState } from 'react';
import { SKINS, SHOP_ITEMS, LIMITED_OFFERS } from '../utils/constants';
import '../styles/Shop.css';

const Shop = ({ gameState, onPurchase, onSelectSkin, onBack }) => {
  const [activeTab, setActiveTab] = useState('skins');
  const [selectedSkin, setSelectedSkin] = useState(gameState.selectedSkin);
  const [showOffer, setShowOffer] = useState(true);
  const [purchaseAnimation, setPurchaseAnimation] = useState(null);

  const handleSkinPurchase = (skin) => {
    if (gameState.ownedItems.includes(skin.id)) {
      // Already owned, just select it
      setSelectedSkin(skin.id);
      onSelectSkin(skin.id);
    } else {
      // Try to purchase
      const success = onPurchase({ id: skin.id, price: skin.price });
      if (success) {
        setPurchaseAnimation(skin.id);
        setTimeout(() => {
          setPurchaseAnimation(null);
          setSelectedSkin(skin.id);
          onSelectSkin(skin.id);
        }, 500);
      }
    }
  };

  const handleSelectSkin = (skin) => {
    if (gameState.ownedItems.includes(skin.id)) {
      setSelectedSkin(skin.id);
      onSelectSkin(skin.id);
    }
  };

  return (
    <div className="shop">
      {/* Header */}
      <div className="shop-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>SHOP</h1>
        <div className="coins-display">
          <span className="coin-icon">💎</span>
          <span>{gameState.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Limited Offer Banner (URGENCY) */}
      {showOffer && (
        <div className="limited-offer">
          <div className="offer-content">
            <span className="offer-badge">LIMITED TIME!</span>
            <span className="offer-name">{LIMITED_OFFERS[0].name}</span>
            <div className="offer-prices">
              <span className="original-price">{LIMITED_OFFERS[0].originalPrice}</span>
              <span className="discount-price">{LIMITED_OFFERS[0].discountPrice}</span>
            </div>
            <span className="discount-badge">-{LIMITED_OFFERS[0].discount}%</span>
          </div>
          <button className="close-offer" onClick={() => setShowOffer(false)}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="shop-tabs">
        <button 
          className={`tab ${activeTab === 'skins' ? 'active' : ''}`}
          onClick={() => setActiveTab('skins')}
        >
          Skins
        </button>
        <button 
          className={`tab ${activeTab === 'coins' ? 'active' : ''}`}
          onClick={() => setActiveTab('coins')}
        >
          Coins
        </button>
        <button 
          className={`tab ${activeTab === 'other' ? 'active' : ''}`}
          onClick={() => setActiveTab('other')}
        >
          Other
        </button>
      </div>

      {/* Content */}
      <div className="shop-content">
        {activeTab === 'skins' && (
          <div className="skins-grid">
            {SKINS.map(skin => {
              const isOwned = gameState.ownedItems.includes(skin.id);
              const isSelected = selectedSkin === skin.id;
              const isAnimating = purchaseAnimation === skin.id;
              
              return (
                <div 
                  key={skin.id}
                  className={`skin-card ${isOwned ? 'owned' : ''} ${isSelected ? 'selected' : ''} ${isAnimating ? 'purchasing' : ''} ${skin.legendary ? 'legendary' : ''} ${skin.special ? 'special' : ''}`}
                  onClick={() => isOwned ? handleSelectSkin(skin) : handleSkinPurchase(skin)}
                >
                  {/* Preview */}
                  <div 
                    className="skin-preview"
                    style={{ 
                      backgroundColor: skin.color,
                      boxShadow: `0 0 20px ${skin.color}`
                    }}
                  >
                    <div className="preview-eyes">
                      <span className="preview-eye" />
                      <span className="preview-eye" />
                    </div>
                  </div>
                  
                  {/* Name */}
                  <span className="skin-name">{skin.name}</span>
                  
                  {/* Price or status */}
                  <div className="skin-status">
                    {isOwned ? (
                      isSelected ? (
                        <span className="equipped">EQUIPPED</span>
                      ) : (
                        <span className="owned-badge">OWNED</span>
                      )
                    ) : (
                      <span className="price">
                        <span className="coin-icon">💎</span>
                        {skin.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Badges */}
                  {skin.legendary && <div className="legendary-badge">⭐ LEGENDARY</div>}
                  {skin.special && <div className="special-badge">✨ SPECIAL</div>}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'coins' && (
          <div className="coins-grid">
            {SHOP_ITEMS.coins.map(item => (
              <div 
                key={item.id}
                className={`coin-package ${item.popular ? 'popular' : ''} ${item.bestValue ? 'best-value' : ''}`}
              >
                {item.popular && <div className="popular-badge">MOST POPULAR</div>}
                {item.bestValue && <div className="best-value-badge">BEST VALUE</div>}
                
                <div className="package-coins">
                  <span className="coin-icon">💎</span>
                  <span className="coin-amount">{item.amount.toLocaleString()}</span>
                </div>
                
                {item.bonus && <span className="bonus-text">{item.bonus}</span>}
                
                <button className="buy-btn">
                  BUY {item.price}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'other' && (
          <div className="other-items">
            {/* Remove Ads */}
            <div className={`shop-item ${gameState.adsRemoved ? 'purchased' : ''}`}>
              <div className="item-icon">🚫</div>
              <div className="item-info">
                <span className="item-name">{SHOP_ITEMS.removeAds.name}</span>
                <span className="item-desc">{SHOP_ITEMS.removeAds.description}</span>
              </div>
              <button className="buy-btn" disabled={gameState.adsRemoved}>
                {gameState.adsRemoved ? 'OWNED' : SHOP_ITEMS.removeAds.price}
              </button>
            </div>

            {/* Double Coins (future feature) */}
            <div className="shop-item coming-soon">
              <div className="item-icon">⚡</div>
              <div className="item-info">
                <span className="item-name">Double Coins</span>
                <span className="item-desc">2x coins forever</span>
              </div>
              <span className="coming-soon-badge">COMING SOON</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
