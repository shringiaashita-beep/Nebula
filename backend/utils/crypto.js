const crypto = require("crypto");
require("dotenv").config();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // For GCM, 12 bytes is recommended
const AUTH_TAG_LENGTH = 16;

// Validate encryption key
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
  console.error("FATAL ERROR: ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  process.exit(1);
}

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {Object} - The encrypted text, IV, and Auth Tag as hex strings.
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag
  };
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {string} encryptedData - The encrypted text as hex.
 * @param {string} iv - The initialization vector as hex.
 * @param {string} authTag - The authentication tag as hex.
 * @returns {string} - The decrypted plaintext string.
 */
function decrypt(encryptedData, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
