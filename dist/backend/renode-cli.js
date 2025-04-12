"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRenode = startRenode;
exports.stopRenode = stopRenode;
exports.connectToRenodeMonitor = connectToRenodeMonitor;
exports.sendCommandToRenode = sendCommandToRenode;
exports.waitForStablePrompt = waitForStablePrompt;
const child_process_1 = require("child_process");
const net_1 = __importDefault(require("net"));
const waitForRenodeToStartTelnet_1 = __importDefault(require("../utils/waitForRenodeToStartTelnet"));
const getMonitorOutput_1 = require("../utils/getMonitorOutput");
let renodeProcess;
let client = null;
function startRenode() {
    renodeProcess = (0, child_process_1.spawn)('renode', ['-P 6969']);
    renodeProcess.stdout.on('data', (data) => {
        console.log(`[Renode output] ${data}`);
    });
}
function stopRenode() {
    if (client) {
        client.write('quit\n');
        client = null;
    }
    else {
        console.error('Error : client is null, make a connection first or restart the app');
    }
}
async function connectToRenodeMonitor() {
    // check if a connection has already been made
    if (client) {
        console.log('🔵 Already connected to Renode monitor.');
        return client;
    }
    // wait for renode to start telnet
    console.log('🔵 Waiting for Renode to start Telnet...');
    await (0, waitForRenodeToStartTelnet_1.default)(renodeProcess);
    let connected = false;
    client = net_1.default.createConnection({ port: 6969, host: '127.0.0.1' }, () => {
        console.log('🟢 Connected to Renode monitor over Telnet!');
        connected = true;
        client.setEncoding('utf-8');
        // client.write('____include @C:/Users/ztifl/platform.resc\n')
        // client.write(`____${command}\n`); // first 4 characters are clipped for some reason???
    });
    // client.on('data') handler
    (0, getMonitorOutput_1.printMonitorOutput)(client);
    client.write("_________mach add \"stm32\"\n" + // CLIP
        "machine LoadPlatformDescription @platforms/cpus/stm32f103.repl\n" +
        "sysbus LoadELF @../../Users/ztifl/CLionProjects/assembly/cmake-build-debug/kernel.elf\n" +
        "start\n");
    client.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.warn('⛔ Renode Telnet not available yet. Retrying in 1s...');
            if (!connected && !client?.connecting) {
                client?.destroy();
                client = null;
                setTimeout(connectToRenodeMonitor, 1000);
            }
        }
        else {
            console.error('❌ Connection error:', err.message);
        }
    });
    client.on('end', () => {
        console.log('🔴 Disconnected from Renode.');
        connected = false;
        client = null;
    });
    return client;
}
async function sendCommandToRenode(command) {
    if (renodeProcess) {
        if (!client) {
            client = await connectToRenodeMonitor();
            console.log("Monitor Auto Started");
        }
        client.write(`${command}\n\n`);
        const outputArray = await (0, getMonitorOutput_1.getMonitorOutput)(client);
        const lastOutput = outputArray.at(-1) || "";
        // console.log(parsePeripherals(lastOutput));
        // console.log(JSON.stringify(lastOutput));
        return lastOutput;
    }
    else {
        console.error('Renode process is not running.');
    }
    return "";
}
function waitForStablePrompt() {
    if (!client) {
        console.error('Client is not connected.');
        return;
    }
    return new Promise((resolve) => {
        let buffer = '';
        const handler = (chunk) => {
            buffer += chunk.toString();
            if (buffer.match(/\(monitor\)|\(stm32\)[ \r\n]*$/)) {
                client.off('data', handler);
                setTimeout(() => {
                    console.log('Stable prompt detected.');
                    resolve();
                }, 2000); // slight delay to ensure output is flushed
            }
        };
        client.on('data', handler);
    });
}
//# sourceMappingURL=renode-cli.js.map