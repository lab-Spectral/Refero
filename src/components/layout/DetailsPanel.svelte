<script>
  import { getItemType, getFieldLabel, getCreatorTypeLabel } from '../../data/itemTypes.js';
  import { formatDate, extractOriginalDate, updateExtraWithOriginalDate } from '../../utils/index.js';
  
  // Props reçues du composant parent
  export let selectedItem = null;
  export let editingItem = null;
  export let currentItem = null;
  export let isLoading = false;
  export let error = null;
  export let width = 300;
  export let selectedCollection = '';
  
  // Events émis vers le parent
  export let onEdit = () => {};
  export let onCreate = () => {};
  export let onUpdate = () => {};
  export let onDelete = () => {};
  export let onCancel = () => {};
  export let onClearError = () => {};
  export let onStartResize = () => {};
  
  // État local
  $: isEditing = !!editingItem;
  $: isCreating = !selectedItem && !editingItem;
  $: currentItemType = getItemType(currentItem?.itemType);
  $: canCreate = selectedCollection && !['duplicates', 'uncategorized', 'trash'].includes(selectedCollection);
  
  // Gestion des créateurs
  function addCreator() {
    if (editingItem) {
      editingItem.data.creators = [...editingItem.data.creators, { creatorType: 'author', firstName: '', lastName: '' }];
    } else if (currentItem) {
      currentItem.creators = [...currentItem.creators, { creatorType: 'author', firstName: '', lastName: '' }];
    }
  }
  
  function removeCreator(index) {
    if (editingItem) {
      editingItem.data.creators = editingItem.data.creators.filter((_, i) => i !== index);
    } else if (currentItem) {
      currentItem.creators = currentItem.creators.filter((_, i) => i !== index);
    }
  }
  
  // Gestion de la date originale
  function handleOriginalDateChange() {
    if (!currentItem) return;
    currentItem.extra = updateExtraWithOriginalDate(currentItem.extra || '', currentItem.originalDate || '');
  }
  
  // Handlers pour les actions
  async function handleCreate() {
    try {
      await onCreate(currentItem);
    } catch (err) {
      alert(`Erreur lors de la création: ${err.message}`);
    }
  }
  
  async function handleUpdate() {
    if (!editingItem) return;
    try {
      await onUpdate(editingItem, editingItem.data);
    } catch (err) {
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    }
  }
  
  async function handleDelete() {
    if (!editingItem) return;
    
    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer la notice "${editingItem.data.title || 'Sans titre'}" ?\n\nCette action est irréversible.`
    );
    
    if (!confirmDelete) return;
    
    try {
      await onDelete(editingItem);
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err.message}`);
    }
  }
</script>

<div class="details-panel" style="width: {width}px;">
  <div class="details-resize-handle" on:mousedown={onStartResize}></div>
  
  <div class="details-header">
    {#if isEditing}
      Modifier
    {:else if selectedItem}
      Détails
    {:else}
      Nouvelle notice
    {/if}
  </div>
  
  <div class="details-content">
    {#if error}
      <div class="error-message">
        {error}
        <button class="error-close" on:click={onClearError}>×</button>
      </div>
    {/if}

    {#if selectedItem && !isEditing}
      <!-- ===== MODE LECTURE SEULE ===== -->
      <div class="field-group">
        <span class="field-label">Type: {getItemType(selectedItem.data.itemType).label}</span>
      </div>
      
      <div class="field-group">
        <span class="field-label">Titre</span>
        <div class="field-value">{selectedItem.data.title || 'Sans titre'}</div>
      </div>

      <div class="field-group">
        <span class="field-label">Auteurs</span>
        <div class="field-value">
          {#if selectedItem.data.creators && selectedItem.data.creators.length > 0}
            {#each selectedItem.data.creators as creator}
              <div class="creator-detail">
                <strong>{getCreatorTypeLabel(creator.creatorType)} :</strong> 
                {creator.firstName || ''} {creator.lastName || ''}
              </div>
            {/each}
          {:else}
            <span class="empty-value">Non spécifié</span>
          {/if}
        </div>
      </div>

      <!-- Date de publication originale -->
      <div class="field-group">
        <span class="field-label">Date de publication originale</span>
        <div class="field-value">
          {#if extractOriginalDate(selectedItem.data.extra || '')}
            {extractOriginalDate(selectedItem.data.extra || '')}
          {:else}
            <span class="empty-value highlight">Non spécifiée</span>
          {/if}
        </div>
      </div>

      <!-- Date de publication -->
      {#if selectedItem.data.date}
        <div class="field-group">
          <span class="field-label">Date de publication</span>
          <div class="field-value">{selectedItem.data.date}</div>
        </div>
      {/if}

      <!-- Lieu de publication -->
      {#if selectedItem.data.place}
        <div class="field-group">
          <span class="field-label">Lieu</span>
          <div class="field-value">{selectedItem.data.place}</div>
        </div>
      {/if}

      <!-- Maison d'édition -->
      {#if selectedItem.data.publisher}
        <div class="field-group">
          <span class="field-label">Maison d'édition</span>
          <div class="field-value">{selectedItem.data.publisher}</div>
        </div>
      {/if}

      <!-- ISBN -->
      {#if selectedItem.data.ISBN}
        <div class="field-group">
          <span class="field-label">ISBN</span>
          <div class="field-value">{selectedItem.data.ISBN}</div>
        </div>
      {/if}

      <!-- Champs supplémentaires (même structure que l'original) -->
      {#if selectedItem.data.edition}
        <div class="field-group">
          <span class="field-label">Édition</span>
          <div class="field-value">{selectedItem.data.edition}</div>
        </div>
      {/if}

      {#if selectedItem.data.volume}
        <div class="field-group">
          <span class="field-label">Volume</span>
          <div class="field-value">{selectedItem.data.volume}</div>
        </div>
      {/if}

      {#if selectedItem.data.series}
        <div class="field-group">
          <span class="field-label">Collection</span>
          <div class="field-value">{selectedItem.data.series}</div>
        </div>
      {/if}

      {#if selectedItem.data.numPages}
        <div class="field-group">
          <span class="field-label">Nombre de pages</span>
          <div class="field-value">{selectedItem.data.numPages}</div>
        </div>
      {/if}

      {#if selectedItem.data.DOI}
        <div class="field-group">
          <span class="field-label">DOI</span>
          <div class="field-value">
            <a href="https://doi.org/{selectedItem.data.DOI}" target="_blank" class="doi-link">
              {selectedItem.data.DOI}
            </a>
          </div>
        </div>
      {/if}

      {#if selectedItem.data.abstractNote}
        <div class="field-group">
          <span class="field-label">Résumé</span>
          <div class="field-value abstract">{selectedItem.data.abstractNote}</div>
        </div>
      {/if}

      {#if selectedItem.data.url}
        <div class="field-group">
          <span class="field-label">URL</span>
          <div class="field-value">
            <a href={selectedItem.data.url} target="_blank" class="url-link">
              {selectedItem.data.url}
            </a>
          </div>
        </div>
      {/if}

      <!-- Extra (sans la date originale) -->
      {#if selectedItem.data.extra}
        {@const cleanExtra = selectedItem.data.extra.replace(/^original-date:\s*.+$/m, '').trim()}
        {#if cleanExtra}
          <div class="field-group">
            <span class="field-label">Extra</span>
            <div class="field-value extra">{cleanExtra}</div>
          </div>
        {/if}
      {/if}

      <div class="action-buttons">
        <button class="action-button primary" on:click={() => onEdit(selectedItem)}>
          Modifier
        </button>
      </div>

    {:else}
      <!-- ===== MODE ÉDITION/CRÉATION ===== -->
      <div class="field-group">
        <label class="field-label">{getFieldLabel('title')}</label>
        <input class="field-input" bind:value={currentItem.title} />
      </div>

      <!-- Gestion des créateurs -->
      <div class="field-group">
        <label class="field-label">{getFieldLabel('creators')}</label>
        {#each currentItem.creators as creator, index}
          <div class="creator-row">
            <div class="creator-header">
              <div class="creator-type">
                <select class="field-select" bind:value={creator.creatorType}>
                  <option value="author">Auteur</option>
                  <option value="contributor">Collaborateur</option>
                  <option value="seriesEditor">Directeur de coll.</option>
                  <option value="editor">Éditeur</option>
                  <option value="translator">Traducteur</option>
                </select>
              </div>
              {#if currentItem.creators.length > 1}
                <button class="creator-remove" on:click={() => removeCreator(index)}>×</button>
              {/if}
            </div>
            <div class="creator-inputs">
              <div class="creator-input">
                <input class="field-input" placeholder="Prénom" bind:value={creator.firstName} />
              </div>
              <div class="creator-input">
                <input class="field-input" placeholder="Nom" bind:value={creator.lastName} />
              </div>
            </div>
          </div>
        {/each}
        <button class="creator-add" on:click={addCreator}>+ Ajouter un auteur</button>
      </div>

      <div class="field-group">
        <label class="field-label">Type de document</label>
        <select class="field-select" bind:value={currentItem.itemType}>
          <option value="book">Livre</option>
          <option value="bookSection">Chapitre de livre</option>
          <option value="journalArticle">Article de revue</option>
          <option value="magazineArticle">Article de magazine</option>
          <option value="newspaperArticle">Article de journal</option>
          <option value="conferencePaper">Article de colloque</option>
          <option value="webpage">Page Web</option>
          <option value="thesis">Thèse</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('originalDate')}</label>
        <input class="field-input" bind:value={currentItem.originalDate} on:input={handleOriginalDateChange} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('date')}</label>
        <input class="field-input" bind:value={currentItem.date} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('place')}</label>
        <input class="field-input" bind:value={currentItem.place} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('publisher')}</label>
        <input class="field-input" bind:value={currentItem.publisher} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('abstractNote')}</label>
        <textarea class="field-textarea" bind:value={currentItem.abstractNote}></textarea>
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('url')}</label>
        <input class="field-input" placeholder="https://..." bind:value={currentItem.url} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('language')}</label>
        <input class="field-input" bind:value={currentItem.language} />
      </div>

      <div class="field-group">
        <label class="field-label">{getFieldLabel('extra')}</label>
        <textarea class="field-textarea" bind:value={currentItem.extra}></textarea>
      </div>

      <div class="action-buttons">
        {#if isEditing}
          <button 
            class="action-button primary" 
            on:click={handleUpdate}
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
            {:else}
              Sauvegarder
            {/if}
          </button>
          <button class="action-button secondary" on:click={onCancel}>
            Annuler
          </button>
          <button 
            class="action-button danger" 
            on:click={handleDelete}
            disabled={isLoading}
          >
            Supprimer
          </button>
        {:else}
          <button 
            class="action-button primary" 
            on:click={handleCreate} 
            disabled={isLoading}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
            {:else}
              Ajouter
            {/if}
          </button>
          <button class="action-button secondary" on:click={onCancel}>
            Annuler
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .details-panel {
    background: #383838;
    border-left: 1px solid #555;
    overflow-y: auto;
    position: relative;
  }

  .details-resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    cursor: ew-resize;
    background: transparent;
    z-index: 10;
    transition: background-color 0.2s;
  }

  .details-resize-handle:hover {
    background: #5c7cfa;
  }

  .details-header {
    padding: 12px;
    background: #3c3c3c;
    border-bottom: 1px solid #555;
    font-weight: 600;
    font-size: 13px;
  }

  .details-content {
    padding: 16px;
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

  .field-select {
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

  .field-select:focus {
    outline: none;
    border-color: #5c7cfa;
  }

  .field-textarea {
    width: 100%;
    padding: 6px 8px;
    background: #2b2b2b;
    border: 1px solid #555;
    border-radius: 4px;
    color: #e8e8e8;
    font-size: 13px;
    box-sizing: border-box;
    min-height: 80px;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .field-textarea:focus {
    outline: none;
    border-color: #5c7cfa;
  }

  /* Styles pour le mode lecture */
  .field-value {
    padding: 6px 0;
    font-size: 13px;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .field-value.abstract {
    white-space: pre-wrap;
    max-height: 120px;
    overflow-y: auto;
    background: #2b2b2b;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #444;
  }

  .field-value.extra {
    white-space: pre-wrap;
    background: #2b2b2b;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #444;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  .creator-detail {
    margin-bottom: 4px;
  }

  .creator-detail:last-child {
    margin-bottom: 0;
  }

  .empty-value {
    color: #888;
    font-style: italic;
  }

  .empty-value.highlight {
    color: #ffc107;
    font-weight: 500;
  }

  .doi-link, .url-link {
    color: #5c7cfa;
    text-decoration: underline;
    word-break: break-all;
    transition: color 0.2s;
  }

  .doi-link:hover, .url-link:hover {
    color: #4c6ef5;
    text-decoration: none;
  }

  .details-content .field-group {
    margin-bottom: 12px;
    border-bottom: 1px solid #444;
    padding-bottom: 8px;
  }

  .details-content .field-group:last-of-type:not(.action-buttons) {
    border-bottom: none;
  }

  /* Styles pour les créateurs */
  .creator-row {
    margin-bottom: 16px;
    padding: 12px;
    background: #2b2b2b;
    border-radius: 6px;
    border: 1px solid #444;
  }

  .creator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .creator-type {
    flex: 1;
    margin-right: 8px;
  }

  .creator-inputs {
    display: flex;
    gap: 8px;
  }

  .creator-input {
    flex: 1;
  }

  .creator-remove {
    background: #dc3545;
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }

  .creator-remove:hover {
    background: #c82333;
  }

  .creator-add {
    background: #28a745;
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-top: 8px;
    transition: background-color 0.2s;
  }

  .creator-add:hover {
    background: #218838;
  }

  /* Boutons d'action */
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

  .action-button.secondary {
    background: #666;
    color: white;
  }

  .action-button.danger {
    background: #dc3545;
    color: white;
  }

  .action-button:hover.primary {
    background: #4c6ef5;
  }

  .action-button:hover.secondary {
    background: #777;
  }

  .action-button:hover.danger {
    background: #c82333;
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Message d'erreur */
  .error-message {
    background: #dc3545;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
    position: relative;
  }

  .error-close {
    float: right;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  /* Loading spinner */
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