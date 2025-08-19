import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import catchAsync from "@/handlers/async.handler";
import { generateOtp, verifyOtp } from "@/services/otp.service";
import { AccountType, generateTokens } from "@/services/token.service";
import { APIError } from "@/utils/APIError";
import { db } from "@/config/database";
import { AdminLogin, VerifyLogin } from "@/@types/interface";

const login = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body as AdminLogin;
    if (!email) {
        throw new APIError(400, "Email is required");
    }
    const adminCheck = await db.admin.findUnique({
        where: { email },
    });
    if (!adminCheck) {
        throw new APIError(404, "Admin not found");
    }
    const otp = await generateOtp(adminCheck.email);
    res.status(200).json({
        success: true,
        message: "admin otp sent.",
        otp: otp,
    });
    return;
});

const verifyLogin = catchAsync(async (req: Request, res: Response) => {
    const { otp, email } = req.body as VerifyLogin;
    if (!otp || !email) {
        throw new APIError(400, "OTP and email are required");
    }
    const isVerified = await verifyOtp(email, otp);
    if (!isVerified) {
        throw new APIError(400, "Failed to verify otp");
    }
    const admin = await db.admin.findUnique({
        where: { email },
    });
    if (!admin) {
        throw new APIError(404, "Admin not found");
    }
    const jti = uuidv4();

    const token = generateTokens({
        id: admin.id,
        accountType: AccountType.ADMIN,
        jti,
    });
    res.json({
        message: "Admin logged in successfully",
        tokens: {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
        },
    });
    return;
});

export default {
    login,
    verifyLogin,
};
