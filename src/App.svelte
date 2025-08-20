<script>
  import { onMount } from 'svelte';
  import {
    apiKey,
    isAuthenticated,
    libraries,
    selectedLibrary,
    selectedCollection,
    sortedItems,
    flatCollections,
    currentItem,
    selectedItem,
    editingItem,
    showAuthModal,
    searchQuery,
    sortColumn,
    sortDirection,
    uiPreferences,
    isLoading,
    isLoadingItems,
    error,
    appActions,
    collections
  } from './stores/appStore.js';
  
  import { SPECIAL_COLLECTIONS } from './data/itemTypes.js';
  
  // Composants
  import Toolbar from './components/layout/Toolbar.svelte';
  import CollectionsPanel from './components/layout/CollectionsPanel.svelte';
  import ItemsPanel from './components/layout/ItemsPanel.svelte';
  import DetailsPanel from './components/layout/DetailsPanel.svelte';
  import ContextMenu from './components/ui/ContextMenu.svelte';
  import CollectionContextMenu from './components/ui/CollectionContextMenu.svelte';
  import CollectionModal from './components/ui/CollectionModal.svelte';
  import NotificationContainer from './components/ui/NotificationContainer.svelte';
  
  // Services et handlers
  import { ContextMenuHandlers, ToolbarHandlers, PanelHandlers, CollectionModalHandlers } from './handlers/eventHandlers.js';
  import { DetailsPanelHandlers } from './handlers/detailsPanelHandlers.js';
  import { ResizeHandlers } from './handlers/resizeHandlers.js';
  import AuthModal from './components/ui/AuthModal.svelte';
  
  // UI state
  let contextMenu = { visible: false, x: 0, y: 0, item: null };
  let collectionContextMenu = { visible: false, x: 0, y: 0, collection: null, isSpecial: false };
  let collectionModal = { visible: false, mode: 'create', collectionName: '', parentCollection: null };
  
  // Initialize app
  onMount(() => {
    appActions.init();
  });
  
  // Reactive statements
  $: selectedCollectionName = getCollectionDisplayName($selectedCollection);
  
  function getCollectionDisplayName(collectionKey) {
    if (!collectionKey) return '';
    
    const specialCollection = SPECIAL_COLLECTIONS.find(c => c.key === collectionKey);
    if (specialCollection) {
      return specialCollection.data.name;
    }
    
    const collections = $flatCollections;
    const collection = collections.find(c => c.key === collectionKey);
    return collection?.data?.name || '';
  }
  
  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  // Toolbar events
  function handleToolbarSearch(event) {
    ToolbarHandlers.handleSearch(event.detail.query);
  }
  
  function handleToolbarNewItem() {
    ToolbarHandlers.handleNewItem();
  }
  
  function handleToolbarShowSettings() {
    ToolbarHandlers.handleShowSettings(showAuthModal.set);
  }
  
  function handleToolbarLogout() {
    ToolbarHandlers.handleLogout();
  }
  
  // Collections panel events
  function handleCollectionSelect(event) {
    PanelHandlers.handleCollectionSelect(event.detail.collectionKey);
  }
  
  function handleCollectionContextMenu(event) {
    const { x, y, collection, isSpecial } = event.detail;
    collectionContextMenu = { visible: true, x, y, collection, isSpecial };
  }
  
  function handleCollectionResize(event) {
    ResizeHandlers.startCollectionsResize(event.detail.event, appActions.updateUIPreferences);
  }
  
  // Items panel events
  function handleItemSelect(event) {
    PanelHandlers.handleItemSelect(event.detail.item);
  }
  
  function handleItemEdit(event) {
    PanelHandlers.handleItemEdit(event.detail.item);
  }
  
  function handleItemContextMenu(event) {
    const { x, y, item } = event.detail;
    contextMenu = { visible: true, x, y, item };
  }
  
  function handleItemsSort(event) {
    PanelHandlers.handleSort(event.detail.column, $sortColumn, $sortDirection);
  }
  
  function handleDetailsResize(event) {
    ResizeHandlers.startDetailsResize(event.detail.event, appActions.updateUIPreferences);
  }
  
  // Context menu actions
  async function handleContextMenuAction(event) {
    await ContextMenuHandlers.handleItemAction(event.type, event.detail.item);
    contextMenu.visible = false;
  }
  
  async function handleCollectionContextMenuAction(event) {
    await ContextMenuHandlers.handleCollectionAction(
      event.type, 
      event.detail.collection, 
      openCollectionModal
    );
    collectionContextMenu.visible = false;
  }
  
  // Collection modal
  function openCollectionModal(mode, name = '', parent = null) {
    collectionModal = {
      visible: true,
      mode: mode,
      collectionName: name,
      parentCollection: parent
    };
  }
  
  async function handleCollectionModalSubmit(event) {
    const { name, mode, parentCollection } = event.detail;
    
    const success = await CollectionModalHandlers.handleSubmit(name, mode, parentCollection);
    if (success) {
      collectionModal.visible = false;
    }
  }
</script>

<!-- AUTH MODAL -->
<AuthModal />

<!-- MAIN APP -->
<div class="app">
  <!-- Toolbar -->
  <Toolbar 
    selectedLibrary={$selectedLibrary}
    isLoading={$isLoading}
    searchQuery={$searchQuery}
    sortedItems={$sortedItems}
    on:search={handleToolbarSearch}
    on:newItem={handleToolbarNewItem}
    on:showSettings={handleToolbarShowSettings}
    on:logout={handleToolbarLogout}
  />

  <!-- Main container with panels -->
  <div class="main-container">
    <!-- Collections Panel -->
    <CollectionsPanel 
      selectedLibrary={$selectedLibrary}
      flatCollections={$flatCollections}
      selectedCollection={$selectedCollection}
      width={$uiPreferences.collectionsWidth}
      on:selectCollection={handleCollectionSelect}
      on:collectionContextMenu={handleCollectionContextMenu}
      on:resizeStart={handleCollectionResize}
    />

    <!-- Items Panel -->
    <ItemsPanel 
      selectedCollection={$selectedCollection}
      {selectedCollectionName}
      sortedItems={$sortedItems}
      selectedItem={$selectedItem}
      searchQuery={$searchQuery}
      isLoadingItems={$isLoadingItems}
      sortColumn={$sortColumn}
      sortDirection={$sortDirection}
      on:selectItem={handleItemSelect}
      on:editItem={handleItemEdit}
      on:itemContextMenu={handleItemContextMenu}
      on:sort={handleItemsSort}
    />

    <!-- Details Panel -->
    <DetailsPanel 
      selectedItem={$selectedItem}
      editingItem={$editingItem}
      currentItem={$currentItem}
      isLoading={$isLoading}
      error={$error}
      width={$uiPreferences.detailsWidth}
      selectedCollection={$selectedCollection}
      onEdit={(item) => appActions.editItem(item)}
      onCreate={DetailsPanelHandlers.handleCreate}
      onUpdate={DetailsPanelHandlers.handleUpdate}
      onDelete={(item) => appActions.deleteItem(item)}
      onCancel={() => appActions.resetForm()}
      onClearError={() => appActions.clearError()}
      onStartResize={handleDetailsResize}
    />
  </div>
</div>

<!-- Context Menus -->
<ContextMenu 
  bind:visible={contextMenu.visible}
  x={contextMenu.x}
  y={contextMenu.y}
  item={contextMenu.item}
  on:view={handleContextMenuAction}
  on:edit={handleContextMenuAction}
  on:duplicate={handleContextMenuAction}
  on:export={handleContextMenuAction}
  on:copyTitle={handleContextMenuAction}
  on:copyUrl={handleContextMenuAction}
  on:delete={handleContextMenuAction}
/>

<CollectionContextMenu 
  bind:visible={collectionContextMenu.visible}
  x={collectionContextMenu.x}
  y={collectionContextMenu.y}
  collection={collectionContextMenu.collection}
  isSpecialCollection={collectionContextMenu.isSpecial}
  on:createSubCollection={handleCollectionContextMenuAction}
  on:createSibling={handleCollectionContextMenuAction}
  on:rename={handleCollectionContextMenuAction}
  on:duplicate={handleCollectionContextMenuAction}
  on:export={handleCollectionContextMenuAction}
  on:properties={handleCollectionContextMenuAction}
  on:delete={handleCollectionContextMenuAction}
  on:emptyTrash={handleCollectionContextMenuAction}
  on:mergeDuplicates={handleCollectionContextMenuAction}
  on:refresh={handleCollectionContextMenuAction}
/>

<!-- Collection Modal -->
<CollectionModal 
  bind:visible={collectionModal.visible}
  mode={collectionModal.mode}
  bind:collectionName={collectionModal.collectionName}
  parentCollection={collectionModal.parentCollection}
  on:submit={handleCollectionModalSubmit}
  on:cancel={() => collectionModal.visible = false}
/>

<!-- Notifications -->
<NotificationContainer />

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #2b2b2b;
    color: #e8e8e8;
    overflow: hidden;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .main-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
</style>