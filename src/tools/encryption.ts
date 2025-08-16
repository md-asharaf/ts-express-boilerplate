import { hash, verify } from "argon2";

export async function hashPassword(
	password: string,
): Promise<{ status: string; message: string; hashedPassword?: string }> {
	try {
		const hashedPassword = await hash(password);

		return {
			status: "success",
			message: "Password hashed successfully",
			hashedPassword,
		};
	} catch (error) {
		return {
			status: "error",
			message: "Failed to hash password",
		};
	}
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<{ status: string; message: string; isValid?: boolean }> {
	try {
		const isValid = await verify(hashedPassword, password);

		return {
			status: isValid ? "success" : "error",
			message: isValid ? "Password verified successfully" : "Invalid password",
		};
	} catch (error) {
		return {
			status: "error",
			message: "Failed to verify password",
		};
	}
}
