<script>
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let visible = false;
  export let x = 0;
  export let y = 0;
  export let item = null;
  
  let contextMenuElement;
  
  // Fermer le menu si on clique ailleurs
  function handleClickOutside(event) {
    if (contextMenuElement && !contextMenuElement.contains(event.target)) {
      visible = false;
    }
  }
  
  // Fermer le menu avec Escape
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      visible = false;
    }
  }
  
  // Gérer les actions du menu
  function handleAction(action) {
    dispatch(action, { item });
    visible = false;
  }
  
  // S'assurer que le menu reste dans la fenêtre
  function adjustPosition() {
    if (!contextMenuElement) return;
    
    const rect = contextMenuElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Ajuster horizontalement
    if (x + rect.width > windowWidth) {
      x = windowWidth - rect.width - 10;
    }
    
    // Ajuster verticalement
    if (y + rect.height > windowHeight) {
      y = windowHeight - rect.height - 10;
    }
  }
  
  $: if (visible && contextMenuElement) {
    adjustPosition();
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if visible && item}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="context-menu"
    bind:this={contextMenuElement}
    style="left: {x}px; top: {y}px;"
    on:click|stopPropagation
  >
    <div class="context-menu-item" on:click={() => handleAction('view')}>
      <span class="menu-icon">👁️</span>
      <span class="menu-text">Voir les détails</span>
    </div>
    
    <div class="context-menu-item" on:click={() => handleAction('edit')}>
      <span class="menu-icon">✏️</span>
      <span class="menu-text">Modifier</span>
      <span class="menu-shortcut">Double-clic</span>
    </div>
    
    <div class="context-menu-separator"></div>
    
    <div class="context-menu-item" on:click={() => handleAction('duplicate')}>
      <span class="menu-icon">📋</span>
      <span class="menu-text">Dupliquer</span>
    </div>
    
    <div class="context-menu-item" on:click={() => handleAction('export')}>
      <span class="menu-icon">📤</span>
      <span class="menu-text">Exporter</span>
    </div>
    
    <div class="context-menu-separator"></div>
    
    <div class="context-menu-item" on:click={() => handleAction('copyTitle')}>
      <span class="menu-icon">📝</span>
      <span class="menu-text">Copier le titre</span>
    </div>
    
    <div class="context-menu-item" on:click={() => handleAction('copyUrl')}>
      <span class="menu-icon">🔗</span>
      <span class="menu-text">Copier l'URL</span>
    </div>
    
    <div class="context-menu-separator"></div>
    
    <div class="context-menu-item danger" on:click={() => handleAction('delete')}>
      <span class="menu-icon">🗑️</span>
      <span class="menu-text">Supprimer</span>
      <span class="menu-shortcut">⚠️</span>
    </div>
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    background: #383838;
    border: 1px solid #555;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    z-index: 2000;
    min-width: 200px;
    padding: 4px 0;
    font-size: 13px;
    user-select: none;
    backdrop-filter: blur(8px);
  }
  
  .context-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    gap: 8px;
    color: #e8e8e8;
  }
  
  .context-menu-item:hover {
    background: #4a4a4a;
  }
  
  .context-menu-item.danger {
    color: #ff6b6b;
  }
  
  .context-menu-item.danger:hover {
    background: rgba(255, 107, 107, 0.1);
  }
  
  .menu-icon {
    font-size: 14px;
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .menu-text {
    flex: 1;
  }
  
  .menu-shortcut {
    font-size: 11px;
    color: #aaa;
    font-weight: 500;
  }
  
  .context-menu-separator {
    height: 1px;
    background: #555;
    margin: 4px 8px;
  }
  
  /* Animation d'apparition */
  .context-menu {
    animation: contextMenuAppear 0.15s ease-out;
  }
  
  @keyframes contextMenuAppear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>