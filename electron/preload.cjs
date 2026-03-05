const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload] Loading preload script...');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  scraper: {
    run: (scraperId) => ipcRenderer.invoke('scraper:run', scraperId),
    runAll: () => ipcRenderer.invoke('scraper:runAll'),
  },
  
  db: {
    scrapers: {
      getAll: () => ipcRenderer.invoke('db:scraper:getAll'),
    },
  },
});

console.log('[Preload] API exposed');
