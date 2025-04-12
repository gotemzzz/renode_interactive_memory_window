import net from 'net';
import fs from 'fs';

import extract from "./extractMonitorBlock";

// clear log on startup
fs.writeFileSync('monitor_output.txt', '', { flag: 'w' });

export function getMonitorOutput(client: net.Socket): Promise<string[]> {
    return new Promise((resolve) => {
        const handler = () => {
            const log = fs.readFileSync('monitor_output.txt', 'utf-8');
            resolve(extract(log));
        }
        setTimeout(handler, 100);
    });

}

export function printMonitorOutput(client: net.Socket): void {
    let buffer = '';
    let lines : string[];
    const log = fs.createWriteStream('monitor_output.txt', { flags: 'a+' });
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
