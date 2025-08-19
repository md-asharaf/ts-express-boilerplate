import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { EmailInterface } from "@/@types/email";
import {
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
} from "@/config/envVars";
import { logger } from "@/config/logger";
import { APIError } from "@/utils/APIError";

class MailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        } as SMTPTransport.Options);

        this.transporter
            .verify()
            .then(() => logger.info("[EMAIL] connected to service."))
            .catch((error) => logger.error(`[EMAIL] Service : ${error}`));
    }

    public async sendEmail(options: EmailInterface): Promise<void> {
        const mailOptions = {
            from: SMTP_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error: any) {
            throw new APIError(500, error.message);
        }
    }
}

export default new MailService();
