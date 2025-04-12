"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('memoryAPI', {
    // server side functions
    ping: () => electron_1.ipcRenderer.invoke('ping'),
    start: () => electron_1.ipcRenderer.invoke('startRenode'),
    stop: () => electron_1.ipcRenderer.invoke('stopRenode'),
    send: (command) => electron_1.ipcRenderer.invoke('sendCommandToRenode', command),
    monitor: () => electron_1.ipcRenderer.invoke('connectToRenodeMonitor'),
    wait: () => electron_1.ipcRenderer.invoke('waitForStablePrompt'),
    peripherals: () => electron_1.ipcRenderer.invoke('getPeripherals'),
    // client side functions
    reload: () => electron_1.ipcRenderer.send('notifyReload'),
});
//# sourceMappingURL=preload.js.map