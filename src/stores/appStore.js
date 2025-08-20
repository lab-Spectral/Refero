/**
 * Application State Store
 * Centralized state management using Svelte stores
 */

import { writable, derived, get } from 'svelte/store';
import zoteroService from '../services/zoteroService.js';
import storageService from '../services/storageService.js';
import { createDefaultItem } from '../data/itemTypes.js';
import { sortCollections, flattenCollections, sortItems } from '../utils/index.js';

// Core state
export const apiKey = writable('');
export const isAuthenticated = writable(false);
export const libraries = writable([]);
export const selectedLibrary = writable(null);
export const collections = writable([]);
export const selectedCollection = writable('');
export const items = writable([]);
export const selectedItem = writable(null);
export const editingItem = writable(null);

// UI state
export const showAuthModal = writable(false);
export const searchQuery = writable('');
export const sortColumn = writable('title');
export const sortDirection = writable('asc');
export const uiPreferences = writable({
  collectionsWidth: 250,
  detailsWidth: 300
});

// Loading states
export const isLoading = writable(false);
export const isLoadingItems = writable(false);
export const error = writable(null);

// Derived stores
export const sortedCollections = derived(collections, ($collections) => {
  return sortCollections($collections);
});

export const flatCollections = derived(sortedCollections, ($sortedCollections) => {
  return flattenCollections($sortedCollections);
});

export const filteredItems = derived(
  [items, searchQuery],
  ([$items, $searchQuery]) => {
    if (!$searchQuery || $searchQuery.length < 2) return $items;
    return zoteroService.searchItems($items, $searchQuery);
  }
);

export const sortedItems = derived(
  [filteredItems, sortColumn, sortDirection],
  ([$filteredItems, $sortColumn, $sortDirection]) => {
    return sortItems($filteredItems, $sortColumn, $sortDirection);
  }
);

export const currentItem = derived(
  [editingItem],
  ([$editingItem]) => {
    return $editingItem ? $editingItem.data : createDefaultItem();
  }
);

// Actions
export const appActions = {
  /**
   * Initialize app with stored preferences
   */
  async init() {
    const storedApiKey = storageService.getApiKey();
    const storedLibrary = storageService.getSelectedLibrary();
    const storedCollection = storageService.getSelectedCollection();
    const storedUIPrefs = storageService.getUIPreferences();
    
    uiPreferences.set(storedUIPrefs);
    
    if (storedApiKey) {
      apiKey.set(storedApiKey);
      try {
        await this.authenticate(storedApiKey, true); // true = silent auth
        
        if (storedLibrary) {
          const libs = get(libraries);
          const library = libs.find(lib => 
            lib.id.toString() === storedLibrary.id.toString() && 
            lib.type === storedLibrary.type
          );
          
          if (library) {
            await this.selectLibrary(library);
            
            // 🔧 CORRECTION : Vérifier et charger la collection sauvegardée
            if (storedCollection) {
              selectedCollection.set(storedCollection);
              storageService.setSelectedCollection(storedCollection);
              setTimeout(async () => {
                await this.loadItems();
              }, 200);
            }
          }
        }
      } catch (err) {
        console.warn('Auto-authentication failed:', err);
        this.logout();
      }
    } else {
      showAuthModal.set(true);
    }
  },

  /**
   * Authenticate with API key
   */
  async authenticate(key, silent = false) {
    error.set(null);
    isLoading.set(true);
    
    try {
      await zoteroService.setApiKey(key);
      const libs = await zoteroService.getLibraries();
      
      apiKey.set(key);
      isAuthenticated.set(true);
      libraries.set(libs);
      storageService.setApiKey(key);
      
      // 🔧 CORRECTION : Ne pas fermer le modal automatiquement
      // Laisser l'utilisateur choisir sa bibliothèque
      if (silent) {
        showAuthModal.set(false);
      }
      // Si pas en mode silencieux, garder le modal ouvert pour sélection de bibliothèque
      
    } catch (err) {
      error.set(err.message);
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Select a library
   */
  async selectLibrary(library) {
    error.set(null);
    isLoading.set(true);
    
    try {
      selectedLibrary.set(library);
      storageService.setSelectedLibrary(library);
      
      if (library.type === 'user') {
        collections.set(library.collections);
      } else {
        const groupCollections = await zoteroService.getCollections(library.id, library.type);
        collections.set(groupCollections);
        library.collections = groupCollections;
      }
      
      // Auto-select first collection
      const cols = get(collections);
      if (cols.length > 0) {
        const sortedCols = sortCollections(cols);
        if (sortedCols.length > 0) {
          const firstCollectionKey = sortedCols[0].key;
          selectedCollection.set(firstCollectionKey);
          storageService.setSelectedCollection(firstCollectionKey);
          
          // 🔧 CORRECTION : Forcer le chargement des items avec un délai
          setTimeout(async () => {
            await this.loadItems();
          }, 100);
        }
      }
      
      // Reset selections
      items.set([]);
      selectedItem.set(null);
      editingItem.set(null);
      
      // 🔧 CORRECTION : Fermer le modal après sélection de bibliothèque
      showAuthModal.set(false);
      
    } catch (err) {
      error.set(err.message);
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Select a collection
   */
  async selectCollection(collectionKey) {
    selectedCollection.set(collectionKey);
    storageService.setSelectedCollection(collectionKey);
    selectedItem.set(null);
    editingItem.set(null);
    await this.loadItems();
  },

  /**
   * Load items for selected collection
   */
  async loadItems() {
    const library = get(selectedLibrary);
    const collection = get(selectedCollection);
    
    console.log('loadItems called with:', { library: library?.name, collection });
    
    if (!library || !collection) {
      console.log('Missing library or collection, aborting loadItems');
      return;
    }
    
    error.set(null);
    isLoadingItems.set(true);
    
    try {
      console.log('Loading items for collection:', collection);
      const itemsData = await zoteroService.getItems(
        library.id,
        library.type,
        collection
      );
      console.log('Items loaded:', itemsData.length);
      items.set(itemsData);
    } catch (err) {
      console.error('Error loading items:', err);
      error.set(err.message);
      items.set([]);
    } finally {
      isLoadingItems.set(false);
    }
  },

  /**
   * Create a new item
   */
  async createItem(itemData) {
    const library = get(selectedLibrary);
    const collection = get(selectedCollection);
    
    if (!library || !collection) return;
    
    // Don't allow creation in special collections
    if (['duplicates', 'uncategorized', 'trash'].includes(collection)) {
      throw new Error('Impossible d\'ajouter des items dans cette collection spéciale.');
    }
    
    error.set(null);
    isLoading.set(true);
    
    try {
      await zoteroService.createItem(
        library.id,
        library.type,
        itemData,
        [collection]
      );
      
      await this.loadItems();
      this.resetForm();
    } catch (err) {
      error.set(err.message);
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Update an existing item
   */
  async updateItem(item, itemData) {
    const library = get(selectedLibrary);
    
    if (!library || !item) return;
    
    error.set(null);
    isLoading.set(true);
    
    try {
      await zoteroService.updateItem(
        library.id,
        library.type,
        item.key,
        itemData,
        item.version
        // Supprimer le paramètre collections
      );
      
      await this.loadItems();
      editingItem.set(null);
      
      // Maintenir la sélection sur l'item modifié
      const updatedItems = get(items);
      const updatedItem = updatedItems.find(i => i.key === item.key);
      if (updatedItem) {
        selectedItem.set(updatedItem);
      }
      
    } catch (err) {
      error.set(err.message);
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Delete an item
   */
  async deleteItem(item) {
    const library = get(selectedLibrary);
    
    if (!library || !item) return;
    
    error.set(null);
    isLoading.set(true);
    
    try {
      await zoteroService.deleteItem(
        library.id,
        library.type,
        item.key,
        item.version
      );
      
      await this.loadItems();
      editingItem.set(null);
      selectedItem.set(null);
    } catch (err) {
      error.set(err.message);
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  /**
   * Edit an item
   */
  editItem(item) {
    editingItem.set(JSON.parse(JSON.stringify(item)));
    selectedItem.set(item);
  },

  /**
   * Select an item
   */
  selectItem(item) {
    selectedItem.set(item);
    editingItem.set(null);
  },

  /**
   * Reset form
   */
  resetForm() {
    editingItem.set(null);
    selectedItem.set(null);
  },

  /**
   * Set search query
   */
  setSearchQuery(query) {
    searchQuery.set(query);
    if (query && query.length >= 2) {
      storageService.addToSearchHistory(query);
    }
  },

  /**
   * Set sort parameters
   */
  setSort(column, direction) {
    sortColumn.set(column);
    sortDirection.set(direction);
    
    const prefs = get(uiPreferences);
    uiPreferences.set({ ...prefs, sortColumn: column, sortDirection: direction });
    storageService.setUIPreferences({ sortColumn: column, sortDirection: direction });
  },

  /**
   * Update UI preferences
   */
  updateUIPreferences(newPrefs) {
    const current = get(uiPreferences);
    const updated = { ...current, ...newPrefs };
    uiPreferences.set(updated);
    storageService.setUIPreferences(newPrefs);
  },

  /**
   * Show auth modal
   */
  showAuthModal() {
    showAuthModal.set(true);
  },

  /**
   * Logout and clear data
   */
  logout() {
    apiKey.set('');
    isAuthenticated.set(false);
    libraries.set([]);
    collections.set([]);
    items.set([]);
    selectedLibrary.set(null);
    selectedCollection.set('');
    selectedItem.set(null);
    editingItem.set(null);
    searchQuery.set('');
    showAuthModal.set(true);
    
    storageService.clear();
  },

  /**
   * Clear error
   */
  clearError() {
    error.set(null);
  }
};