declare global {
    interface Peripheral {
        name: string;
        code: string;
        lowerAddress: string;
        upperAddress: string;
    }
}

export default function parsePeripherals(input: string): Peripheral[] {
    const lines = input.split('\n');
    const peripherals: Peripheral[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const match = line.match(/([a-zA-Z0-9_]+)\s*\(([^)]+)\)/);
        if (match) {
            const name = match[1];
            const code = match[2];
            console.log(`🧠 Found peripheral: ${name} (${code})`);

            // Look for address in the next few lines
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                if (!nextLine || nextLine === '│') {
                    continue;
                }

                const addrMatch = nextLine.match(/<\s*(0x[0-9a-fA-F]+),\s*(0x[0-9a-fA-F]+)\s*>/);
                if (addrMatch) {
                    const lower = addrMatch[1];
                    const upper = addrMatch[2];
                    console.log(`   ↳ Found address: ${lower} to ${upper}`);

                    peripherals.push({ name, code, lowerAddress: lower, upperAddress: upper });
                    i = j; // skip address line next round
                    break;
                } else {
                    console.warn(`⚠️  No address found for ${name}`);
                    break;
                }
            }
        }
    }

    return peripherals;
}
