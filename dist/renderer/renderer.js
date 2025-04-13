"use strict";
console.log("Renderer process loaded!");
/** ~~~~~~~~~~~~~~~~ HELPERS ~~~~~~~~~~~~~~~~~~ **/
async function ping() {
    return console.log(await window.memoryAPI.ping());
}
function asHex(num) {
    return "0x" + num.toString(16).toUpperCase();
}
function fromHex(hex) {
    return hex?.replace(/^0x/, '');
}
function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false); // false = end
    sel?.removeAllRanges();
    sel?.addRange(range);
}
function updateCurrentBytes(addressesContainer, valuesContainer, rows, columns, baseAddress, offset, currentBytes, windowIsScaling) {
    if (windowIsScaling) { // if the window is scaling, we need to clear and rerender the number of columns and rows
        addressesContainer.innerHTML = '';
        valuesContainer.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            addressesContainer.insertAdjacentHTML('beforeend', `<div id="address-${i}">
                                                                            ${baseAddress ? asHex(baseAddress + i * offset) : asHex(0xFFFFFFFF)}:
                                                                         </div>`);
            valuesContainer.insertAdjacentHTML('beforeend', `<div id="row-${i}" class="address-row">
                                                                        
                                                                      </div>`);
            for (let j = 0; j < columns; j++) {
                const byteIndex = (columns - 1) * i + j;
                document.getElementById(`row-${i}`).insertAdjacentHTML('beforeend', `<div contenteditable="true" id="value-${byteIndex}" class="value">
                                                                                                ${currentBytes.length !== 0 ? fromHex(currentBytes[byteIndex]) : "00"}
                                                                                              </div>`);
                // Add event listener to each byte
                const byteElement = document.getElementById(`value-${byteIndex}`);
                byteElement.addEventListener('input', () => {
                    // Only allow 2 characters
                    if (byteElement.textContent.length > 2) {
                        byteElement.textContent = byteElement.textContent.slice(0, 2);
                        placeCaretAtEnd(byteElement); // optional: keep caret at end
                    }
                });
                byteElement.addEventListener('keydown', (event) => {
                    // Allow only hexadecimal characters (0-9, A-F)
                    if (!/[0-9A-Fa-f]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
                        event.preventDefault();
                    }
                });
            }
        }
    }
    else { // otherwise we can leave the structure and just edit the values
        for (let i = 0; i < rows; i++) {
            document.getElementById(`address-${i}`).innerText = `${baseAddress ? asHex(baseAddress + i * offset) : asHex(0xFFFFFFFF)}:`;
            for (let j = 0; j < columns; j++) {
                const byteIndex = (columns - 1) * i + j;
                if (document.activeElement === document.getElementById(`value-${byteIndex}`)) {
                    console.log(`Skipping byte ${byteIndex} because it is currently focused`);
                    continue;
                }
                document.getElementById(`value-${byteIndex}`).innerText = `${currentBytes.length !== 0 ? fromHex(currentBytes[byteIndex]) : "00"}`;
            }
        }
    }
}
/** ~~~~~~~~~~~~~~~~ MAIN ~~~~~~~~~~~~~~~~~~ **/
// start renode instance
// timing should be controlled here
window.memoryAPI.start().then(async () => {
    console.log("Renode started");
    //let baseAddress : number | null = 0x08000000;
    //let offset : number = 0x0000000C;
    //console.log("0x" + (baseAddress + offset).toString(16).toUpperCase());
    // connect to monitor
    await window.memoryAPI.monitor();
    // wait for stable prompt
    await window.memoryAPI.wait();
    // get list of peripherals
    const peripherals = await window.memoryAPI.peripherals();
    console.log("Peripherals: ", peripherals);
    // handle search query
    let searchQuery = "";
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-button');
    const addressesContainer = document.getElementById('addresses');
    const valuesContainer = document.getElementById('values');
    let rows;
    let columns;
    let baseAddress = null;
    let offset;
    let currentBytes = [];
    // Memory window resized listener/observer
    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            // calculate the number of rows and columns based on the size of the div
            const col_temp = Math.floor(width / 27.203125); // 27.203125 is the width of each cell
            const row_temp = Math.floor(height / 21); // 21 is the height of each cell
            // update the number of rows and columns if they have changed
            if (col_temp !== columns || row_temp !== rows) {
                columns = col_temp;
                rows = row_temp;
                // console.log(`Div resized to ${width}x${height}`);
                // console.log(`Rows: ${rows}, Columns: ${columns}`);
                offset = columns;
                updateCurrentBytes(addressesContainer, valuesContainer, rows, columns, baseAddress, offset, currentBytes, true);
            }
        }
    });
    if (valuesContainer && addressesContainer)
        observer.observe(valuesContainer);
    // *** HAVE ANOTHER WATCHER ON A TIMER TO UPDATE THE VALUES EVERY 100 - 500 ms ***
    // might be worth it to copy the func above and reuse it
    // Rerender the memory window every 500ms
    setInterval(() => {
        // updateCurrentBytes(addressesContainer, valuesContainer, rows, columns, baseAddress, offset, currentBytes, false);
        // The update function should be put here it should do something similar
        // to what happens when the search button is pressed
    }, 200);
    document.activeElement;
    // Search button listener
    searchButton?.addEventListener('click', () => {
        searchQuery = searchInput.value;
        console.log("Search query: " + searchQuery);
        window.memoryAPI.send(`sysbus ReadBytes ${searchQuery} ${rows * columns}`).then((output) => {
            let parsedOutput = output.replace(/\n\n/g, '').replace(/[\[\]]/g, '').split(',');
            parsedOutput = parsedOutput.map((byte) => byte.trim());
            currentBytes = parsedOutput;
            baseAddress = parseInt(searchQuery, 16);
            updateCurrentBytes(addressesContainer, valuesContainer, rows, columns, baseAddress, offset, currentBytes, false);
            console.log("OUTPUT: " + output);
            console.log("Parsed output: " + parsedOutput);
            console.log(currentBytes);
        }).catch((error) => {
            console.error("Error sending command to Renode:", error);
        });
    });
    // Clear button listener
    clearButton?.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = "";
        baseAddress = null;
        currentBytes = [];
        updateCurrentBytes(addressesContainer, valuesContainer, rows, columns, baseAddress, offset, currentBytes, false);
        console.log("Search query cleared: " + searchQuery);
    });
}).catch((error) => {
    console.error("Error starting Renode:", error);
});
// Pre-reload logic
window.addEventListener('beforeunload', () => {
    window.memoryAPI.stop();
});
//# sourceMappingURL=renderer.js.map