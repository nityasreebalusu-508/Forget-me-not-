import { preferences } from './db';

/**
 * Storage service using IndexedDB (via Dexie.js)
 * Maintains the same API as the old localStorage-based service for compatibility
 */
const storageService = {
  /**
   * Get a value from preferences table
   * @param {string} key - The key to retrieve
   * @returns {Promise<{key: string, value: any} | undefined>}
   */
  async get(key) {
    try {
      const result = await preferences.get(key);
      return result;
    } catch (error) {
      console.error('Error getting from IndexedDB:', error);
      return undefined;
    }
  },

  /**
   * Set a value in preferences table
   * @param {string} key - The key to set
   * @param {any} value - The value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      await preferences.put({ key, value });
    } catch (error) {
      console.error('Error setting in IndexedDB:', error);
      throw error;
    }
  },

  /**
   * Remove a value from preferences table
   * @param {string} key - The key to remove
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      await preferences.delete(key);
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
      throw error;
    }
  },

  /**
   * Clear all preferences
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await preferences.clear();
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
      throw error;
    }
  }
};

export default storageService;
