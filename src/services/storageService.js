/**
 * Local Storage Service
 * Handles persistence of user preferences and settings
 */

const STORAGE_KEYS = {
  API_KEY: 'refero-api-key',
  SELECTED_LIBRARY_ID: 'refero-selected-library-id',
  SELECTED_LIBRARY_TYPE: 'refero-selected-library-type',
  SELECTED_COLLECTION: 'refero-selected-collection',
  UI_PREFERENCES: 'refero-ui-preferences',
  SEARCH_HISTORY: 'refero-search-history'
};

class StorageService {
  constructor() {
    this.isAvailable = typeof window !== 'undefined' && !!window.localStorage;
  }

  /**
   * Get item from localStorage with fallback
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse stored value for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   */
  set(key, value) {
    if (!this.isAvailable) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to store value for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key) {
    if (!this.isAvailable) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove key "${key}":`, error);
    }
  }

  /**
   * Clear all app data
   */
  clear() {
    if (!this.isAvailable) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }

  // Specific getters and setters for app data
  
  getApiKey() {
    return this.get(STORAGE_KEYS.API_KEY);
  }

  setApiKey(apiKey) {
    return this.set(STORAGE_KEYS.API_KEY, apiKey);
  }

  removeApiKey() {
    this.remove(STORAGE_KEYS.API_KEY);
  }

  getSelectedLibrary() {
    const id = this.get(STORAGE_KEYS.SELECTED_LIBRARY_ID);
    const type = this.get(STORAGE_KEYS.SELECTED_LIBRARY_TYPE);
    
    return id && type ? { id, type } : null;
  }

  setSelectedLibrary(library) {
    this.set(STORAGE_KEYS.SELECTED_LIBRARY_ID, library.id);
    this.set(STORAGE_KEYS.SELECTED_LIBRARY_TYPE, library.type);
  }

  removeSelectedLibrary() {
    this.remove(STORAGE_KEYS.SELECTED_LIBRARY_ID);
    this.remove(STORAGE_KEYS.SELECTED_LIBRARY_TYPE);
  }

  getSelectedCollection() {
    return this.get(STORAGE_KEYS.SELECTED_COLLECTION);
  }

  setSelectedCollection(collectionKey) {
    return this.set(STORAGE_KEYS.SELECTED_COLLECTION, collectionKey);
  }

  getUIPreferences() {
    return this.get(STORAGE_KEYS.UI_PREFERENCES, {
      collectionsWidth: 250,
      detailsWidth: 300,
      sortColumn: 'title',
      sortDirection: 'asc'
    });
  }

  setUIPreferences(preferences) {
    const current = this.getUIPreferences();
    return this.set(STORAGE_KEYS.UI_PREFERENCES, { ...current, ...preferences });
  }

  getSearchHistory() {
    return this.get(STORAGE_KEYS.SEARCH_HISTORY, []);
  }

  addToSearchHistory(query) {
    if (!query || query.length < 2) return;
    
    const history = this.getSearchHistory();
    const filtered = history.filter(item => item !== query);
    const updated = [query, ...filtered].slice(0, 10); // Keep last 10 searches
    
    this.set(STORAGE_KEYS.SEARCH_HISTORY, updated);
  }
}

export default new StorageService();