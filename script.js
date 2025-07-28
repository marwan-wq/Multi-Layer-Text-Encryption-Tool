// DOM Elements
const plainTextInput = document.getElementById('plainText');
const addLayerBtn = document.getElementById('addLayerBtn');
const removeLayerBtn = document.getElementById('removeLayerBtn');
const layersList = document.getElementById('layersList');
const operationSelect = document.getElementById('operationSelect');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
const layerTemplate = document.getElementById('layerTemplate');

let layerCount = 0;

// Add new layer
function addLayer() {
    const layer = layerTemplate.content.cloneNode(true);
    const layerItem = layer.querySelector('.layer-item');
    const layerNumber = layer.querySelector('.layer-number');
    const algorithmSelect = layer.querySelector('.algorithm-select');
    const keyGroup = layer.querySelector('.key-group');
    const removeLayerBtn = layer.querySelector('.remove-layer-btn');

    layerCount++;
    layerNumber.textContent = `Layer ${layerCount}`;
    layerItem.dataset.layerId = layerCount;

    // Show/hide key input based on algorithm selection
    algorithmSelect.addEventListener('change', () => {
        const selectedAlgorithm = algorithmSelect.value;
        const keyHelp = keyGroup.querySelector('.key-help');
        const keyList = keyGroup.querySelectorAll('.key-list li');
        
        keyList.forEach(li => li.style.display = 'none');
        
        if (selectedAlgorithm) {
            keyGroup.style.display = 'block';
            keyHelp.style.display = 'block';
            
            switch (selectedAlgorithm) {
                case 'caesar':
                    keyGroup.querySelector('.caesar-key').style.display = 'block';
                    break;
                case 'monoalphabetic':
                    keyGroup.querySelector('.mono-key').style.display = 'block';
                    break;
                case 'vigenere':
                    keyGroup.querySelector('.vigenere-key').style.display = 'block';
                    break;
                case 'railfence':
                    keyGroup.querySelector('.rail-key').style.display = 'block';
                    break;
                case 'rowcolumn':
                    keyGroup.querySelector('.row-key').style.display = 'block';
                    break;
                case 'des':
                    keyGroup.querySelector('.des-key').style.display = 'block';
                    break;
                case 'playfair':
                    keyGroup.querySelector('.playfair-key').style.display = 'block';
                    break;
                default:
                    keyHelp.style.display = 'none';
            }
        } else {
            keyGroup.style.display = 'none';
        }
    });

    // Remove layer
    removeLayerBtn.addEventListener('click', () => {
        layerItem.remove();
        layerCount--;
        updateLayerNumbers();
        updateRemoveLayerButton();
    });

    layersList.appendChild(layer);
    updateRemoveLayerButton();
}

// Update layer numbers
function updateLayerNumbers() {
    const layers = layersList.querySelectorAll('.layer-item');
    layers.forEach((layer, index) => {
        layer.querySelector('.layer-number').textContent = `Layer ${index + 1}`;
        layer.dataset.layerId = index + 1;
    });
}

// Update remove layer button state
function updateRemoveLayerButton() {
    removeLayerBtn.disabled = layerCount <= 1;
}

// Clear all layers
function clearLayers() {
    layersList.innerHTML = '';
    layerCount = 0;
    updateRemoveLayerButton();
}

// Process text through all layers
function processText(text, encrypt = true) {
    const layers = layersList.querySelectorAll('.layer-item');
    let result = text;
    let steps = [];

    const processOrder = encrypt ? layers : Array.from(layers).reverse();

    for (const layer of processOrder) {
        const algorithm = layer.querySelector('.algorithm-select').value;
        const key = layer.querySelector('.key-input').value;

        if (!algorithm) continue;

        switch (algorithm) {
            case 'caesar':
                result = caesarCipher(result, key, encrypt);
                break;
            case 'monoalphabetic':
                result = monoalphabeticCipher(result, key, encrypt);
                break;
            case 'vigenere':
                result = vigenereCipher(result, key, encrypt);
                break;
            case 'railfence':
                result = railFenceCipher(result, key, encrypt);
                break;
            case 'rowcolumn':
                result = rowColumnTransposition(result, key, encrypt);
                break;
            case 'des':
                let desResult = sdesCipher(result, key, encrypt);
                result = desResult.binaryResult;
                steps.push(desResult.steps);
                break;
            case 'playfair':
                result = playfairCipher(result, key, encrypt);
                break;
        }
    }

    return { result, steps: steps.join('\n\n') };
}

// Event Listeners
addLayerBtn.addEventListener('click', addLayer);
removeLayerBtn.addEventListener('click', () => {
    const lastLayer = layersList.lastElementChild;
    if (lastLayer) {
        lastLayer.remove();
        layerCount--;
        updateLayerNumbers();
        updateRemoveLayerButton();
    }
});

clearBtn.addEventListener('click', () => {
    plainTextInput.value = '';
    resultDiv.textContent = '';
    clearLayers();
});

processBtn.addEventListener('click', () => {
    const text = plainTextInput.value;
    if (!text || layerCount === 0) {
        alert('Please enter text and add at least one encryption layer');
        return;
    }

    resultDiv.style.opacity = '0';
    setTimeout(() => {
        const isEncrypt = operationSelect.value === 'encrypt';
        const { result, steps } = processText(text, isEncrypt);
        resultDiv.innerHTML = `<div class="result-text">${result}</div>${steps ? `<div class="steps">${steps}</div>` : ''}`;
        resultDiv.style.opacity = '1';
    }, 200);
});

// Copy to clipboard functionality
copyBtn.addEventListener('click', () => {
    const text = resultDiv.textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalColor = copyBtn.style.color;
            copyBtn.style.color = '#00b894';
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.style.color = originalColor;
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});

// Add first layer on load
addLayer();

// Caesar Cipher
function caesarCipher(text, key, encrypt = true) {
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const shift = encrypt ? parseInt(key) : -parseInt(key);
            const base = code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - base + shift + 26) % 26) + base);
        }
        return char;
    }).join('');
}

// Monoalphabetic Cipher
function monoalphabeticCipher(text, key, encrypt = true) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const keyMap = {};
    
    if (encrypt) {
        for (let i = 0; i < alphabet.length; i++) {
            keyMap[alphabet[i]] = key[i % key.length];
        }
    } else {
        for (let i = 0; i < alphabet.length; i++) {
            keyMap[key[i % key.length]] = alphabet[i];
        }
    }

    return text.toLowerCase().split('').map(char => {
        return keyMap[char] || char;
    }).join('');
}

// Vigenere Cipher
function vigenereCipher(text, key, encrypt = true) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i].toLowerCase();
        if (alphabet.includes(char)) {
            const textIndex = alphabet.indexOf(char);
            const keyChar = key[keyIndex % key.length].toLowerCase();
            const keyValue = alphabet.indexOf(keyChar);
            
            let newIndex;
            if (encrypt) {
                newIndex = (textIndex + keyValue) % 26;
            } else {
                newIndex = (textIndex - keyValue + 26) % 26;
            }
            
            result += alphabet[newIndex];
            keyIndex++;
        } else {
            result += char;
        }
    }
    return result;
}

// Rail Fence Cipher
function railFenceCipher(text, key, encrypt = true) {
    const rails = parseInt(key);
    if (rails <= 1) return text;

    if (encrypt) {
        const matrix = Array(rails).fill().map(() => []);
        let rail = 0;
        let direction = 1;

        for (let char of text) {
            matrix[rail].push(char);
            rail += direction;
            if (rail === rails - 1 || rail === 0) {
                direction *= -1;
            }
        }

        return matrix.flat().join('');
    } else {
        const matrix = Array(rails).fill().map(() => Array(text.length).fill(''));
        let rail = 0;
        let direction = 1;
        let index = 0;

        // Mark positions
        for (let i = 0; i < text.length; i++) {
            matrix[rail][i] = '*';
            rail += direction;
            if (rail === rails - 1 || rail === 0) {
                direction *= -1;
            }
        }

        // Fill characters
        for (let i = 0; i < rails; i++) {
            for (let j = 0; j < text.length; j++) {
                if (matrix[i][j] === '*') {
                    matrix[i][j] = text[index++];
                }
            }
        }

        // Read result
        let result = '';
        rail = 0;
        direction = 1;
        for (let i = 0; i < text.length; i++) {
            result += matrix[rail][i];
            rail += direction;
            if (rail === rails - 1 || rail === 0) {
                direction *= -1;
            }
        }
        return result;
    }
}

// Row Column Transposition
function rowColumnTransposition(text, key, encrypt = true) {
    const keyLength = key.length;
    const textLength = text.length;
    const rows = Math.ceil(textLength / keyLength);
    
    if (encrypt) {
        const matrix = Array(rows).fill().map(() => Array(keyLength).fill(''));
        let index = 0;
        
        // Fill matrix
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < keyLength; j++) {
                if (index < textLength) {
                    matrix[i][j] = text[index++];
                }
            }
        }
        
        // Read by columns
        let result = '';
        const keyOrder = key.split('').map((char, i) => ({ char, index: i }))
            .sort((a, b) => a.char.localeCompare(b.char))
            .map(item => item.index);
            
        for (let col of keyOrder) {
            for (let row = 0; row < rows; row++) {
                result += matrix[row][col];
            }
        }
        return result;
    } else {
        const matrix = Array(rows).fill().map(() => Array(keyLength).fill(''));
        const keyOrder = key.split('').map((char, i) => ({ char, index: i }))
            .sort((a, b) => a.char.localeCompare(b.char))
            .map(item => item.index);
            
        let index = 0;
        
        // Fill matrix by columns
        for (let col of keyOrder) {
            for (let row = 0; row < rows; row++) {
                if (index < textLength) {
                    matrix[row][col] = text[index++];
                }
            }
        }
        
        // Read by rows
        let result = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < keyLength; j++) {
                result += matrix[i][j];
            }
        }
        return result;
    }
}

// S-DES Cipher
function sdesCipher(text, key, encrypt = true) {
    // S-DES tables
    const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
    const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
    const P4 = [2, 4, 3, 1];
    const IP = [2, 6, 3, 1, 4, 8, 5, 7];
    const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];
    const EP = [4, 1, 2, 3, 2, 3, 4, 1];
    const S0 = [
        [1, 0, 3, 2],
        [3, 2, 1, 0],
        [0, 2, 1, 3],
        [3, 1, 3, 2]
    ];
    const S1 = [
        [0, 1, 2, 3],
        [2, 0, 1, 3],
        [3, 0, 1, 0],
        [2, 1, 0, 3]
    ];

    // Helper functions
    function permute(bits, table) {
        return table.map(pos => bits[pos - 1]);
    }

    function leftShift(bits) {
        return bits.slice(1).concat(bits[0]);
    }

    function xor(a, b) {
        return a.map((bit, i) => bit ^ b[i]);
    }

    function sBox(bits, box) {
        const row = parseInt(bits[0].toString() + bits[3].toString(), 2);
        const col = parseInt(bits[1].toString() + bits[2].toString(), 2);
        const val = box[row][col];
        return [
            (val >> 1) & 1,
            val & 1
        ];
    }

    function binaryToBits(binary) {
        return binary.replace(/\s/g, '').split('').map(bit => parseInt(bit));
    }

    function bitsToBinary(bits) {
        return bits.join('');
    }

    // Generate subkeys K1 and K2
    function generateKeys(key) {
        let keyBits = binaryToBits(key);
        let steps = [];
        
        // Apply P10 permutation
        let p10 = permute(keyBits, P10);
        steps.push(`P10 permutation: ${bitsToBinary(p10)}`);
        
        // Split into left and right halves
        let left = p10.slice(0, 5);
        let right = p10.slice(5, 10);
        steps.push(`Split into L: ${bitsToBinary(left)} and R: ${bitsToBinary(right)}`);
        
        // Generate K1
        left = leftShift(left);
        right = leftShift(right);
        let k1 = permute(left.concat(right), P8);
        steps.push(`K1 generation:`);
        steps.push(`  After LS-1: L=${bitsToBinary(left)}, R=${bitsToBinary(right)}`);
        steps.push(`  K1 = ${bitsToBinary(k1)}`);
        
        // Generate K2
        left = leftShift(left);
        left = leftShift(left);
        right = leftShift(right);
        right = leftShift(right);
        let k2 = permute(left.concat(right), P8);
        steps.push(`K2 generation:`);
        steps.push(`  After LS-2: L=${bitsToBinary(left)}, R=${bitsToBinary(right)}`);
        steps.push(`  K2 = ${bitsToBinary(k2)}`);
        
        return { k1, k2, steps };
    }

    // The fk function that combines permutation and substitution
    function fk(right, subkey) {
        // Expand/permute right half
        let expanded = permute(right, EP);
        
        // XOR with subkey
        let xored = xor(expanded, subkey);
        
        // Apply S-boxes
        let leftXor = xored.slice(0, 4);
        let rightXor = xored.slice(4, 8);
        let sboxOutput = sBox(leftXor, S0).concat(sBox(rightXor, S1));
        
        // Apply P4 permutation
        return permute(sboxOutput, P4);
    }

    // Main encryption/decryption function
    function processBlock(block, k1, k2) {
        let steps = [];
        
        // Step 1: Initial Permutation (IP)
        let ip = permute(block, IP);
        steps.push(`Step 1 - Initial Permutation (IP): ${bitsToBinary(ip)}`);
        
        // Split into left and right halves
        let left = ip.slice(0, 4);
        let right = ip.slice(4, 8);
        steps.push(`Split into L0: ${bitsToBinary(left)} and R0: ${bitsToBinary(right)}`);
        
        // Step 2: First fk function
        let fk1 = fk(right, k1);
        let newRight = xor(left, fk1);
        steps.push(`Step 2 - First fk function:`);
        steps.push(`  EP(R0) = ${bitsToBinary(permute(right, EP))}`);
        steps.push(`  EP(R0) ⊕ K1 = ${bitsToBinary(xor(permute(right, EP), k1))}`);
        steps.push(`  S-box output = ${bitsToBinary(fk1)}`);
        steps.push(`  L0 ⊕ fk(R0, K1) = ${bitsToBinary(newRight)}`);
        
        // Step 3: Switch (SW)
        let temp = right;
        right = newRight;
        left = temp;
        steps.push(`Step 3 - Switch (SW):`);
        steps.push(`  L1: ${bitsToBinary(left)}`);
        steps.push(`  R1: ${bitsToBinary(right)}`);
        
        // Step 4: Second fk function
        let fk2 = fk(right, k2);
        let finalLeft = xor(left, fk2);
        steps.push(`Step 4 - Second fk function:`);
        steps.push(`  EP(R1) = ${bitsToBinary(permute(right, EP))}`);
        steps.push(`  EP(R1) ⊕ K2 = ${bitsToBinary(xor(permute(right, EP), k2))}`);
        steps.push(`  S-box output = ${bitsToBinary(fk2)}`);
        steps.push(`  L1 ⊕ fk(R1, K2) = ${bitsToBinary(finalLeft)}`);
        
        // Combine left and right
        let combined = finalLeft.concat(right);
        steps.push(`Combined: ${bitsToBinary(combined)}`);
        
        // Step 5: Final Permutation (IP^-1)
        let result = permute(combined, IP_INV);
        steps.push(`Step 5 - Final Permutation (IP^-1): ${bitsToBinary(result)}`);
        
        return { result, steps };
    }

    // Main encryption/decryption logic
    let { k1, k2, keySteps } = generateKeys(key);
    let inputBits = binaryToBits(text);
    let allSteps = [];
    
    allSteps.push("Key Generation Steps:");
    allSteps = allSteps.concat(keySteps);
    
    allSteps.push("\nEncryption Steps:");
    let { result, steps } = processBlock(inputBits, k1, k2);
    allSteps = allSteps.concat(steps);
    
    return {
        binaryResult: bitsToBinary(result),
        steps: allSteps.join('\n')
    };
}

// Playfair Cipher Implementation
function playfairCipher(text, key, encrypt = true) {
    // Generate the key square
    const keySquare = generatePlayfairKeySquare(key);
    
    // Prepare the text
    text = text.toLowerCase().replace(/[^a-z]/g, '').replace(/j/g, 'i');
    
    // Create digraphs
    const digraphs = [];
    for (let i = 0; i < text.length; i += 2) {
        if (i + 1 < text.length) {
            if (text[i] === text[i + 1]) {
                digraphs.push([text[i], 'x']);
                i--;
            } else {
                digraphs.push([text[i], text[i + 1]]);
            }
        } else {
            digraphs.push([text[i], 'x']);
        }
    }
    
    // Process each digraph
    const result = digraphs.map(digraph => {
        const pos1 = findPositionInKeySquare(digraph[0], keySquare);
        const pos2 = findPositionInKeySquare(digraph[1], keySquare);
        
        let processed = '';
        
        if (pos1.row === pos2.row) {
            // Same row
            if (encrypt) {
                processed += keySquare[pos1.row][(pos1.col + 1) % 5];
                processed += keySquare[pos2.row][(pos2.col + 1) % 5];
            } else {
                processed += keySquare[pos1.row][(pos1.col + 4) % 5];
                processed += keySquare[pos2.row][(pos2.col + 4) % 5];
            }
        } else if (pos1.col === pos2.col) {
            // Same column
            if (encrypt) {
                processed += keySquare[(pos1.row + 1) % 5][pos1.col];
                processed += keySquare[(pos2.row + 1) % 5][pos2.col];
            } else {
                processed += keySquare[(pos1.row + 4) % 5][pos1.col];
                processed += keySquare[(pos2.row + 4) % 5][pos2.col];
            }
        } else {
            // Rectangle
            processed += keySquare[pos1.row][pos2.col];
            processed += keySquare[pos2.row][pos1.col];
        }
        
        return processed;
    }).join('');
    
    return result;
}

function generatePlayfairKeySquare(key) {
    const keySet = new Set();
    const keySquare = Array(5).fill().map(() => Array(5).fill(''));
    
    let row = 0;
    let col = 0;
    
    // Fill in the key
    for (let i = 0; i < key.length; i++) {
        const char = key[i].toLowerCase();
        if (char === 'j') continue; // Skip 'j'
        if (!keySet.has(char)) {
            keySquare[row][col] = char;
            keySet.add(char);
            
            col++;
            if (col === 5) {
                col = 0;
                row++;
            }
        }
    }
    
    // Fill in the remaining letters
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode(97 + i);
        if (char !== 'j' && !keySet.has(char)) {
            keySquare[row][col] = char;
            
            col++;
            if (col === 5) {
                col = 0;
                row++;
            }
        }
    }
    
    return keySquare;
}

function findPositionInKeySquare(char, keySquare) {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (keySquare[row][col] === char) {
                return { row, col };
            }
        }
    }
    return null;
} 