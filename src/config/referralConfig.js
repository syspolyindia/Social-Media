import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, 'referralValue.json');

let referralValue = 20; // default fallback

// Load initial value from file
try {
    if (fs.existsSync(FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
        referralValue = data.referralValue ?? referralValue;
    }
} catch (error) {
    console.error("Failed to load referral value:", error);
}

export function getReferralValue() {
    return referralValue;
}

export function setReferralValue(newValue) {
    referralValue = newValue;

    // Save to file
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ referralValue }, null, 2));
    } catch (error) {
        console.error("Failed to save referral value:", error);
    }
}
