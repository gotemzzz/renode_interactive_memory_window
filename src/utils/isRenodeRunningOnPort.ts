import net from 'net';

export default function isRenodeRunningOnPort(port = 6969): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();

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
