import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { redis } from "@/config/database";
import catchAsync from "@/handlers/async.handler";
import { generateOtp, verifyOtp } from "@/services/otp.service";
import userService from "@/services/user.service";
import { hashPassword, verifyPassword } from "@/tools/encryption";
import { APIError } from "@/utils/APIError";
import z from "zod";
import emailService from "@/services/email.service";
import { ForgotPassword, Login, RefreshToken, Register,VerifyRegistration } from "@/@types/interface";
import { AccountType, generateTokens, Payload, verifyToken } from "@/services/token.service";

const initRegister = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body as Register;
    if (!email || !password || !name) {
        throw new APIError(400, "Missing required fields.");
    }
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
        throw new APIError(400, "User already exists with this email.");
    }
    const encryptedPassword = await hashPassword(password as string);
    await redis.setValue(
        `register:${email}`,
        JSON.stringify({
            email,
            name,
            password: encryptedPassword.hashedPassword,
        }),
        60 * 5,
    ); // store for 5 mins
    const otp = await generateOtp(email);
    await emailService.sendEmail({
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });
    res.status(200).json({
        success: true,
        message: "OTP sent to your email for registration.",
        otp: otp,
    });
    return;
});

const verifyRegistration = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body as VerifyRegistration;
    if (!email || !otp) {
        throw new APIError(400, "Email and OTP are required.");
    }
    const user_data = await redis.getValue(`register:${email}`);
    if (!user_data) {
        throw new APIError(400, "Registration session expired or not found.");
    }
    const parsedUser = JSON.parse(user_data);
    const isVerified = await verifyOtp(email, otp);
    if (!isVerified) {
        throw new APIError(400, "Invalid OTP.");
    }
    const user = await userService.createUser({
        email: parsedUser.email,
        name: parsedUser.name,
        password: parsedUser.password,
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens({
        accountType: AccountType.USER,
        id: user.id,
        jti
    });
    // Clean up Redis data after successful registration
    await redis.deleteValue(`register:${email}`);

    res.status(201).json({
        success: true,
        message: "User registered successfully.",
        tokens: {
            accessToken,
            refreshToken
        },
    });
    return;
});

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body as Login;
    if (!email || !password) {
        throw new APIError(400, "Email and password are required.");
    }
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new APIError(404, "User not found.");
    }

    const isPasswordValid = await verifyPassword(password as string, user.password);
    if (!isPasswordValid) {
        throw new APIError(401, "Invalid password.");
    }
    const jti = uuidv4();
    const tokens = generateTokens({ id: user.id, jti, accountType: AccountType.USER });
    res.status(200).json({
        success: true,
        message: "User logged in successfully.",
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        tokens: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
        },
    });
    return;
});

// // Google OAuth initiation
// const googleAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userType = req.query.type as string;

//     // Validate user type
//     if (userType && !ACCOUNT_TYPE.options.includes(userType.toUpperCase() as any)) {
//         throw new APIError(400, "Invalid user type. Must be STUDENT or TEACHER");
//     }

//     // Store user type in session for use in callback
//     req.session.userType = userType ? userType.toUpperCase() : "STUDENT";

//     // Initiate OAuth with passport
//     passport.authenticate("google", {
//         scope: ["profile", "email"],
//     })(req, res, next);
// });

// // Google OAuth callback handler
// const googleCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate("google", { failureRedirect: "/login" })(req, res, async () => {
//         try {
//             if (!req.user) {
//                 throw new APIError(401, "Google authentication failed");
//             }

//             const googleUser = req.user as userInterface;

//             // Check if user already exists in our database
//             let existingUser = await userService.getUserByEmail(googleUser.email);

//             if (!existingUser) {
//                 // Create new user if doesn't exist
//                 // Generate a random password for OAuth users (they won't use it)
//                 const randomPassword = uuidv4();
//                 const hashedPasswordResult = await hashPassword(randomPassword);

//                 if (!hashedPasswordResult.hashedPassword) {
//                     throw new APIError(500, "Failed to generate password for OAuth user");
//                 }

//                 // Get user type from session (default to STUDENT if not set)
//                 const userType = (req.session.userType || "STUDENT") as ACCOUNT_TYPE;

//                 existingUser = await userService.createUser({
//                     email: googleUser.email,
//                     name: googleUser.name,
//                     password: hashedPasswordResult.hashedPassword,
//                     type: userType,
//                 });

//                 // Clear the session data
//                 delete req.session.userType;
//             }

//             // Generate JWT tokens
//             const jti = uuidv4();
//             const accountType = existingUser.type === 'STUDENT' ? tokenService.AccountType.STUDENT : tokenService.AccountType.TEACHER;
//             const tokens = tokenService.generateTokens(existingUser.id, jti, accountType);

//             // You can redirect to frontend with tokens or send them as JSON
//             // For now, sending as JSON response
//             res.status(200).json({
//                 success: true,
//                 message: "Google authentication successful",
//                 user: {
//                     id: existingUser.id,
//                     email: existingUser.email,
//                     name: existingUser.name,
//                     type: existingUser.type,
//                 },
//                 tokens: {
//                     access_token: tokens.accessToken,
//                     refresh_token: tokens.refreshToken,
//                 },
//             });
//         } catch (error: any) {
//             res.status(500).json({
//                 success: false,
//                 message: "Authentication failed",
//                 error: error.message,
//             });
//         }
//     });
// });

// // Google OAuth failure handler
// const googleAuthFailure = catchAsync(async (req: Request, res: Response) => {
//     res.status(401).json({
//         success: false,
//         message: "Google authentication failed",
//     });
// });

const resendOtpToMail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPassword
    if (!email) {
        throw new APIError(400, "Missing required fields: email is required");
    }
    try {
        // Check if user exists
        const userExists = await userService.getUserByEmail(email);
        if (userExists) {
            throw new APIError(400, "User already verified, cannot resend OTP");
        }

        // Check if registration session exists
        const registrationData = await redis.getValue(`register:${email}`);
        if (!registrationData) {
            throw new APIError(400, "No registration session found. Please start registration process again.");
        }

        // Send OTP
        const otp = await generateOtp(email);

        // Send response
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        });
        return;
    } catch (error: any) {
        if (error instanceof APIError) {
            throw error;
        }
        if (error instanceof z.ZodError) {
            throw new APIError(
                400,
                error.errors.map((e) => e.message).join(", ")
            );
        }
        console.error("Error sending OTP:", error);
        throw new APIError(500, error.message);
    }
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {

});

const resetPassword = catchAsync(async (req: Request, res: Response) => {

});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body as RefreshToken;
    if (!token) {
        throw new APIError(400, "Missing required fields: token is required");
    }
    try {
        // Verify the refresh token
        const decodedToken: Payload = verifyToken(token) as Payload;
        if (!decodedToken) {
            throw new APIError(401, "Invalid or expired refresh token");
        }

        // Check if user still exists and is active
        const user = await userService.getUserById(decodedToken.id);
        if (!user) {
            throw new APIError(404, "User not found");
        }

        // Generate new access and refresh tokens
        const jti = crypto.randomUUID();
        const { accessToken, refreshToken: newRefreshToken } = generateTokens({
            accountType: AccountType.USER,
            id: user.id,
            jti
        });

        // Send response
        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
        return;
    } catch (error: any) {
        if (error instanceof APIError) {
            throw error;
        }
        if (error instanceof z.ZodError) {
            throw new APIError(
                400,
                error.errors.map((e) => e.message).join(", ")
            );
        }
        console.error("Error refreshing tokens:", error);
        throw new APIError(500, error.message);
    }
});

export default {
    initRegister,
    verifyRegistration,
    login,
    // googleAuth,
    // googleCallback,
    // googleAuthFailure,
    resetPassword,
    forgotPassword,
    resendOtpToMail,
    refreshTokens,
};
