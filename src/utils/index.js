/**
 * Utility functions
 */

/**
 * Debounce function calls
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Format date for display
 */
export function formatDate(dateStr, locale = 'fr-FR') {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch (error) {
    return '';
  }
}

/**
 * Sort collections hierarchically
 */
export function sortCollections(collections) {
  if (!collections || collections.length === 0) return [];
  
  const collectionMap = new Map();
  collections.forEach(col => {
    collectionMap.set(col.key, { ...col, children: [] });
  });
  
  const rootCollections = [];
  const childCollections = [];
  
  collections.forEach(col => {
    if (col.data.parentCollection) {
      childCollections.push(col);
    } else {
      rootCollections.push(col);
    }
  });
  
  childCollections.forEach(child => {
    const parent = collectionMap.get(child.data.parentCollection);
    if (parent) {
      parent.children.push(child);
    } else {
      rootCollections.push(child);
    }
  });
  
  function sortCollectionArray(arr) {
    return arr.sort((a, b) => {
      return a.data.name.localeCompare(b.data.name, 'fr', { sensitivity: 'base' });
    }).map(col => {
      const mapped = collectionMap.get(col.key);
      if (mapped && mapped.children.length > 0) {
        mapped.children = sortCollectionArray(mapped.children);
      }
      return mapped || col;
    });
  }
  
  return sortCollectionArray(rootCollections);
}

/**
 * Flatten hierarchical collections with level indicators
 */
export function flattenCollections(collections, level = 0) {
  let result = [];
  
  collections.forEach(col => {
    result.push({ ...col, level });
    if (col.children && col.children.length > 0) {
      result = result.concat(flattenCollections(col.children, level + 1));
    }
  });
  
  return result;
}

/**
 * Sort items by column and direction
 */
export function sortItems(items, column, direction) {
  if (!items || items.length === 0) return items;
  
  const sorted = [...items].sort((a, b) => {
    let valueA, valueB;
    
    switch (column) {
      case 'title':
        valueA = (a.data.title || '').toLowerCase();
        valueB = (b.data.title || '').toLowerCase();
        break;
      case 'author':
        const authorA = a.data.creators?.[0];
        const authorB = b.data.creators?.[0];
        valueA = authorA ? (authorA.lastName || '').toLowerCase() : '';
        valueB = authorB ? (authorB.lastName || '').toLowerCase() : '';
        break;
      case 'modified':
        valueA = new Date(a.data?.dateModified || a.dateAdded || 0);
        valueB = new Date(b.data?.dateModified || b.dateAdded || 0);
        break;
      case 'type':
        valueA = a.data.itemType || '';
        valueB = b.data.itemType || '';
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Extract original date from extra field
 */
export function extractOriginalDate(extraText) {
  if (!extraText) return '';
  const match = extraText.match(/^original-date:\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Update extra field with original date
 */
export function updateExtraWithOriginalDate(extraText, originalDate) {
  let updatedExtra = extraText.replace(/^original-date:\s*.+$/m, '').trim();
  
  if (originalDate && originalDate.trim()) {
    const newLine = `original-date: ${originalDate.trim()}`;
    if (updatedExtra) {
      updatedExtra = newLine + '\n' + updatedExtra;
    } else {
      updatedExtra = newLine;
    }
  }
  
  return updatedExtra;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Sanitize string for safe display
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}