import argon from "argon2";

function serializePayload(payload: string | object): string {
    return typeof payload === "string" ? payload : JSON.stringify(payload);
}

export async function hash(payload: string | object): Promise<string> {
    try {
        const serialized = serializePayload(payload);
        const hashed = await argon.hash(serialized);
        return hashed;
    } catch (error) {
        throw error;
    }
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
