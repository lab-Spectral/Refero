/**
 * Zotero API Service
 * Handles all interactions with the Zotero Web API
 */

const ZOTERO_API_BASE = 'https://api.zotero.org';

class ZoteroError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ZoteroError';
    this.status = status;
    this.response = response;
  }
}

class ZoteroService {
  constructor() {
    this.apiKey = null;
    this.userId = null;
  }

  /**
   * Set the API key and validate it
   */
  async setApiKey(apiKey) {
    if (!apiKey) throw new ZoteroError('API key is required');
    
    try {
      const response = await this.request('/keys/current', { apiKey });
      this.apiKey = apiKey;
      this.userId = response.userID;
      return response;
    } catch (error) {
      this.apiKey = null;
      this.userId = null;
      throw error;
    }
  }

  /**
   * Make authenticated request to Zotero API
   */
  async request(endpoint, options = {}) {
    const { apiKey = this.apiKey, method = 'GET', body, params } = options;
    
    if (!apiKey) {
      throw new ZoteroError('Authentication required');
    }

    let url = `${ZOTERO_API_BASE}${endpoint}`;
    
    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams}`;
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Add version header for updates
    if (options.version) {
      headers['If-Unmodified-Since-Version'] = options.version.toString();
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new ZoteroError(
          `API request failed: ${response.statusText}`,
          response.status,
          response
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ZoteroError) throw error;
      throw new ZoteroError(`Network error: ${error.message}`);
    }
  }

  /**
   * Get user libraries (personal + groups)
   */
  async getLibraries() {
    if (!this.userId) throw new ZoteroError('User not authenticated');

    const [userCollections, groups] = await Promise.all([
      this.request(`/users/${this.userId}/collections`),
      this.request(`/users/${this.userId}/groups`)
    ]);

    return [
      {
        id: this.userId,
        name: 'Ma bibliothèque',
        type: 'user',
        collections: userCollections
      },
      ...groups.map(group => ({
        id: group.id,
        name: group.data.name,
        type: 'group',
        collections: []
      }))
    ];
  }

  /**
   * Get collections for a library
   */
  async getCollections(libraryId, libraryType) {
    const endpoint = libraryType === 'user' 
      ? `/users/${libraryId}/collections`
      : `/groups/${libraryId}/collections`;
    
    return this.request(endpoint);
  }

  /**
   * Get items from a collection or special collection
   */
  async getItems(libraryId, libraryType, collectionKey, options = {}) {
    const baseEndpoint = libraryType === 'user' 
      ? `/users/${libraryId}`
      : `/groups/${libraryId}`;

    const { limit = 100, start = 0 } = options;
    const params = { limit, start };

    let endpoint;
    switch (collectionKey) {
      case 'trash':
        endpoint = `${baseEndpoint}/items/trash`;
        break;
      case 'uncategorized':
        endpoint = `${baseEndpoint}/items/top`;
        break;
      case 'duplicates':
        endpoint = `${baseEndpoint}/items/top`;
        break;
      default:
        endpoint = `${baseEndpoint}/collections/${collectionKey}/items`;
    }

    const items = await this.request(endpoint, { params });
    
    // Filter out attachments and apply special collection logic
    const filteredItems = items.filter(item => item.data.itemType !== 'attachment');
    
    if (collectionKey === 'uncategorized') {
      return filteredItems.filter(item => 
        !item.data.collections || item.data.collections.length === 0
      );
    }
    
    if (collectionKey === 'duplicates') {
      return this.findDuplicates(filteredItems);
    }
    
    return filteredItems;
  }

  /**
   * Create a new item
   */
  async createItem(libraryId, libraryType, itemData, collectionKeys = []) {
    const endpoint = libraryType === 'user' 
      ? `/users/${libraryId}/items`
      : `/groups/${libraryId}/items`;

    const item = {
      ...itemData,
      collections: collectionKeys
    };

    return this.request(endpoint, {
      method: 'POST',
      body: [item]
    });
  }

  /**
   * Update an existing item
   */
  async updateItem(libraryId, libraryType, itemKey, itemData, version) {
    const endpoint = libraryType === 'user' 
      ? `/users/${libraryId}/items/${itemKey}`
      : `/groups/${libraryId}/items/${itemKey}`;
  
    // Ne pas inclure les collections dans la mise à jour
    // Les collections sont gérées séparément
    const cleanItemData = { ...itemData };
    delete cleanItemData.collections;
  
    return this.request(endpoint, {
      method: 'PUT',
      body: cleanItemData,
      version
    });
  }
  
  /**
   * Delete an item
   */
  async deleteItem(libraryId, libraryType, itemKey, version) {
    const endpoint = libraryType === 'user' 
      ? `/users/${libraryId}/items/${itemKey}`
      : `/groups/${libraryId}/items/${itemKey}`;

    return this.request(endpoint, {
      method: 'DELETE',
      version
    });
  }

  /**
   * Find duplicate items based on title and first author
   */
  findDuplicates(items) {
    const duplicates = [];
    const seen = new Map();
    
    items.forEach(item => {
      const title = (item.data.title || '').toLowerCase().trim();
      const firstAuthor = item.data.creators?.[0] ? 
        `${item.data.creators[0].lastName || ''} ${item.data.creators[0].firstName || ''}`.toLowerCase().trim() : 
        '';
      
      if (!title) return;
      
      const key = `${title}|${firstAuthor}`;
      
      if (seen.has(key)) {
        const originalItem = seen.get(key);
        if (!duplicates.find(d => d.key === originalItem.key)) {
          duplicates.push(originalItem);
        }
        if (!duplicates.find(d => d.key === item.key)) {
          duplicates.push(item);
        }
      } else {
        seen.set(key, item);
      }
    });
    
    return duplicates;
  }

  /**
   * Search items by query
   */
  searchItems(items, query) {
    if (!query || query.length < 2) return items;
    
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => {
      const title = (item.data.title || '').toLowerCase();
      const author = item.data.creators?.[0] ? 
        `${item.data.creators[0].firstName || ''} ${item.data.creators[0].lastName || ''}`.toLowerCase() : '';
      
      return title.includes(searchTerm) || author.includes(searchTerm);
    });
  }
}

export default new ZoteroService();