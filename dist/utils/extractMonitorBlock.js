"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extractMonitorBlock;
function extractMonitorBlock(log) {
    const matches = [];
    const regex = /\x1B\[0m[^\n]*\n([\s\S]*?)\x1B\[33;1m/g;
    let match;
    while ((match = regex.exec(log.replace(/\r/g, '\n'))) !== null) {
        matches.push(match[1].trim());
    }
    return matches;
}
//# sourceMappingURL=extractMonitorBlock.js.map