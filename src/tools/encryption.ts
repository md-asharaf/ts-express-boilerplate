import argon from "argon2";
import crypto from "crypto";

function serializePayload(payload: string | object): string {
    return typeof payload === "string" ? payload : JSON.stringify(payload);
}

export async function hashPassword(password: string): Promise<string> {
    try {
        const hashed = await argon.hash(password);
        return hashed;
    } catch (error) {
        throw error;
    }
}

export async function verifyPassword(
    password: string,
    hashed: string,
): Promise<boolean> {
    try {
        const isValid = await argon.verify(hashed, password);
        return isValid;
    } catch (error) {
        throw error;
    }
}

/**
 * One-way hash using SHA-256 (not reversible).
 */
export function hash(payload: string | object): string {
    const serialized = serializePayload(payload);
    const encrypted = crypto
        .createHash("sha256")
        .update(serialized)
        .digest("hex");
    return encrypted;
}

export async function verify(
    payload: string | object,
    hashed: string,
): Promise<boolean> {
    try {
        const serialized = serializePayload(payload);
        const isValid = await argon.verify(hashed, serialized);
        return isValid;
    } catch (error) {
        throw error;
    }
}

/**
 * Two-way encryption using AES-256-CBC.
 * Returns base64 encoded ciphertext and IV.
 */
export function encrypt(
    payload: string | object,
    key: Buffer,
): { iv: string; encryptedData: string } {
    const serialized = serializePayload(payload);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(serialized, "utf8", "base64");
    encrypted += cipher.final("base64");
    return {
        iv: iv.toString("base64"),
        encryptedData: encrypted,
    };
}

/**
 * Two-way decryption using AES-256-CBC.
 * Requires base64 encoded ciphertext and IV.
 */
export function decrypt(
    encryptedData: string,
    ivBase64: string,
    key: Buffer,
): string {
    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
