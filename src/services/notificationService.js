/**
 * Service centralisé pour gérer les notifications
 */

import { writable } from 'svelte/store';

export const notifications = writable([]);

class NotificationService {
  
  show(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    const notification = { id, message, type };
    
    notifications.update(current => [...current, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  }
  
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
  
  remove(id) {
    notifications.update(current => current.filter(n => n.id !== id));
  }
  
  clear() {
    notifications.set([]);
  }
  
  // Helper pour gérer les résultats d'actions
  handleActionResult(result) {
    if (result.success) {
      this.success(result.message);
    } else if (!result.cancelled) {
      const type = result.type || 'error';
      this[type](result.message);
    }
  }
}

export default new NotificationService();