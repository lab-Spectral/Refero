/**
 * Gestionnaires d'événements centralisés
 */

import { get } from 'svelte/store';
import { appActions, selectedLibrary, flatCollections } from '../stores/appStore.js';
import itemActionsService from '../services/itemActionsService.js';
import collectionActionsService from '../services/collectionActionsService.js';
import notificationService from '../services/notificationService.js';

export class ContextMenuHandlers {
  
  // =============================================================================
  // ITEM CONTEXT MENU HANDLERS
  // =============================================================================
  
  static async handleItemAction(action, item) {
    let result;
    
    switch (action) {
      case 'view':
        appActions.selectItem(item);
        break;
        
      case 'edit':
        appActions.editItem(item);
        break;
        
      case 'duplicate':
        result = await itemActionsService.duplicateItem(item);
        notificationService.handleActionResult(result);
        break;
        
      case 'export':
        result = await itemActionsService.exportItem(item);
        notificationService.handleActionResult(result);
        break;
        
      case 'copyTitle':
        result = await itemActionsService.copyTitle(item);
        notificationService.handleActionResult(result);
        break;
        
      case 'copyUrl':
        result = await itemActionsService.copyUrl(item);
        notificationService.handleActionResult(result);
        break;
        
      case 'delete':
        result = await itemActionsService.deleteItem(item);
        notificationService.handleActionResult(result);
        break;
    }
  }
  
  // =============================================================================
  // COLLECTION CONTEXT MENU HANDLERS
  // =============================================================================
  
  static async handleCollectionAction(action, collection, openModalCallback) {
    let result;
    
    switch (action) {
      case 'createSubCollection':
        openModalCallback('createSub', '', collection);
        break;
        
      case 'createSibling':
        const parentKey = collection.data.parentCollection || null;
        const parentCollection = parentKey ? 
          get(flatCollections).find(c => c.key === parentKey) : null;
        openModalCallback('create', '', parentCollection);
        break;
        
      case 'rename':
        openModalCallback('rename', collection.data.name, collection);
        break;
        
      case 'duplicate':
        result = await collectionActionsService.duplicateCollection(collection);
        notificationService.handleActionResult(result);
        break;
        
      case 'export':
        result = await collectionActionsService.exportCollection(collection);
        notificationService.handleActionResult(result);
        break;
        
      case 'properties':
        await collectionActionsService.getCollectionProperties(collection);
        break;
        
      case 'delete':
        result = await collectionActionsService.deleteCollection(collection);
        notificationService.handleActionResult(result);
        break;
        
      case 'emptyTrash':
        notificationService.warning('Fonctionnalité en cours de développement');
        break;
        
      case 'mergeDuplicates':
        notificationService.warning('Fonctionnalité en cours de développement');
        break;
        
      case 'refresh':
        await appActions.loadItems();
        break;
    }
  }
}

export class ToolbarHandlers {
  
  static handleSearch(query) {
    appActions.setSearchQuery(query);
  }
  
  static handleNewItem() {
    appActions.resetForm();
  }
  
  static handleShowSettings(showAuthModalSetter) {
    showAuthModalSetter(true);
  }
  
  static handleLogout() {
    appActions.logout();
  }
}

export class PanelHandlers {
  
  static handleCollectionSelect(collectionKey) {
    appActions.selectCollection(collectionKey);
  }
  
  static handleItemSelect(item) {
    appActions.selectItem(item);
  }
  
  static handleItemEdit(item) {
    appActions.editItem(item);
  }
  
  static handleSort(column, currentColumn, currentDirection) {
    if (currentColumn === column) {
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      appActions.setSort(column, newDirection);
    } else {
      appActions.setSort(column, 'asc');
    }
  }
}

export class CollectionModalHandlers {
  
  static async handleSubmit(name, mode, parentCollection) {
    const library = get(selectedLibrary);
    
    if (!library) {
      notificationService.error('Aucune bibliothèque sélectionnée');
      return false;
    }
    
    try {
      switch (mode) {
        case 'create':
        case 'createSub':
          await collectionActionsService.createCollection(library, name, parentCollection);
          notificationService.success('Collection créée avec succès');
          break;
          
        case 'rename':
          await collectionActionsService.renameCollection(library, parentCollection, name);
          notificationService.success('Collection renommée avec succès');
          break;
      }
      
      await collectionActionsService.refreshCollections(library);
      return true;
      
    } catch (error) {
      notificationService.error(`Erreur: ${error.message}`);
      return false;
    }
  }
}