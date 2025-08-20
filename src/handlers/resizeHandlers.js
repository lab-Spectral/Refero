/**
 * Gestionnaires pour le redimensionnement des panneaux
 */

export class ResizeHandlers {
  static isResizingCollections = false;
  static isResizingDetails = false;
  
  static startCollectionsResize(event, updateUIPreferences) {
    this.isResizingCollections = true;
    
    const handleMouseMove = (e) => {
      if (!this.isResizingCollections) return;
      const newWidth = Math.max(200, Math.min(400, e.clientX));
      updateUIPreferences({ collectionsWidth: newWidth });
    };
    
    const handleMouseUp = () => {
      this.isResizingCollections = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    event.preventDefault();
  }
  
  static startDetailsResize(event, updateUIPreferences) {
    this.isResizingDetails = true;
    
    const handleMouseMove = (e) => {
      if (!this.isResizingDetails) return;
      const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
      updateUIPreferences({ detailsWidth: newWidth });
    };
    
    const handleMouseUp = () => {
      this.isResizingDetails = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    event.preventDefault();
  }
}