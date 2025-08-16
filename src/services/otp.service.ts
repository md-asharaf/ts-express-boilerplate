import { redis } from "@/config/database";
import { logger } from "@/config/logger";
import { APIError } from "@/utils/APIError";

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateOtp(email: string): Promise<string> {
    try {
        const otp = generateCode();
        await redis.setValue(`otp:${email}`, otp, 180);
        logger.debug("[OTP_SERVICE] OTP stored in Redis", { email: email, expirySeconds: 180 });
        return otp
    } catch (error) {
        throw new APIError(400, "Failed to save otp");
    }
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await redis.getValue(`otp:${email}`);
    if (!storedOtp) {
        return false;
    }
    if (otp === storedOtp) {
        await redis.deleteValue(`otp:${email}`);
        return true
    }
    return false;
}

export async function deleteOtp(email: string): Promise<boolean> {
    const success = await redis.deleteValue(`otp:${email}`);
    if (!success) {
        throw new APIError(400, "Failed to delete otp")
    }
    logger.debug("[OTP_SERVICE] OTP deleted from Redis", { email: email });
    return true;
}
