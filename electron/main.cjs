const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('[Electron] Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false,
  });

  // HARD CODE the dev server URL - NEVER load from file
  console.log('[Electron] Loading http://localhost:5173');
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    console.log('[Electron] Window ready, showing now');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers
const { ipcMain } = require('electron');

ipcMain.handle('scraper:run', async (event, scraperId) => {
  console.log('[IPC] Running scraper:', scraperId);
  return { success: true, data: { products: [], message: scraperId } };
});

ipcMain.handle('scraper:runAll', async () => {
  return { success: true, data: [] };
});

ipcMain.handle('db:scraper:getAll', async () => {
  return { 
    success: true, 
    data: [
      { id: 'kumasci', name: 'Kumaşçı', isActive: true },
      { id: 'kumasfirsati', name: 'Kumaş Fırsatı', isActive: true },
      { id: 'tekstilturkiye', name: 'Tekstil Türkiye', isActive: true },
    ] 
  };
});

console.log('[Electron] IPC handlers registered');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
