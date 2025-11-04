import { useState, useEffect } from 'react';
import './VoiceSettings.css';

const VoiceSettings = ({ onSettingsChange, isOpen, onClose, speak, availableVoices = [], changeVoice, selectedVoiceIndex = 0 }) => {
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.95,
    pitch: 1.0,
    volume: 0.9,
  });
  const [localSelectedVoice, setLocalSelectedVoice] = useState(selectedVoiceIndex);

  // Update local voice when prop changes
  useEffect(() => {
    setLocalSelectedVoice(selectedVoiceIndex);
  }, [selectedVoiceIndex]);

  const handleChange = (key, value) => {
    const newSettings = { ...voiceSettings, [key]: value };
    setVoiceSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleVoiceChange = (e) => {
    const voiceIndex = parseInt(e.target.value, 10);
    setLocalSelectedVoice(voiceIndex);
    if (changeVoice) {
      changeVoice(voiceIndex);
    }
  };

  const handlePreview = () => {
    const previewText = 'This is a preview of your voice settings. How does this sound?';
    if (speak) {
      speak(previewText, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceIndex: localSelectedVoice,
        lang: 'en-US',
      });
    }
  };

  // Get English voices
  const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
  const selectedVoice = availableVoices[localSelectedVoice];

  if (!isOpen) return null;

  return (
    <div className="voice-settings-overlay" onClick={onClose}>
      <div className="voice-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>🎤 Voice Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {/* Voice Selection */}
          <div className="setting-group">
            <label htmlFor="voice-select">
              Voice: {selectedVoice && <span className="voice-name">({selectedVoice.name})</span>}
            </label>
            <select 
              id="voice-select"
              value={localSelectedVoice} 
              onChange={handleVoiceChange}
              className="voice-select"
            >
              {englishVoices.length > 0 ? (
                englishVoices.map((voice, idx) => (
                  <option key={idx} value={availableVoices.indexOf(voice)}>
                    {voice.name} {voice.localService ? '(Local)' : '(Cloud)'}
                  </option>
                ))
              ) : (
                availableVoices.map((voice, idx) => (
                  <option key={idx} value={idx}>
                    {voice.name} {voice.localService ? '(Local)' : '(Cloud)'}
                  </option>
                ))
              )}
            </select>
            <div className="voice-info">
              {selectedVoice && (
                <small>
                  Language: {selectedVoice.lang} • Type: {selectedVoice.localService ? 'Local (faster)' : 'Cloud (higher quality)'}
                </small>
              )}
            </div>
          </div>

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
            <strong>💡 Optimal Voice Settings:</strong>
            <ul>
              <li><strong>Speed:</strong> 0.8-0.95 for natural human speech</li>
              <li><strong>Pitch:</strong> 0.8-1.2 sounds most natural</li>
              <li><strong>Volume:</strong> 0.8-0.9 for comfortable listening</li>
              <li><strong>Voice:</strong> Cloud voices generally sound higher quality</li>
              <li>Click "Preview Voice" to test any changes instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
