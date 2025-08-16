import z from "zod";

// Base schemas for creating/updating records
export const UserCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const UserUpdateSchema = UserCreateSchema.partial().omit({
    email: true
});

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

export const AdminCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
});

export const AdminUpdateSchema = AdminCreateSchema.pick({
    name: true,
}).partial();

export const AdminSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
});


export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type User = z.infer<typeof UserSchema>;

export type AdminCreate = z.infer<typeof AdminCreateSchema>;
export type AdminUpdate = z.infer<typeof AdminUpdateSchema>;
export type Admin = z.infer<typeof AdminSchema>;