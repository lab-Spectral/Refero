/**
 * Service pour gérer les actions sur les collections
 */

import { get } from 'svelte/store';
import { apiKey, selectedLibrary, flatCollections, selectedCollection, collections } from '../stores/appStore.js';
import { appActions } from '../stores/appStore.js';
import { formatDate } from '../utils/index.js';
import zoteroService from './zoteroService.js';

class CollectionActionsService {
  
  async createCollection(library, name, parentCollection = null) {
    const endpoint = library.type === 'user' 
      ? `/users/${library.id}/collections`
      : `/groups/${library.id}/collections`;
    
    const collectionData = {
      name: name,
      parentCollection: parentCollection ? parentCollection.key : false
    };
    
    const response = await fetch(`https://api.zotero.org${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${get(apiKey)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([collectionData])
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la création: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async renameCollection(library, collection, newName) {
    const endpoint = library.type === 'user' 
      ? `/users/${library.id}/collections/${collection.key}`
      : `/groups/${library.id}/collections/${collection.key}`;
    
    const collectionData = {
      name: newName,
      parentCollection: collection.data.parentCollection || false
    };
    
    const response = await fetch(`https://api.zotero.org${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${get(apiKey)}`,
        'Content-Type': 'application/json',
        'If-Unmodified-Since-Version': collection.version.toString()
      },
      body: JSON.stringify(collectionData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Erreur lors du renommage: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async deleteCollection(collection) {
    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer la collection "${collection.data.name}" ?\n\nTous les éléments de cette collection seront également supprimés.\n\nCette action est irréversible.`
    );
    
    if (!confirmDelete) return { success: false, cancelled: true };
    
    try {
      const library = get(selectedLibrary);
      const endpoint = library.type === 'user' 
        ? `/users/${library.id}/collections/${collection.key}`
        : `/groups/${library.id}/collections/${collection.key}`;
      
      const response = await fetch(`https://api.zotero.org${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${get(apiKey)}`,
          'If-Unmodified-Since-Version': collection.version.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.statusText}`);
      }
      
      await this.refreshCollections(library);
      
      if (get(selectedCollection) === collection.key) {
        appActions.selectCollection('');
      }
      
      return { success: true, message: 'Collection supprimée' };
      
    } catch (error) {
      return { success: false, message: `Erreur lors de la suppression: ${error.message}` };
    }
  }
  
  async duplicateCollection(collection) {
    try {
      const library = get(selectedLibrary);
      const newName = `${collection.data.name} (Copie)`;
      
      await this.createCollection(library, newName, 
        collection.data.parentCollection ? 
          get(flatCollections).find(c => c.key === collection.data.parentCollection) : 
          null
      );
      
      await this.refreshCollections(library);
      return { success: true, message: 'Collection dupliquée' };
      
    } catch (error) {
      return { success: false, message: `Erreur lors de la duplication: ${error.message}` };
    }
  }
  
  async exportCollection(collection) {
    try {
      const library = get(selectedLibrary);
      const items = await zoteroService.getItems(library.id, library.type, collection.key);
      
      const bibtexEntries = items.map(item => this.generateBibTeX(item)).join('\n\n');
      const filename = `${collection.data.name.replace(/[^a-zA-Z0-9]/g, '_')}.bib`;
      
      this.downloadAsFile(filename, bibtexEntries);
      return { success: true, message: `Collection exportée (${items.length} notices)` };
      
    } catch (error) {
      return { success: false, message: `Erreur lors de l'export: ${error.message}` };
    }
  }
  
  async getCollectionProperties(collection) {
    try {
      const library = get(selectedLibrary);
      const items = await zoteroService.getItems(library.id, library.type, collection.key);
      
      const properties = [
        `Nom: ${collection.data.name}`,
        `Nombre d'éléments: ${items.length}`,
        `Clé: ${collection.key}`,
        `Version: ${collection.version}`,
        `Dernière modification: ${formatDate(collection.data.dateModified || collection.dateAdded)}`
      ];
      
      if (collection.data.parentCollection) {
        const parent = get(flatCollections).find(c => c.key === collection.data.parentCollection);
        if (parent) {
          properties.splice(2, 0, `Collection parent: ${parent.data.name}`);
        }
      }
      
      alert(properties.join('\n'));
      
    } catch (error) {
      return { success: false, message: `Erreur lors de la récupération des propriétés: ${error.message}` };
    }
  }
  
  async refreshCollections(library) {
    try {
      const newCollections = await zoteroService.getCollections(library.id, library.type);
      collections.set(newCollections);
      library.collections = newCollections;
    } catch (error) {
      console.error('Error refreshing collections:', error);
    }
  }
  
  // Utility methods
  generateBibTeX(item) {
    const data = item.data;
    const type = data.itemType === 'journalArticle' ? 'article' : 
                 data.itemType === 'book' ? 'book' : 
                 data.itemType === 'bookSection' ? 'incollection' : 'misc';
    
    const key = `${data.creators?.[0]?.lastName || 'Unknown'}${data.date ? data.date.match(/\d{4}/)?.[0] || '' : ''}`;
    
    let bibtex = `@${type}{${key},\n`;
    bibtex += `  title = {${data.title || ''}},\n`;
    
    if (data.creators && data.creators.length > 0) {
      const authors = data.creators
        .filter(c => c.creatorType === 'author')
        .map(c => `${c.firstName || ''} ${c.lastName || ''}`.trim())
        .join(' and ');
      if (authors) bibtex += `  author = {${authors}},\n`;
    }
    
    if (data.date) bibtex += `  year = {${data.date.match(/\d{4}/)?.[0] || data.date}},\n`;
    if (data.publisher) bibtex += `  publisher = {${data.publisher}},\n`;
    if (data.url) bibtex += `  url = {${data.url}},\n`;
    
    bibtex += '}';
    return bibtex;
  }
  
  downloadAsFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new CollectionActionsService();