"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isRenodeRunningOnPort;
const net_1 = __importDefault(require("net"));
function isRenodeRunningOnPort(port = 6969) {
    return new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        socket.once('connect', () => {
            socket.destroy();
            resolve(true); // Port is open = Renode running
        });
        socket.once('error', () => {
            resolve(false); // Port is closed = Renode not running
        });
        socket.connect(port, '127.0.0.1');
    });
}
//# sourceMappingURL=isRenodeRunningOnPort.js.map