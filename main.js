// Code Provided : The Main Entry Point 
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 750,
    height: 800,
    icon:path.join(__dirname,'icon.png'),
    vibrancy: 'sidebar', // or 'under-window'
    visualEffectState: 'active',
    titleBarStyle: 'hiddenInset', // Gives it that clean Mac look
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});