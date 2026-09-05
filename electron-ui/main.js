const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'frontend/assets/icon.png'),
    title: 'Intelligent Resource Optimizer',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the frontend HTML file
  mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));
  
  // Remove default menu for cleaner look
  Menu.setApplicationMenu(null);
  
  // Open DevTools for development (comment in production)
  // mainWindow.webContents.openDevTools();
  
  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// When Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});