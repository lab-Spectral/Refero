<img src="docs/images/refero-logo.png" alt="Mon logo" width="200"/>

# Refero

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Svelte](https://img.shields.io/badge/Svelte-4.x-ff3e00)](https://svelte.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev/)

**A modern, customizable web client for Zotero research libraries**

Refero is a cutting-edge web application that revolutionizes how researchers interact with their Zotero libraries. Built with modern web technologies, it provides an intuitive three-pane interface with unprecedented customization capabilities, allowing users to tailor their bibliographic workflow to their specific research needs.

## Key Features

### **Advanced Customization**
- **Flexible Field Configuration**: Enable/disable fields per item type
- **Custom Fields**: Add specialized fields stored in Zotero's "extra" field
- **Adaptive Interface**: Three-pane layout with resizable panels
- **Item Type Specialization**: Configure which fields appear for each reference type

### **Modern Architecture**
- **Real-time Synchronization**: Direct integration with Zotero Web API
- **Reactive Interface**: Svelte-powered responsive UI
- **Performance Optimized**: Vite build system with code splitting
- **Dark Theme**: Professional research-focused design

### **Research-Focused Workflow**
- **Hierarchical Collections**: Navigate complex library structures
- **Advanced Search**: Multi-field search with real-time filtering
- **Contextual Actions**: Right-click menus for efficient operations
- **Bulk Operations**: Manage multiple references simultaneously

## Architecture Overview

Refero follows a modular architecture designed for maintainability and extensibility:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Collections     │ Items Panel     │ Details Panel           │
│ Panel           │                 │                         │
│ • Tree view     │ • Sortable list │ • Form editor          │
│ • Context menus │ • Search filter │ • Field customization  │
│ • Drag & drop   │ • Multi-select  │ • Real-time validation  │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    State Management                         │
│ • Svelte Stores (reactive)                                  │
│ • Derived computations                                      │
│ • Action dispatchers                                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Zotero API      │ Storage Service │ Collection Actions      │
│ Service         │                 │ Service                 │
│ • Authentication│ • Local storage │ • CRUD operations       │
│ • HTTP requests │ • Preferences   │ • Batch operations      │
│ • Error handling│ • Caching       │ • Import/Export         │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Zotero Web API                          │
│ • Collections, Items, Libraries                             │
│ • Real-time synchronization                                 │
│ • Cross-platform compatibility                              │
└─────────────────────────────────────────────────────────────┘
```

## Technical Stack

### **Frontend Framework**
- **[Svelte 4.x](https://svelte.dev/)**: Compile-time optimized framework
- **Reactive Stores**: Centralized state management with `writable` and `derived` stores
- **Component Architecture**: Modular UI components with event-driven communication

### **Build System**
- **[Vite 5.x](https://vitejs.dev/)**: Lightning-fast development and build tool
- **ES2020 Target**: Modern JavaScript with optimal browser support
- **Code Splitting**: Vendor chunks for optimal loading performance
- **Source Maps**: Full debugging support in development

### **Development Tools**
- **Hot Module Replacement**: Instant feedback during development
- **ESBuild Minification**: Fast, efficient production builds
- **CORS Configuration**: Development server with API proxy support

## Core Components

### **State Management (`src/stores/appStore.js`)**
```javascript
// Core application state
export const selectedCollection = writable('');
export const sortedItems = derived([filteredItems, sortColumn], ...);

// Centralized actions
export const appActions = {
  async selectLibrary(library) { /* Load collections & items */ },
  async authenticate(apiKey) { /* Validate API access */ },
  // ... other actions
};
```

### **Zotero Integration (`src/services/zoteroService.js`)**
```javascript
class ZoteroService {
  async request(endpoint, options) {
    // Unified API communication
    // Error handling with ZoteroError
    // Rate limiting compliance
  }
}
```

### **Item Type Configuration (`src/data/itemTypes.js`)**
```javascript
export const ITEM_TYPES = {
  book: {
    label: 'Book',
    icon: '📚',
    fields: ['title', 'creators', 'date', 'publisher', ...]
  },
  // ... 20+ item types with customizable fields
};
```

### **UI Layout Components**
- **`Toolbar.svelte`**: Authentication, search, global actions
- **`CollectionsPanel.svelte`**: Hierarchical library navigation
- **`ItemsPanel.svelte`**: Sortable item list with search filtering
- **`DetailsPanel.svelte`**: Form-based item editor with field customization

## Getting Started

### **Prerequisites**
- Node.js 16+ 
- npm 8+
- Valid Zotero Web API key

### **Installation**
```bash
# Clone the repository
git clone https://github.com/lab-Spectral/Refero.git
cd Refero

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Development Workflow**
```bash
# Development (with hot reload)
npm run dev          # Server at http://localhost:3000

# Production build
npm run build        # Optimized build in dist/

# Preview production build
npm run preview      # Server at http://localhost:4173

# Clean build artifacts
npm run clean        # Remove dist/ and cache
```

### **Configuration**
1. **API Authentication**: Enter your Zotero API key in the authentication modal
2. **Library Selection**: Choose from your personal or group libraries
3. **UI Preferences**: Customize panel widths and interface settings

## Development Guidelines

### **Code Organization**
```
src/
├── components/
│   ├── layout/          # Main interface panels
│   └── ui/              # Reusable UI components
├── services/            # Business logic and API integration
├── stores/              # Svelte reactive state management
├── handlers/            # Event handling and UI interactions
├── data/                # Static configuration and schemas
└── utils/               # Pure utility functions
```

### **State Management Patterns**
```javascript
// 1. Use reactive stores for global state
const selectedItem = writable(null);

// 2. Derive computed values
const filteredItems = derived([items, searchQuery], ($items, $query) => {
  return $items.filter(item => item.title.includes($query));
});

// 3. Group related actions
const appActions = {
  selectItem: (item) => selectedItem.set(item),
  searchItems: (query) => searchQuery.set(query)
};
```

### **Component Communication**
```javascript
// Parent to child: props
export let selectedItem;

// Child to parent: events
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
dispatch('itemSelect', { item });

// Global state: stores
import { selectedItem } from '../stores/appStore.js';
```

### **API Integration Patterns**
```javascript
// Unified error handling
try {
  const data = await zoteroService.request('/users/123/items');
} catch (error) {
  if (error instanceof ZoteroError) {
    // Handle API-specific errors
  }
}

// Request patterns
const options = {
  method: 'POST',
  body: JSON.stringify(itemData),
  params: { format: 'json' }
};
```

## UI/UX Design Principles

### **Color System**
```css
/* Dark theme palette */
--bg-primary: #2b2b2b;      /* Main background */
--bg-secondary: #383838;     /* Panel backgrounds */
--bg-tertiary: #3c3c3c;      /* Headers and toolbars */
--accent: #5c7cfa;           /* Interactive elements */
--text-primary: #e8e8e8;     /* Primary text */
--text-secondary: #aaa;      /* Secondary text */
--border: #555;              /* Borders and dividers */
```

### **Layout Principles**
- **Three-pane Interface**: Collections → Items → Details
- **Resizable Panels**: User-customizable workspace
- **Contextual Menus**: Right-click actions throughout
- **Keyboard Navigation**: Full accessibility support

### **Responsive Behavior**
- **Fluid Layouts**: CSS Grid and Flexbox
- **Adaptive Typography**: Consistent scale across panels
- **Touch-friendly**: Mobile-optimized interactions

## Performance Optimizations

### **Bundle Optimization**
```javascript
// vite.config.js
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['svelte']  // Separate vendor bundle
    }
  }
}
```

### **Runtime Performance**
- **Virtual Scrolling**: Efficient large list rendering
- **Debounced Search**: Optimized real-time filtering
- **Lazy Loading**: On-demand component initialization
- **Memoized Computations**: Cached derived store values

### **Network Efficiency**
- **Request Batching**: Minimize API calls
- **Local Caching**: Reduce redundant requests
- **Optimistic Updates**: Immediate UI feedback

## Testing Strategy

### **Component Testing**
```javascript
// Example test structure
import { render } from '@testing-library/svelte';
import ItemsPanel from '../components/layout/ItemsPanel.svelte';

test('renders item list correctly', () => {
  const { getByText } = render(ItemsPanel, {
    props: { sortedItems: mockItems }
  });
  expect(getByText('Test Article')).toBeInTheDocument();
});
```

### **Service Testing**
```javascript
// API service testing
test('zotero service handles authentication', async () => {
  const service = new ZoteroService();
  const result = await service.setApiKey('test-key');
  expect(result.userID).toBeDefined();
});
```

## Deployment

### **Production Build**
```bash
npm run build
# Output: dist/ directory with optimized assets
```

### **Environment Configuration**
```javascript
// Runtime variables
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.zotero.org';
const BUILD_VERSION = __APP_VERSION__;
```

### **Static Hosting**
Compatible with all static hosting providers:
- Netlify, Vercel, GitHub Pages
- Traditional web servers (Apache, Nginx)
- CDN deployment for global distribution

## Editions

Preparo is available in two editions:
- Preparo Community Edition (CE) released under the AGPL license, free to use and modify.
- Preparo Enterprise Edition (EE) includes additional features and official support. A commercial license is required.

## Licensing
See the [LICENSE](LICENSE) file for details on licensing.

## Contributing
Preparo is an open source project and we welcome community contributions.
Please refer to the [Contributing Guide](CONTRIBUTING.md) for more details.

## Support

- **Issues**: [GitHub Issues](https://github.com/lab-Spectral/Refero/issues)
- **Documentation**: See the `/docs` directory for detailed guides
- **Community**: Join our discussions for questions and feedback
