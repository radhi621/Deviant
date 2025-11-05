import { useCallback } from 'react';

const VOICE_SETTINGS_KEY = 'ai_assistant_voice_settings';

export const useVoiceStorage = () => {
  /**
   * Save voice settings to local storage
   * @param {Object} settings - Voice settings object
   * {
   *   rate: number (0.5-2.0),
   *   pitch: number (0.5-2.0),
   *   volume: number (0-1),
   *   selectedVoiceIndex: number
   * }
   */
  const saveVoiceSettings = useCallback((settings) => {
    try {
      const settingsToSave = {
        rate: settings.rate || 0.95,
        pitch: settings.pitch || 1.0,
        volume: settings.volume || 0.9,
        selectedVoiceIndex: settings.selectedVoiceIndex !== undefined ? settings.selectedVoiceIndex : 0,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settingsToSave));
      return true;
    } catch (error) {
      console.error('Error saving voice settings to local storage:', error);
      return false;
    }
  }, []);

  /**
   * Load voice settings from local storage
   * @returns {Object|null} Voice settings object or null if not found
   */
  const loadVoiceSettings = useCallback(() => {
    try {
      const data = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          rate: parsed.rate || 0.95,
          pitch: parsed.pitch || 1.0,
          volume: parsed.volume || 0.9,
          selectedVoiceIndex: parsed.selectedVoiceIndex !== undefined ? parsed.selectedVoiceIndex : 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading voice settings from local storage:', error);
      return null;
    }
  }, []);

  /**
   * Clear all voice settings
   */
  const clearVoiceSettings = useCallback(() => {
    try {
      localStorage.removeItem(VOICE_SETTINGS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing voice settings:', error);
      return false;
    }
  }, []);

  /**
   * Get storage info for voice settings
   * @returns {Object} Storage info
   */
  const getVoiceStorageInfo = useCallback(() => {
    try {
      const data = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          hasSettings: true,
          rate: parsed.rate,
          pitch: parsed.pitch,
          volume: parsed.volume,
          selectedVoiceIndex: parsed.selectedVoiceIndex,
          lastSaved: parsed.timestamp,
        };
      }
      return {
        hasSettings: false,
        rate: 0.95,
        pitch: 1.0,
        volume: 0.9,
        selectedVoiceIndex: 0,
        lastSaved: null,
      };
    } catch (error) {
      console.error('Error getting voice storage info:', error);
      return {
        hasSettings: false,
        rate: 0.95,
        pitch: 1.0,
        volume: 0.9,
        selectedVoiceIndex: 0,
        lastSaved: null,
      };
    }
  }, []);

  /**
   * Update a specific voice setting
   * @param {string} key - Setting key (rate, pitch, volume, selectedVoiceIndex)
   * @param {*} value - New value
   */
  const updateVoiceSetting = useCallback((key, value) => {
    try {
      const currentSettings = loadVoiceSettings() || {
        rate: 0.95,
        pitch: 1.0,
        volume: 0.9,
        selectedVoiceIndex: 0,
      };

      const updatedSettings = {
        ...currentSettings,
        [key]: value,
      };

      return saveVoiceSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating voice setting:', error);
      return false;
    }
  }, [loadVoiceSettings, saveVoiceSettings]);

  return {
    saveVoiceSettings,
    loadVoiceSettings,
    clearVoiceSettings,
    getVoiceStorageInfo,
    updateVoiceSetting,
  };
};

export default useVoiceStorage;
