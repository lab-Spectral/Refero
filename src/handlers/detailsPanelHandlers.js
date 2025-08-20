/**
 * Gestionnaires spécialisés pour le panneau de détails
 */

import { get } from 'svelte/store';
import { apiKey, selectedLibrary, selectedCollection, sortedItems, selectedItem, editingItem, appActions } from '../stores/appStore.js';
import notificationService from '../services/notificationService.js';

export class DetailsPanelHandlers {
  
  static async handleCreate(itemData) {
    try {
      const library = get(selectedLibrary);
      const collection = get(selectedCollection);
      
      if (!library) throw new Error('Aucune bibliothèque sélectionnée');
      if (!collection || ['duplicates', 'uncategorized', 'trash'].includes(collection)) {
        throw new Error('Impossible d\'ajouter des items dans cette collection spéciale.');
      }
      
      const endpoint = library.type === 'user' 
        ? `/users/${library.id}/items`
        : `/groups/${library.id}/items`;
      
      // Préparer les données pour la création
      const newItemData = {
        itemType: itemData.itemType || 'book',
        title: itemData.title || 'Sans titre',
        creators: itemData.creators || [],
        collections: [collection]
      };
      
      // Ajouter seulement les champs non vides
      if (itemData.date) newItemData.date = itemData.date;
      if (itemData.publisher) newItemData.publisher = itemData.publisher;
      if (itemData.place) newItemData.place = itemData.place;
      if (itemData.abstractNote) newItemData.abstractNote = itemData.abstractNote;
      if (itemData.url) newItemData.url = itemData.url;
      if (itemData.language) newItemData.language = itemData.language;
      if (itemData.extra) newItemData.extra = itemData.extra;
      
      const response = await fetch(`https://api.zotero.org${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${get(apiKey)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([newItemData])
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      notificationService.success('Notice créée avec succès');
      
      // Recharger la liste pour voir la nouvelle notice
      await appActions.loadItems();
      
      // Sélectionner la notice nouvellement créée
      if (result.successful && Object.keys(result.successful).length > 0) {
        const successfulItems = result.successful;
        let newItemKey = null;
        
        // Extraire la clé de la première notice créée
        const firstKey = Object.keys(successfulItems)[0];
        if (firstKey !== undefined) {
          const itemResult = successfulItems[firstKey];
          if (typeof itemResult === 'object' && itemResult.key) {
            newItemKey = itemResult.key;
          } else if (typeof itemResult === 'string') {
            newItemKey = itemResult;
          } else {
            newItemKey = String(itemResult);
          }
        }
        
        if (!newItemKey) {
          appActions.resetForm();
          return;
        }
        
        // Fonction pour trouver et sélectionner l'item
        const findAndSelectItem = (attempts = 0) => {
          const updatedItems = get(sortedItems);
          const newItem = updatedItems.find(i => i.key === newItemKey);
          
          if (newItem) {
            // Sortir du mode création et sélectionner la nouvelle notice
            editingItem.set(null);
            setTimeout(() => {
              selectedItem.set(newItem);
            }, 50);
          } else if (attempts < 10) {
            setTimeout(() => findAndSelectItem(attempts + 1), 300);
          } else {
            appActions.resetForm();
          }
        };
        
        setTimeout(() => findAndSelectItem(), 200);
      } else {
        appActions.resetForm();
      }
      
    } catch (error) {
      notificationService.error(`Erreur lors de la création: ${error.message}`);
    }
  }
  
  static async handleUpdate(item, itemData) {
    try {
      const library = get(selectedLibrary);
      if (!library) throw new Error('Aucune bibliothèque sélectionnée');
      
      const endpoint = library.type === 'user' 
        ? `/users/${library.id}/items/${item.key}`
        : `/groups/${library.id}/items/${item.key}`;
      
      const response = await fetch(`https://api.zotero.org${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${get(apiKey)}`,
          'Content-Type': 'application/json',
          'If-Unmodified-Since-Version': item.version.toString()
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      notificationService.success('Notice mise à jour avec succès');
      
      // Recharger la liste et maintenir la sélection
      await appActions.loadItems();
      editingItem.set(null);
      
      const updatedItems = get(sortedItems);
      const updatedItem = updatedItems.find(i => i.key === item.key);
      if (updatedItem) {
        selectedItem.set(updatedItem);
      }
      
    } catch (error) {
      notificationService.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }
}