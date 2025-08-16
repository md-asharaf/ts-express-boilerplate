import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import { logger } from "./logger";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Define the environment configuration schema
const EnvConfigSchema = z.object({
	PORT: z.coerce
		.number({
			required_error: "PORT environment variable is required",
			invalid_type_error: "PORT must be a valid number",
		})
		.int()
		.positive()
		.default(3000),

	NODE_ENV: z
		.enum(["development", "production", "test"], {
			required_error: "NODE_ENV environment variable is required",
			invalid_type_error: "NODE_ENV must be one of: development, production, test",
		})
		.default("development"),

	// Database configuration
	DATABASE_URL: z
		.string({
			required_error: "DATABASE_URL environment variable is required",
			invalid_type_error: "DATABASE_URL must be a string",
		})
		.url("DATABASE_URL must be a valid URL")
		.optional(),
	// GOOGLE_CLIENT_SECRET: z
	// 	.string({
	// 		required_error: "GOOGLE_CLIENT_SECRET environment variable is required",
	// 		invalid_type_error: "GOOGLE_CLIENT_SECRET must be a string",
	// 	})
	// 	.optional(),
	// GOOGLE_CLIENT_ID: z
	// 	.string({
	// 		required_error: "GOOGLE_CLIENT_ID environment variable is required",
	// 		invalid_type_error: "GOOGLE_CLIENT_ID must be a string",
	// 	})
	// 	.optional(),

	// JWT configuration
	JWT_SECRET: z
		.string({
			required_error: "JWT_SECRET environment variable is required",
			invalid_type_error: "JWT_SECRET must be a string",
		})
		.min(8, "JWT_SECRET must be at least 8 characters long")
		.optional(),

	// Session configuration for passport
	SESSION_SECRET: z
		.string({
			required_error: "SESSION_SECRET environment variable is required",
			invalid_type_error: "SESSION_SECRET must be a string",
		})
		.min(8, "SESSION_SECRET must be at least 8 characters long")
		.optional(),

	// Security
	REDIS_HOST: z
		.string({
			required_error: "REDIS_HOST environment variable is required",
			invalid_type_error: "REDIS_HOST must be a string",
		})
		.default("localhost"),
	REDIS_PORT: z.coerce
		.number({
			required_error: "REDIS_PORT environment variable is required",
			invalid_type_error: "REDIS_PORT must be a valid number",
		})
		.int()
		.positive()
		.default(4567),
	REDIS_DB: z.coerce
		.number({
			required_error: "REDIS_DB environment variable is required",
			invalid_type_error: "REDIS_DB must be a valid number",
		})
		.int()
		.min(0)
		.default(0),

	// SMTP Email configuration
	SMTP_HOST: z
		.string({
			required_error: "SMTP_HOST environment variable is required",
			invalid_type_error: "SMTP_HOST must be a string",
		})
		.default("smtp.gmail.com"),
	SMTP_PORT: z.coerce
		.number({
			required_error: "SMTP_PORT environment variable is required",
			invalid_type_error: "SMTP_PORT must be a valid number",
		})
		.int()
		.positive()
		.default(587),
	SMTP_USER: z
		.string({
			required_error: "SMTP_USER environment variable is required",
			invalid_type_error: "SMTP_USER must be a string",
		})
		.optional(),
	SMTP_PASSWORD: z
		.string({
			required_error: "SMTP_PASSWORD environment variable is required",
			invalid_type_error: "SMTP_PASSWORD must be a string",
		})
		.optional(),
});

// Define the config type using Zod inference
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

// Load raw configuration from environment variables
const rawConfig = {
	PORT: process.env.PORT,
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	SESSION_SECRET: process.env.SESSION_SECRET,
	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_DB: process.env.REDIS_DB,
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASSWORD: process.env.SMTP_PASSWORD,
	// GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	// GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
};

// Validate and parse configuration
let envVars: EnvConfig;

try {
	envVars = EnvConfigSchema.parse(rawConfig);
	logger.info("Environment configuration loaded.");
} catch (error) {
	if (error instanceof z.ZodError) {
		logger.error("Environment configuration validation failed:", error.errors);
		error.errors.forEach((err) => {
			logger.error(`- ${err.path.join(".")}: ${err.message}`);
		});
	} else {
		logger.error("Unknown error during environment config validation:", error);
	}

	// Throw error to prevent application from starting with invalid config
	throw new Error("Environment configuration validation failed. Check environment variables.");
}

// Export individual config values for convenience
export const {
	PORT,
	NODE_ENV,
	DATABASE_URL,
	JWT_SECRET,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_DB,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASSWORD,
	// GOOGLE_CLIENT_SECRET,
	// GOOGLE_CLIENT_ID,
} = envVars;

export default envVars;