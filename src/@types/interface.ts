import { z } from "zod";
import { UserUpdateSchema } from "./schema";

export const RegisterSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
export type Register = z.infer<typeof RegisterSchema>;

export const VerifyRegistrationSchema = z.object({
    email: z.string().email(),
    otp: z.string().min(1, "Verification otp is required"),
});
export type VerifyRegistration = z.infer<
    typeof VerifyRegistrationSchema
>;

export const LoginSchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});
export type Login = z.infer<typeof LoginSchema>;

export const EmailOptionsSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    text: z.string().optional(),
    html: z.string().optional(),
});

export const SendContactForm = z.object({
    name: z.string(),
    email: z.string(),
    subject: z.string(),
    message: z.string(),
});

export const UpdateProfileSchema = UserUpdateSchema.omit({
    password: true,
});
export const ResetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
    token: z.string().min(1, "Token is required"),
});

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
});

export const RefreshTokenSchema = z.object({
    token: z.string().min(1, "Refresh token is required"),
});



// Query Schema for common query parameters
export const QuerySchema = z.object({
    // Pagination
    page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().default(1))
        .optional(),
    limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().max(100).default(10))
        .optional(),

    // Search and filtering
    search: z.string().optional(),
    status: z.string().optional(),
    rating: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().min(1).max(5))
        .optional(),

    // Relations
    includeRelations: z
        .string()
        .transform((val) => val === "true")
        .default("false")
        .optional(),

    // Sorting
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

    // Date filtering
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),

    // Category and other filters
    minPrice: z
        .string()
        .transform((val) => parseFloat(val))
        .pipe(z.number().positive())
        .optional(),
    maxPrice: z
        .string()
        .transform((val) => parseFloat(val))
        .pipe(z.number().positive())
        .optional(),
});
export const VerifyLoginSchema = VerifyRegistrationSchema;
export const AdminLoginSchema = LoginSchema.omit({ password: true });
export const ForgotPasswordSchema = AdminLoginSchema;
export const AdminRegisterSchema = RegisterSchema.omit({ password: true });


export type Query = z.infer<typeof QuerySchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type VerifyLogin = z.infer<typeof VerifyLoginSchema>;
export type AdminRegister = z.infer<typeof AdminRegisterSchema>;
export type AdminLogin = z.infer<typeof AdminLoginSchema>;
export type SendContactForm = z.infer<typeof SendContactForm>;
export type EmailInterface = z.infer<typeof EmailOptionsSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
