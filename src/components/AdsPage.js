/**
 * ADS PAGE - Google Ads display page
 */

import React, { useEffect } from 'react';
import '../styles/AdsPage.css';

const AdsPage = ({ onBack }) => {
  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      // Replace with your AdSense publisher ID
      script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="ads-page">
      <div className="ads-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1 className="ads-title">Support Us</h1>
      </div>

      <div className="ads-content">
        <div className="ads-message">
          <span className="ads-icon">🎮</span>
          <h2>Watch Ads, Earn Rewards!</h2>
          <p>Support Neon Surge by viewing ads and earn bonus coins!</p>
        </div>

        {/* Banner Ad Slot */}
        <div className="ad-container banner-ad">
          <div className="ad-placeholder">
            {/* Google AdSense Banner Ad */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
          <span className="ad-label">Advertisement</span>
        </div>

        {/* Rewarded Ad Section */}
        <div className="rewarded-section">
          <h3>🎁 Watch & Earn</h3>
          <div className="reward-options">
            <button className="reward-btn">
              <span className="reward-icon">📺</span>
              <span className="reward-text">Watch Ad</span>
              <span className="reward-amount">+50 💎</span>
            </button>
            
            <button className="reward-btn premium">
              <span className="reward-icon">🎬</span>
              <span className="reward-text">Watch 5 Ads</span>
              <span className="reward-amount">+300 💎</span>
            </button>
          </div>
        </div>

        {/* Remove Ads Option */}
        <div className="remove-ads-section">
          <div className="remove-ads-card">
            <span className="no-ads-icon">🚫</span>
            <div className="remove-ads-info">
              <h4>Remove Ads Forever</h4>
              <p>One-time purchase • Support development</p>
            </div>
            <button className="purchase-btn">$2.99</button>
          </div>
        </div>

        {/* Second Ad Slot */}
        <div className="ad-container rectangle-ad">
          <div className="ad-placeholder">
            {/* Google AdSense Rectangle Ad */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="rectangle"
            />
          </div>
          <span className="ad-label">Advertisement</span>
        </div>
      </div>
    </div>
  );
};

export default AdsPage;
