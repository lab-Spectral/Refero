<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let visible = false;
  export let mode = 'create'; // 'create', 'rename', 'createSub'
  export let collectionName = '';
  export let parentCollection = null;
  
  let inputElement;
  let isLoading = false;
  
  $: modalTitle = getModalTitle(mode);
  $: placeholder = getPlaceholder(mode);
  
  function getModalTitle(mode) {
    switch (mode) {
      case 'create':
        return 'Nouvelle collection';
      case 'createSub':
        return 'Nouvelle sous-collection';
      case 'rename':
        return 'Renommer la collection';
      default:
        return 'Collection';
    }
  }
  
  function getPlaceholder(mode) {
    switch (mode) {
      case 'create':
        return 'Nom de la nouvelle collection';
      case 'createSub':
        return 'Nom de la sous-collection';
      case 'rename':
        return 'Nouveau nom';
      default:
        return 'Nom de la collection';
    }
  }
  
  function handleSubmit() {
    if (!collectionName.trim()) return;
    
    dispatch('submit', {
      name: collectionName.trim(),
      mode,
      parentCollection
    });
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }
  
  // Focus l'input quand la modale s'ouvre
  $: if (visible && inputElement) {
    setTimeout(() => {
      inputElement.focus();
      inputElement.select();
    }, 100);
  }
</script>

{#if visible}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{modalTitle}</h3>
      </div>
      
      <div class="modal-body">
        {#if parentCollection}
          <div class="parent-info">
            <span class="parent-label">Dans :</span>
            <span class="parent-name">📁 {parentCollection.data.name}</span>
          </div>
        {/if}
        
        <div class="input-group">
          <label class="input-label">Nom de la collection</label>
          <input 
            bind:this={inputElement}
            bind:value={collectionName}
            class="collection-input"
            placeholder={placeholder}
            on:keydown={handleKeydown}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-secondary" 
          on:click={handleCancel}
          disabled={isLoading}
        >
          Annuler
        </button>
        <button 
          class="btn btn-primary" 
          on:click={handleSubmit}
          disabled={!collectionName.trim() || isLoading}
        >
          {#if isLoading}
            <span class="loading-spinner"></span>
          {:else}
            {mode === 'rename' ? 'Renommer' : 'Créer'}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2500;
    animation: modalOverlayAppear 0.2s ease-out;
  }
  
  .modal-content {
    background: #383838;
    border-radius: 8px;
    width: 450px;
    max-width: 90vw;
    border: 1px solid #555;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: modalContentAppear 0.2s ease-out;
  }
  
  .modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #555;
  }
  
  .modal-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e8e8e8;
  }
  
  .modal-body {
    padding: 20px 24px;
  }
  
  .parent-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: #2b2b2b;
    border-radius: 6px;
    border: 1px solid #444;
  }
  
  .parent-label {
    font-size: 12px;
    color: #aaa;
    font-weight: 500;
  }
  
  .parent-name {
    font-size: 13px;
    color: #e8e8e8;
    font-weight: 500;
  }
  
  .input-group {
    margin-bottom: 0;
  }
  
  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #bbb;
    margin-bottom: 6px;
  }
  
  .collection-input {
    width: 100%;
    padding: 10px 12px;
    background: #2b2b2b;
    border: 1px solid #555;
    border-radius: 6px;
    color: #e8e8e8;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .collection-input:focus {
    outline: none;
    border-color: #5c7cfa;
    box-shadow: 0 0 0 3px rgba(92, 124, 250, 0.1);
  }
  
  .collection-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .collection-input::placeholder {
    color: #888;
  }
  
  .modal-footer {
    padding: 16px 24px 20px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    border-top: 1px solid #555;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .btn-primary {
    background: #5c7cfa;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #4c6ef5;
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: #666;
    color: white;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #777;
  }
  
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #555;
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s linear infinite;
  }
  
  @keyframes modalOverlayAppear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalContentAppear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>