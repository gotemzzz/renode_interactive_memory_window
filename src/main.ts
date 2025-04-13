import { app, ipcMain, BrowserWindow } from 'electron';
import path from 'path';

import { startRenode, stopRenode, sendCommandToRenode, connectToRenodeMonitor, waitForStablePrompt } from "./backend/renode-cli";

import parsePeripherals from "./utils/parsePeripherals";

// disable hardware acceleration for macOS
app.disableHardwareAcceleration();

// src dir for files other than ts
const srcDir = path.join(__dirname, '../src/');

function createWindow() {
    const win = new BrowserWindow({
        width: 450,
        height: 810,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js') // bridge to renderer
        }
    });

    win.loadFile(path.join(srcDir, 'renderer/index.html'));
}

app.whenReady().then(() => {
    createWindow();
});


// ~~~~~~ handle ipc events ~~~~~~

// ~~~~~~ client-side calls ~~~~~~
ipcMain.handle('ping', () => {
    console.log('ping...');
    return 'pong';
});

ipcMain.handle('startRenode', () => {
    console.log('Starting Renode...');
    return startRenode();
});

ipcMain.handle('stopRenode', () => {
    console.log('Stopping Renode...');
    return stopRenode();
});

ipcMain.handle('sendCommandToRenode', async (event, command: string) => {
    console.log(`Sending command to Renode: ${command}`);
    return await sendCommandToRenode(command);
});

ipcMain.handle('connectToRenodeMonitor', async () => {
    console.log('Connecting to Renode monitor...');
    await connectToRenodeMonitor();
    return;
});

ipcMain.handle('waitForStablePrompt', async () => {
    console.log('Waiting for stable prompt...');
    return waitForStablePrompt();
});

ipcMain.handle('getPeripherals', async () => {
    console.log('Getting peripherals...');
    return parsePeripherals(await sendCommandToRenode("peripherals"));
});

// ~~~~~~ server-side calls ~~~~~~
ipcMain.on('notifyReload', () => {
    return console.log('Reloading...');
});
