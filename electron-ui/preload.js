const { contextBridge } = require('electron');

// Expose limited Node.js functionality if needed
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  showNotification: (title, body) => {
    // Could implement native notifications here
    console.log('Notification:', title, body);
  },
  // Add other safe methods as needed
});