

export default function extractMonitorBlock(log: string): string[] {
    const matches: string[] = [];
    const regex = /\x1B\[0m[^\n]*\n([\s\S]*?)\x1B\[33;1m/g;

    let match;
    while ((match = regex.exec(log.replace(/\r/g, '\n'))) !== null) {
        matches.push(match[1].trim());
    }

    return matches;
}
