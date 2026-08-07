/**
 * Storage Manager Module
 * Manages saving and restoring API keys and user preferences to LocalStorage
 */

const STORAGE_KEYS_KEY = 'quotecard_api_keys';
const STORAGE_SETTINGS_KEY = 'quotecard_user_settings';

export class StorageManager {
  static getApiKeys() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS_KEY);
      return data ? JSON.parse(data) : {
        googleApiKey: '',
        googleCx: '',
        unsplashAccessKey: '',
        pixabayApiKey: ''
      };
    } catch (e) {
      console.error('Failed to read API keys from LocalStorage:', e);
      return {
        googleApiKey: '',
        googleCx: '',
        unsplashAccessKey: '',
        pixabayApiKey: ''
      };
    }
  }

  static saveApiKeys(keys) {
    try {
      localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(keys));
      return true;
    } catch (e) {
      console.error('Failed to save API keys to LocalStorage:', e);
      return false;
    }
  }

  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read user settings from LocalStorage:', e);
      return null;
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save user settings:', e);
      return false;
    }
  }
}
