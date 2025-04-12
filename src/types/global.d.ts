import net from 'net';
export {};

declare global {
    interface Window {
        memoryAPI: {
            ping: () => Promise<string>;
            start: () => Promise<void>;
            stop: () => Promise<void>;
            send: (command: string) => Promise<string>;
            monitor: () => Promise<void>;
            wait: () => Promise<void>;
            peripherals: () => Promise<Peripheral[]>;
        };
    }
}
