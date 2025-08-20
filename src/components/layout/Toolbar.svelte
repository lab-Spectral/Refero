<script>
  import { createEventDispatcher } from 'svelte';
  import { debounce } from '../../utils/index.js';
  
  const dispatch = createEventDispatcher();
  
  export let selectedLibrary = null;
  export let isLoading = false;
  export let searchQuery = '';
  export let sortedItems = [];
  
  // Debounced search
  const debouncedSearch = debounce((query) => {
    dispatch('search', { query });
  }, 200);
  
  function handleSearch(event) {
    debouncedSearch(event.target.value);
  }
  
  function handleNewItem() {
    dispatch('newItem');
  }
  
  function handleShowSettings() {
    dispatch('showSettings');
  }
  
  function handleLogout() {
    dispatch('logout');
  }
</script>

<div class="toolbar">
  <div class="hamburger-container">
    <input type="checkbox" id="hamburger-toggle" class="hamburger-checkbox">
    <label for="hamburger-toggle" class="hamburger-icon">☰</label>
    <div class="hamburger-menu">
      <div class="hamburger-menu-item" on:click={handleShowSettings}>
        <span>⚙️</span>
        <span>Configuration</span>
      </div>
      <div class="hamburger-menu-item" on:click={handleLogout}>
        <span>🚪</span>
        <span>Déconnexion</span>
      </div>
    </div>
  </div>
  
  <div class="toolbar-search">
    <input type="checkbox" id="search-toggle" class="search-checkbox">
    <label for="search-toggle" class="search-icon">🔍</label>
    <div class="search-dropdown">
      <input 
        class="search-input" 
        placeholder="Rechercher titre ou auteur..."
        on:input={handleSearch}
      />
      {#if searchQuery}
        <div class="search-info">
          {sortedItems.length} résultat{sortedItems.length !== 1 ? 's' : ''}
        </div>
      {/if}
    </div>
  </div>
  
  <button class="toolbar-button primary" on:click={handleNewItem}>
    Nouvelle notice
  </button>
  
  <div class="toolbar-center">
    <span class="toolbar-title">Refero</span>
  </div>
  
  <div class="toolbar-right">
    <span style="font-size: 10px; color: #aaa;">entremonde / Spectral lab</span>
  </div>
</div>

<style>
  .toolbar {
    background: #3c3c3c;
    padding: 8px 12px;
    border-bottom: 1px solid #555;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    position: relative;
  }

  .toolbar-button {
    background: #4a4a4a;
    border: 1px solid #666;
    color: #e8e8e8;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .toolbar-button:hover {
    background: #555;
  }

  .toolbar-button.primary {
    background: #5c7cfa;
    border-color: #5c7cfa;
  }

  .toolbar-button.primary:hover {
    background: #4c6ef5;
  }

  .toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hamburger-container {
    position: relative;
    display: inline-block;
    margin-right: 16px;
  }

  .hamburger-checkbox {
    display: none;
  }

  .hamburger-icon {
    color: #e8e8e8;
    cursor: pointer;
    font-size: 29px;
    user-select: none;
    padding: 4px;
    line-height: 1;
    transition: color 0.2s;
  }

  .hamburger-icon:hover {
    color: #5c7cfa;
  }

  .hamburger-checkbox:checked ~ .hamburger-icon {
    color: #5c7cfa;
  }

  .hamburger-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #383838;
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    min-width: 150px;
    margin-top: 4px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
  }

  .hamburger-checkbox:checked ~ .hamburger-menu {
    opacity: 1;
    visibility: visible;
  }

  .hamburger-menu-item {
    padding: 10px 12px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #444;
    transition: background-color 0.2s;
  }

  .hamburger-menu-item:hover {
    background: #444;
  }

  .hamburger-menu-item:last-child {
    border-bottom: none;
  }

  .toolbar-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .toolbar-title {
    font-size: 18px;
    color: #e8e8e8;
    font-weight: bold;
  }

  .toolbar-right {
    margin-left: auto;
  }

  .toolbar-search {
    position: relative;
    margin-left: 8px;
  }

  .search-checkbox {
    display: none;
  }

  .search-icon {
    color: #e8e8e8;
    cursor: pointer;
    font-size: 20px;
    user-select: none;
    padding: 4px;
    transition: color 0.2s;
  }

  .search-icon:hover {
    color: #5c7cfa;
  }

  .search-checkbox:checked ~ .search-icon {
    color: #5c7cfa;
  }

  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 300px;
    padding: 8px;
    background: #383838;
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    margin-top: 4px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
  }

  .search-checkbox:checked ~ .search-dropdown {
    opacity: 1;
    visibility: visible;
  }

  .search-input {
    width: 100%;
    padding: 8px;
    background: #2b2b2b;
    border: 1px solid #555;
    border-radius: 4px;
    color: #e8e8e8;
    font-size: 13px;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #5c7cfa;
  }

  .search-input::placeholder {
    color: #888;
  }

  .search-info {
    padding: 4px 8px;
    font-size: 11px;
    color: #aaa;
    border-top: 1px solid #555;
    margin-top: 4px;
  }
</style>