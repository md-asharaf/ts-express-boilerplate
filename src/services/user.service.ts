import { db } from "@/config/database";
import { logger } from "@/config/logger";
import { APIError } from "@/utils/APIError";
import {
    UserCreateSchema,
    type UserCreate,
    type User,
} from "@/@types/schema";
import { z } from "zod";
class UserService {
    /**
     * Create a new user
     */
    async createUser(userData: UserCreate): Promise<User> {
        try {
            const validatedData = UserCreateSchema.parse(userData);
            // Check if user with email already exists
            const existingUser = await db.user.findUnique({
                where: { email: validatedData.email },
                select: { id: true },
            });

            if (existingUser) {
                throw new APIError(
                    409,
                    "User with this email already exists. Please use a different email."
                );
            }
            //check if admin exists with the same email
            const adminExists = await db.admin.findUnique({
                where: { email: validatedData.email },
            });
            if (adminExists) {
                throw new APIError(
                    409,
                    "Admin with this email already exists. Please use a different email."
                );
            }
            // Create the user
            const user = await db.user.create({
                data: validatedData,
            });

            logger.info(
                `[USER_SERVICE] User created successfully with ID: ${user.id}`
            );
            return user;
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
            logger.error("[USER_SERVICE] Error creating user:", error);
            throw new APIError(500, "Failed to create user");
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(
        userId: string,
        includeRelations: boolean = false
    ): Promise<User | null> {
        try {
            const user = await db.user.findUnique({
                where: { id: userId },
                // include: includeRelations
                //     ? {
                //         cart: true,
                //         orders: true,
                //         reviews: true,
                //         addresses: true
                //     }
                //     : undefined,
            });

            if (!user) {
                logger.warn(`[USER_SERVICE] User not found with ID: ${userId}`);
                return null;
            }

            logger.info(
                `[USER_SERVICE] User retrieved successfully with ID: ${userId}`
            );
            return user;
        } catch (error) {
            logger.error(
                `[USER_SERVICE] Error getting user by ID ${userId}:`,
                error
            );
            throw new APIError(500, "Failed to retrieve user");
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(
        email: string,
        includeRelations: boolean = false
    ): Promise<User | null> {
        try {
            const user = await db.user.findUnique({
                where: { email },
                // include: includeRelations
                //     ? {
                //         cart: true,
                //         orders: true,
                //         reviews: true,
                //         addresses: true
                //     }
                //     : undefined,
            });

            if (!user) {
                logger.warn(
                    `[USER_SERVICE] User not found with email: ${email}`
                );
                return null;
            }

            logger.info(
                `[USER_SERVICE] User retrieved successfully with email: ${email}`
            );
            return user;
        } catch (error) {
            logger.error(
                `[USER_SERVICE] Error getting user by email ${email}:`,
                error
            );
            throw new APIError(500, "Failed to retrieve user");
        }
    }
    /**
     * Check if user exists by email
     */
    async userExists(email: string): Promise<boolean> {
        try {
            const user = await db.user.findUnique({
                where: { email },
                select: { id: true },
            });
            return !!user;
        } catch (error) {
            logger.error(
                `[USER_SERVICE] Error checking if user exists with email ${email}:`,
                error
            );
            throw new APIError(500, "Failed to check user existence");
        }
    }
}

export default new UserService();
