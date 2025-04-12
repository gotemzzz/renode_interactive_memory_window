import {ChildProcessWithoutNullStreams} from "child_process";

export default function waitForRenodeToStartTelnet(renodeProcess: ChildProcessWithoutNullStreams): Promise<void> {
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