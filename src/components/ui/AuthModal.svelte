<script>
  import {
    apiKey,
    libraries,
    selectedLibrary,
    showAuthModal,
    isLoading,
    error,
    appActions
  } from '../../stores/appStore.js';
</script>

{#if $showAuthModal}
<div class="modal">
  <div class="modal-content">
    <div class="modal-title">Configuration Zotero</div>
    
    {#if $error}
      <div class="error-message">{$error}</div>
    {/if}
    
    <div class="field-group">
      <label class="field-label">Clé API</label>
      <input class="field-input" placeholder="Votre clé API Zotero" bind:value={$apiKey} />
    </div>
    
    {#if $libraries.length === 0}
      <div class="action-buttons">
        <button 
          class="action-button primary" 
          on:click={() => appActions.authenticate($apiKey)}
          disabled={$isLoading || !$apiKey}
        >
          {#if $isLoading}
            <span class="loading-spinner"></span>
          {:else}
            Se connecter
          {/if}
        </button>
      </div>
    {:else}
      <div class="field-group">
        <label class="field-label">Sélectionnez une bibliothèque</label>
        <div class="library-list">
          {#each $libraries as library}
            <div 
              class="library-item {$selectedLibrary && $selectedLibrary.id === library.id && $selectedLibrary.type === library.type ? 'selected' : ''}" 
              on:click={() => appActions.selectLibrary(library)}
            >
              <span class="library-icon">
                {library.type === 'user' ? '👤' : '👥'}
              </span>
              <span>{library.name}</span>
              {#if $selectedLibrary && $selectedLibrary.id === library.id && $selectedLibrary.type === library.type}
                <span style="margin-left: auto; color: #5c7cfa;">✓</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #383838;
    padding: 24px;
    border-radius: 8px;
    width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    border: 1px solid #555;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .field-group {
    margin-bottom: 16px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #bbb;
    margin-bottom: 4px;
  }

  .field-input {
    width: 100%;
    padding: 6px 8px;
    background: #2b2b2b;
    border: 1px solid #555;
    border-radius: 4px;
    color: #e8e8e8;
    font-size: 13px;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .field-input:focus {
    outline: none;
    border-color: #5c7cfa;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .action-button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .action-button.primary {
    background: #5c7cfa;
    color: white;
  }

  .action-button:hover.primary {
    background: #4c6ef5;
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .library-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #555;
    border-radius: 4px;
    background: #2b2b2b;
    margin-top: 8px;
  }

  .library-item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid #444;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;
  }

  .library-item:hover {
    background: #333;
  }

  .library-item:last-child {
    border-bottom: none;
  }

  .library-icon {
    font-size: 16px;
  }

  .library-item.selected {
    background: #4a4a4a;
    border-left: 3px solid #5c7cfa;
  }

  .error-message {
    background: #dc3545;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
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