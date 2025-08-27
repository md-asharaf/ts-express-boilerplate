import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { APIError } from "@/utils/APIError";
import catchAsync from "@/handlers/async.handler";
import envVars from "@/config/envVars";
import adminService from "@/services/admin.service";
import { Admin } from "@/@types/schema";
import { logger } from "@/config/logger";

export const authenticateAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn("[ADMIN_MIDDLEWARE] No Bearer token found in Authorization header");
            throw new APIError(
                401,
                "Authentication required. Please provide a valid token."
            );
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(
                token,
                envVars.JWT_SECRET
            ) as jwt.JwtPayload;
            if (!decoded.id || !decoded.jti) {
                throw new APIError(401, "Invalid token payload.");
            }

            const admin = await adminService.getAdminById(decoded.id);
            if (!admin) {
                throw new APIError(
                    401,
                    "Unauthorized. Admin associated with this token not found."
                );
            }

            req.admin = admin;

            logger.info(`[ADMIN_MIDDLEWARE] Admin authenticated successfully: ${admin.id}`);

            next();
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof jwt.TokenExpiredError) {
                logger.warn("[ADMIN_MIDDLEWARE] JWT token expired");
                throw new APIError(
                    401,
                    "Token has expired. Please log in again."
                );
            }
            if (error instanceof jwt.JsonWebTokenError) {
                logger.warn("[ADMIN_MIDDLEWARE] Invalid JWT token");
                throw new APIError(401, "Invalid token. Please log in again.");
            }
            logger.error("[ADMIN_MIDDLEWARE] Unexpected admin authentication error:", error);
            throw new APIError(
                500,
                "An unexpected error occurred during admin authentication."
            );
        }
    }
);

export const authorizeSuperAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin as Admin;
    if (admin.role === "SUPER") {
        logger.info(`[ADMIN_MIDDLEWARE] Super admin authorization granted for admin ID: ${admin.id}`);
        next();
    } else {
        logger.warn(`[ADMIN_MIDDLEWARE] Super admin authorization denied for admin ID: ${admin.id}`);
        throw new APIError(403, "You are not authorized.Only super admin can perform this action.");
    }
});
