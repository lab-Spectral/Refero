<script>
  import { createEventDispatcher } from 'svelte';
  import { SPECIAL_COLLECTIONS } from '../../data/itemTypes.js';
  
  const dispatch = createEventDispatcher();
  
  export let selectedLibrary = null;
  export let flatCollections = [];
  export let selectedCollection = '';
  export let width = 250;
  
  function handleCollectionSelect(collectionKey) {
    dispatch('selectCollection', { collectionKey });
  }
  
  function handleCollectionRightClick(event, collection) {
    event.preventDefault();
    event.stopPropagation();
    
    const isSpecial = SPECIAL_COLLECTIONS.some(c => c.key === collection.key);
    
    dispatch('collectionContextMenu', {
      x: event.clientX,
      y: event.clientY,
      collection,
      isSpecial
    });
  }
  
  function handleResizeStart(event) {
    dispatch('resizeStart', { event, type: 'collections' });
  }
</script>

<div class="collections-panel" style="width: {width}px;">
  <div class="collections-header">
    {selectedLibrary ? selectedLibrary.name : 'Collections'}
  </div>
  
  <!-- Collections utilisateur -->
  {#each flatCollections as collection}
    <div 
      class="collection-item level-{collection.level} {selectedCollection === collection.key ? 'selected' : ''}"
      on:click={() => handleCollectionSelect(collection.key)}
      on:contextmenu={(e) => handleCollectionRightClick(e, collection)}
    >
      <span class="collection-icon">📁</span>
      {collection.data.name}
    </div>
  {/each}
  
  <!-- Collections spéciales -->
  {#each SPECIAL_COLLECTIONS as collection}
    <div 
      class="collection-item special {selectedCollection === collection.key ? 'selected' : ''}"
      on:click={() => handleCollectionSelect(collection.key)}
      on:contextmenu={(e) => handleCollectionRightClick(e, collection)}
    >
      <span class="collection-icon">{collection.icon}</span>
      {collection.data.name}
    </div>
  {/each}
  
  <div class="resize-handle" on:mousedown={handleResizeStart}></div>
</div>

<style>
  .collections-panel {
    background: #383838;
    border-right: 1px solid #555;
    overflow-y: auto;
    position: relative;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    z-index: 10;
    transition: background-color 0.2s;
  }

  .resize-handle:hover {
    background: #5c7cfa;
  }

  .collections-header {
    padding: 12px;
    background: #3c3c3c;
    border-bottom: 1px solid #555;
    font-weight: 600;
    font-size: 13px;
  }

  .collection-item {
    padding: 8px 16px;
    cursor: pointer;
    border-bottom: 1px solid #444;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;
    user-select: none;
  }

  .collection-item.level-1 {
    padding-left: 32px;
  }

  .collection-item.level-2 {
    padding-left: 48px;
  }

  .collection-item.level-3 {
    padding-left: 64px;
  }

  .collection-item.special {
    border-top: 1px solid #555;
    color: #ccc;
    font-style: italic;
  }

  .collection-item.special:first-of-type {
    margin-top: 8px;
  }

  .collection-item:hover {
    background: #444;
  }

  .collection-item.selected {
    background: #5c7cfa;
    color: white;
  }

  .collection-icon {
    font-size: 16px;
  }
</style>