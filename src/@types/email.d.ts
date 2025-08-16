import { z } from "zod";

export const EmailOptionsSchema = z.object({
	to: z.string().email(),
	subject: z.string(),
	text: z.string().optional(),
	html: z.string().optional(),
});

export const sendContactForm = z.object({
	name: z.string(),
	email: z.string(),
	subject: z.string(),
	message: z.string(),
});

export type SendContactFormInterface = Zod.infer<typeof sendContactForm>;
export type EmailInterface = Zod.infer<typeof EmailOptionsSchema>;
