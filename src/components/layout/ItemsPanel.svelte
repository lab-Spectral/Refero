<script>
  import { createEventDispatcher } from 'svelte';
  import { getItemType } from '../../data/itemTypes.js';
  import { formatDate } from '../../utils/index.js';
  
  const dispatch = createEventDispatcher();
  
  export let selectedCollection = '';
  export let selectedCollectionName = '';
  export let sortedItems = [];
  export let selectedItem = null;
  export let searchQuery = '';
  export let isLoadingItems = false;
  export let sortColumn = 'title';
  export let sortDirection = 'asc';
  
  function handleSort(column) {
    dispatch('sort', { column });
  }
  
  function handleItemSelect(item) {
    dispatch('selectItem', { item });
  }
  
  function handleItemEdit(item) {
    dispatch('editItem', { item });
  }
  
  function handleItemRightClick(event, item) {
    event.preventDefault();
    event.stopPropagation();
    
    dispatch('itemContextMenu', {
      x: event.clientX,
      y: event.clientY,
      item
    });
  }
</script>

<div class="items-panel">
  <div class="items-header">
    <span>{selectedCollectionName || 'Sélectionnez une collection'}</span>
    <span style="font-size: 12px; color: #aaa;">
      {#if isLoadingItems}
        <span class="loading-spinner"></span>
      {:else}
        {sortedItems.length} notice{sortedItems.length !== 1 ? 's' : ''}
        {#if searchQuery}
          <span style="color: #5c7cfa;"> (filtrées)</span>
        {/if}
      {/if}
    </span>
  </div>

  {#if sortedItems.length > 0}
    <div class="items-list-header">
      <span></span>
      <span class="sortable-header {sortColumn === 'title' ? 'active' : ''}" on:click={() => handleSort('title')}>
        Titre
        {#if sortColumn === 'title'}
          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        {/if}
      </span>
      <span class="sortable-header {sortColumn === 'author' ? 'active' : ''}" on:click={() => handleSort('author')}>
        Auteur
        {#if sortColumn === 'author'}
          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        {/if}
      </span>
      <span class="sortable-header {sortColumn === 'modified' ? 'active' : ''}" on:click={() => handleSort('modified')}>
        Modifié
        {#if sortColumn === 'modified'}
          <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        {/if}
      </span>
    </div>
    
    <div class="items-list">
      {#each sortedItems as item (item.key)}
        <div 
          class="item-row {selectedItem === item ? 'selected' : ''}"
          on:click={() => handleItemSelect(item)}
          on:dblclick={() => handleItemEdit(item)}
          on:contextmenu={(e) => handleItemRightClick(e, item)}
        >
          <span class="item-type-icon">{getItemType(item.data.itemType).icon}</span>
          <div class="item-title">{item.data.title || 'Sans titre'}</div>
          <div class="item-creator">
            {item.data.creators?.[0] ? 
              (item.data.creators[0].lastName || '') : 
              ''}
          </div>
          <div class="item-date">{formatDate(item.data?.dateModified || item.dateAdded)}</div>
        </div>
      {/each}
    </div>
  {:else if searchQuery}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">Aucun résultat pour "{searchQuery}"</div>
    </div>
  {:else if selectedCollection}
    <div class="empty-state">
      <div class="empty-icon">📚</div>
      <div class="empty-text">Aucune notice dans cette collection</div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">👈</div>
      <div class="empty-text">Sélectionnez une collection pour voir les notices</div>
    </div>
  {/if}
</div>

<style>
  .items-panel {
    flex: 1;
    background: #2b2b2b;
    display: flex;
    flex-direction: column;
  }

  .items-header {
    padding: 12px;
    background: #3c3c3c;
    border-bottom: 1px solid #555;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .items-list {
    flex: 1;
    overflow-y: auto;
  }

  .items-list-header {
    display: grid;
    grid-template-columns: 30px 1fr 150px 80px;
    gap: 12px;
    padding: 8px 12px;
    background: #3c3c3c;
    border-bottom: 1px solid #555;
    font-size: 12px;
    font-weight: 600;
    color: #bbb;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .sortable-header {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }

  .sortable-header:hover {
    color: #e8e8e8;
  }

  .sortable-header.active {
    color: #5c7cfa;
  }

  .sort-indicator {
    font-size: 10px;
    opacity: 0.8;
  }

  .item-row {
    display: grid;
    grid-template-columns: 30px 1fr 150px 80px;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid #444;
    cursor: pointer;
    font-size: 13px;
    align-items: center;
    transition: background-color 0.2s, transform 0.1s;
  }

  .item-row:hover {
    background: #333;
    transform: translateY(-1px);
  }

  .item-row:active {
    transform: translateY(0);
  }

  .item-row.selected {
    background: #4a4a4a;
  }

  .item-type-icon {
    font-size: 16px;
    text-align: center;
  }

  .item-title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-creator {
    color: #aaa;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-date {
    color: #aaa;
    text-align: right;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    font-size: 14px;
    gap: 8px;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  .empty-text {
    text-align: center;
    max-width: 300px;
    line-height: 1.4;
  }

  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #555;
    border-radius: 50%;
    border-top-color: #5c7cfa;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>