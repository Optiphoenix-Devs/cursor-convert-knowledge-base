import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads a file if it exists, otherwise returns an empty string.
 * @param {string} filePath
 * @returns {string}
 */
function safeReadFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    } else {
        console.log(`Warning: ${path.basename(filePath)} not found in`, path.dirname(filePath));
        return '';
    }
}

/**
 * Updates the code blocks for the specified variation key in the payload object.
 * @param {object} payload
 * @param {string} variationKey
 * @param {string} jsCode
 * @param {string} cssCode
 */
function updateVariationCode(payload, variationKey, jsCode, cssCode) {
    if (!payload.variations || !Array.isArray(payload.variations)) return;

    payload.variations.forEach(variation => {
        if (variation.key !== variationKey) return;
        if (!Array.isArray(variation.changes)) return;

        variation.changes.forEach(change => {
            if (change.type === 'defaultCode' && change.data) {
                if (cssCode) change.data.css = cssCode;
                if (jsCode) change.data.js = jsCode;
            }
        });
    });
}

const updateCode = async () => {
    try {
        const { distPath, payloadPath } = config.codeUpdate;
        const resolvedDistPath = path.resolve(__dirname, distPath);
        const resolvedPayloadPath = path.resolve(__dirname, payloadPath);

        // Read current payload
        const payload = JSON.parse(fs.readFileSync(resolvedPayloadPath, 'utf8'));

        // Read build js and css files
        const jsCode = safeReadFile(path.join(resolvedDistPath, 'v1.js'));
        const cssCode = safeReadFile(path.join(resolvedDistPath, 'v1.css'));

        // Update the code in the correct variation
        updateVariationCode(payload, 'variation_var', jsCode, cssCode);

        // Write back the updated payload
        fs.writeFileSync(resolvedPayloadPath, JSON.stringify(payload, null, 2));
        console.log('Successfully updated convert_experience_payload.json with build code');
    } catch (error) {
        console.error('Error updating code:', error.message);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Updating code using config paths...');
    updateCode();
}

export default updateCode;