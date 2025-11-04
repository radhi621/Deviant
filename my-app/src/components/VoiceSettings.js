import { useState } from 'react';
import './VoiceSettings.css';

const VoiceSettings = ({ onSettingsChange, isOpen, onClose, speak, availableVoices }) => {
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.95,
    pitch: 1.0,
    volume: 0.9,
  });

  const handleChange = (key, value) => {
    const newSettings = { ...voiceSettings, [key]: value };
    setVoiceSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handlePreview = () => {
    const previewText = 'This is a preview of your voice settings. How does this sound?';
    if (speak) {
      speak(previewText, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        lang: 'en-US',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="voice-settings-overlay" onClick={onClose}>
      <div className="voice-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Voice Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* Speech Rate */}
          <div className="setting-group">
            <label>
              Speed: <span className="value">{voiceSettings.rate.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="setting-group">
            <label>
              Pitch: <span className="value">{voiceSettings.pitch.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Deep</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Volume */}
          <div className="setting-group">
            <label>
              Volume: <span className="value">{Math.round(voiceSettings.volume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Mute</span>
              <span>Normal</span>
              <span>Max</span>
            </div>
          </div>

          {/* Preview Button */}
          <button className="preview-btn" onClick={handlePreview}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
            </svg>
            <span>🔊 Preview Voice</span>
          </button>

          {/* Info Box */}
          <div className="info-box">
            <strong>💡 Tips:</strong>
            <ul>
              <li>Click "Preview Voice" to test your settings instantly</li>
              <li>Use 0.8-0.95 speed for natural human speech</li>
              <li>Pitch 0.8-1.2 sounds most human-like</li>
              <li>Slightly lower volume (0.8-0.9) sounds more natural</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
