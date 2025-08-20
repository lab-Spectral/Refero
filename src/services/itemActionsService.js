/**
 * Service pour gérer les actions sur les items (duplication, export, etc.)
 */

import { get } from 'svelte/store';
import { apiKey, selectedLibrary, sortedItems } from '../stores/appStore.js';
import { appActions } from '../stores/appStore.js';

class ItemActionsService {
  
  async duplicateItem(item) {
    try {
      const duplicatedData = {
        ...item.data,
        title: `${item.data.title} (Copie)`,
        dateAdded: undefined,
        dateModified: undefined,
        version: undefined,
        key: undefined
      };
      
      await appActions.createItem(duplicatedData);
      return { success: true, message: 'Notice dupliquée avec succès' };
    } catch (error) {
      return { success: false, message: `Erreur lors de la duplication: ${error.message}` };
    }
  }
  
  async exportItem(item) {
    const bibtex = this.generateBibTeX(item);
    
    try {
      await navigator.clipboard.writeText(bibtex);
      return { success: true, message: 'Citation BibTeX copiée dans le presse-papiers' };
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      this.downloadAsFile(`${item.data.title || 'notice'}.bib`, bibtex);
      return { success: true, message: 'Citation BibTeX téléchargée' };
    }
  }
  
  async copyTitle(item) {
    try {
      await navigator.clipboard.writeText(item.data.title || 'Sans titre');
      return { success: true, message: 'Titre copié' };
    } catch (error) {
      console.error('Erreur lors de la copie du titre:', error);
      return { success: false, message: 'Erreur lors de la copie' };
    }
  }
  
  async copyUrl(item) {
    if (!item.data.url) {
      return { success: false, message: 'Aucune URL disponible', type: 'warning' };
    }
    
    try {
      await navigator.clipboard.writeText(item.data.url);
      return { success: true, message: 'URL copiée' };
    } catch (error) {
      console.error('Erreur lors de la copie de l\'URL:', error);
      return { success: false, message: 'Erreur lors de la copie' };
    }
  }
  
  async deleteItem(item) {
    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer la notice "${item.data.title || 'Sans titre'}" ?\n\nCette action est irréversible.`
    );
    
    if (!confirmDelete) return { success: false, cancelled: true };
    
    try {
      await appActions.deleteItem({ ...item, data: item.data });
      return { success: true, message: 'Notice supprimée' };
    } catch (error) {
      return { success: false, message: `Erreur lors de la suppression: ${error.message}` };
    }
  }
  
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

export default new ItemActionsService();