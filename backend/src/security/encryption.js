const crypto = require('crypto');

// Normally this should be in .env! Must be exactly 32 bytes for aes-256-cbc.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'abcedf01234567890123456789012345'; // 32 characters
const IV_LENGTH = 16; 

function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error('Encryption failed', err);
        return text;
    }
}

function decrypt(text) {
    if (!text) return text;
    // Basic check if it follows our iv:encryptedFormat
    if (!text.includes(':')) return text;

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        console.error('Decryption failed', err);
        return text; // Return raw text if it wasn't actually encrypted (e.g., mock data)
    }
}

module.exports = { encrypt, decrypt };
