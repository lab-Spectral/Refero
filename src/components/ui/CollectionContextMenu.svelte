<script>
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let visible = false;
  export let x = 0;
  export let y = 0;
  export let collection = null;
  export let isSpecialCollection = false;
  
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
    dispatch(action, { collection });
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

{#if visible && collection}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="collection-context-menu"
    bind:this={contextMenuElement}
    style="left: {x}px; top: {y}px;"
    on:click|stopPropagation
  >
    <!-- Actions principales -->
    {#if !isSpecialCollection}
      <div class="context-menu-item" on:click={() => handleAction('createSubCollection')}>
        <span class="menu-icon">📁</span>
        <span class="menu-text">Créer une sous-collection</span>
      </div>
      
      <div class="context-menu-separator"></div>
      
      <div class="context-menu-item" on:click={() => handleAction('rename')}>
        <span class="menu-icon">✏️</span>
        <span class="menu-text">Renommer</span>
      </div>
      
      <div class="context-menu-item" on:click={() => handleAction('duplicate')}>
        <span class="menu-icon">📋</span>
        <span class="menu-text">Dupliquer la collection</span>
      </div>
      
      <div class="context-menu-separator"></div>
      
      <div class="context-menu-item" on:click={() => handleAction('export')}>
        <span class="menu-icon">📤</span>
        <span class="menu-text">Exporter la collection</span>
      </div>
      
      <div class="context-menu-item" on:click={() => handleAction('properties')}>
        <span class="menu-icon">ℹ️</span>
        <span class="menu-text">Propriétés</span>
      </div>
      
      <div class="context-menu-separator"></div>
      
      <div class="context-menu-item danger" on:click={() => handleAction('delete')}>
        <span class="menu-icon">🗑️</span>
        <span class="menu-text">Supprimer</span>
        <span class="menu-shortcut">⚠️</span>
      </div>
    {:else}
      <!-- Actions pour collections spéciales -->
      {#if collection.key === 'trash'}
        <div class="context-menu-item" on:click={() => handleAction('emptyTrash')}>
          <span class="menu-icon">🧹</span>
          <span class="menu-text">Vider la corbeille</span>
        </div>
      {:else if collection.key === 'duplicates'}
        <div class="context-menu-item" on:click={() => handleAction('mergeDuplicates')}>
          <span class="menu-icon">🔗</span>
          <span class="menu-text">Fusionner les doublons</span>
        </div>
      {:else}
        <div class="context-menu-item" on:click={() => handleAction('refresh')}>
          <span class="menu-icon">🔄</span>
          <span class="menu-text">Actualiser</span>
        </div>
      {/if}
    {/if}
    
    <!-- Action commune : créer nouvelle collection au même niveau -->
    {#if !isSpecialCollection}
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" on:click={() => handleAction('createSibling')}>
        <span class="menu-icon">➕</span>
        <span class="menu-text">Nouvelle collection</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .collection-context-menu {
    position: fixed;
    background: #383838;
    border: 1px solid #555;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    z-index: 2000;
    min-width: 220px;
    padding: 4px 0;
    font-size: 13px;
    user-select: none;
    backdrop-filter: blur(8px);
  }
  
  .context-menu-item {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    gap: 10px;
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
    width: 18px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .menu-text {
    flex: 1;
    font-weight: 500;
  }
  
  .menu-shortcut {
    font-size: 11px;
    color: #aaa;
    font-weight: 500;
  }
  
  .context-menu-separator {
    height: 1px;
    background: #555;
    margin: 6px 10px;
  }
  
  /* Animation d'apparition */
  .collection-context-menu {
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