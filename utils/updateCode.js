import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateCode = async () => {
    try {
        // Get paths from config
        const distPath = path.resolve(__dirname, config.codeUpdate.distPath);
        const payloadPath = path.resolve(__dirname, config.codeUpdate.payloadPath);
        
        // Read the current payload
        const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

        // Read build js and css files
        const jsPath = path.join(distPath, 'v1.js');
        const cssPath = path.join(distPath, 'v1.css');
        
        let jsCode = '';
        let cssCode = '';
        
        // Read JS file if it exists
        if (fs.existsSync(jsPath)) {
            jsCode = fs.readFileSync(jsPath, 'utf8');
        } else {
            console.log('Warning: v1.js not found in', distPath);
        }
        
        // Read CSS file if it exists
        if (fs.existsSync(cssPath)) {
            cssCode = fs.readFileSync(cssPath, 'utf8');
        } else {
            console.log('Warning: v1.css not found in', distPath);
        }
        
        // Update the variations with the new code
        payload.variations.forEach(variation => {
            // if you want ton update code for control  you can use key control_var and update control code
            // Only update code if this is the intended variation
            if (variation.key === 'variation_var') {
                if (variation.changes && variation.changes.length > 0) {
                    variation.changes.forEach(change => {
                        if (change.type === 'defaultCode' && change.data) {
                            if (cssCode) change.data.css = cssCode;
                            if (jsCode) change.data.js = jsCode;
                        }
                    });
                }
            }
        });
        // Write the updated json payload back to file
        fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
        console.log('Successfully updated convert_experience_payload.json with build code');
        
    } catch (error) {
        console.error('Error updating code:', error.message);
    }
};

// If this file is run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Updating code using config paths...');
    updateCode();
}

export default updateCode;