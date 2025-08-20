import App from './App.svelte';

// Initialize the app
const app = new App({
  target: document.body
});

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}

export default app;