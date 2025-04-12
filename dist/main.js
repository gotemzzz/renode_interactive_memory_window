"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const renode_cli_1 = require("./backend/renode-cli");
const parsePeripherals_1 = __importDefault(require("./utils/parsePeripherals"));
// src dir for files other than ts
const srcDir = path_1.default.join(__dirname, '../src/');
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 450,
        height: 810,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js') // bridge to renderer
        }
    });
    win.loadFile(path_1.default.join(srcDir, 'renderer/index.html'));
}
electron_1.app.whenReady().then(() => {
    createWindow();
});
// ~~~~~~ handle ipc events ~~~~~~
// ~~~~~~ client-side calls ~~~~~~
electron_1.ipcMain.handle('ping', () => {
    console.log('ping...');
    return 'pong';
});
electron_1.ipcMain.handle('startRenode', () => {
    console.log('Starting Renode...');
    return (0, renode_cli_1.startRenode)();
});
electron_1.ipcMain.handle('stopRenode', () => {
    console.log('Stopping Renode...');
    return (0, renode_cli_1.stopRenode)();
});
electron_1.ipcMain.handle('sendCommandToRenode', async (event, command) => {
    console.log(`Sending command to Renode: ${command}`);
    return await (0, renode_cli_1.sendCommandToRenode)(command);
});
electron_1.ipcMain.handle('connectToRenodeMonitor', async () => {
    console.log('Connecting to Renode monitor...');
    await (0, renode_cli_1.connectToRenodeMonitor)();
    return;
});
electron_1.ipcMain.handle('waitForStablePrompt', async () => {
    console.log('Waiting for stable prompt...');
    return (0, renode_cli_1.waitForStablePrompt)();
});
electron_1.ipcMain.handle('getPeripherals', async () => {
    console.log('Getting peripherals...');
    return (0, parsePeripherals_1.default)(await (0, renode_cli_1.sendCommandToRenode)("peripherals"));
});
// ~~~~~~ server-side calls ~~~~~~
electron_1.ipcMain.on('notifyReload', () => {
    return console.log('Reloading...');
});
//# sourceMappingURL=main.js.map