"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = waitForRenodeToStartTelnet;
function waitForRenodeToStartTelnet(renodeProcess) {
    return new Promise((resolve) => {
        renodeProcess.stdout.on('data', (chunk) => {
            const output = chunk.toString();
            if (output.includes('Monitor available in telnet mode on port')) {
                console.log('🟢 Detected Telnet server is up!');
                resolve();
            }
        });
    });
}
//# sourceMappingURL=waitForRenodeToStartTelnet.js.map