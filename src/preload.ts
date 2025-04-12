import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('memoryAPI', {
    // server side functions
    ping: () => ipcRenderer.invoke('ping'),
    start: () => ipcRenderer.invoke('startRenode'),
    stop: () => ipcRenderer.invoke('stopRenode'),
    send: (command: string) => ipcRenderer.invoke('sendCommandToRenode', command),
    monitor: () => ipcRenderer.invoke('connectToRenodeMonitor'),
    wait: () => ipcRenderer.invoke('waitForStablePrompt'),
    peripherals: () => ipcRenderer.invoke('getPeripherals'),
    // client side functions
    reload: () => ipcRenderer.send('notifyReload'),
});
