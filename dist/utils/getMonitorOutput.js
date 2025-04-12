"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonitorOutput = getMonitorOutput;
exports.printMonitorOutput = printMonitorOutput;
const fs_1 = __importDefault(require("fs"));
const extractMonitorBlock_1 = __importDefault(require("./extractMonitorBlock"));
// clear log on startup
fs_1.default.writeFileSync('monitor_output.txt', '', { flag: 'w' });
function getMonitorOutput(client) {
    return new Promise((resolve) => {
        const handler = () => {
            const log = fs_1.default.readFileSync('monitor_output.txt', 'utf-8');
            resolve((0, extractMonitorBlock_1.default)(log));
        };
        setTimeout(handler, 100);
    });
}
function printMonitorOutput(client) {
    let buffer = '';
    let lines;
    const log = fs_1.default.createWriteStream('monitor_output.txt', { flags: 'a+' });
    client.on('data', (data) => {
        buffer += data.toString('utf-8');
        lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            // console.log(line);
            log.write(line);
        }
    });
}
//# sourceMappingURL=getMonitorOutput.js.map