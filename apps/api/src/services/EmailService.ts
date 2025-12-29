import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export enum EmailProvider {
    SMTP = "smtp",
    SES = "ses",
}

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private sesClient: SESv2Client | null = null;
    private provider: EmailProvider;

    constructor() {
        this.provider = (process.env.EMAIL_PROVIDER as EmailProvider) || EmailProvider.SMTP;
        this.initProvider();
    }

    private initProvider() {
        if (this.provider === EmailProvider.SES) {
            this.sesClient = new SESv2Client({
                region: process.env.AWS_REGION || "us-east-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
                },
            });
        }

        // Initialize Nodemailer transporter for SMTP or as a wrapper for SES raw email if needed
        // However, for SES we can use the SDK directly or nodemailer-ses-transport.
        // For simplicity and flexibility, we'll use Nodemailer for SMTP and AWS SDK for SES.

        if (this.provider === EmailProvider.SMTP) {
            const resolvedPort = Number(process.env.SMTP_PORT || 587);
            const resolvedSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || resolvedPort === 465;

            this.transporter = nodemailer.createTransport({
                service: process.env.SMTP_SERVICE || undefined,
                host: process.env.SMTP_HOST,
                port: resolvedPort,
                secure: resolvedSecure,
                requireTLS: String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true' || (!resolvedSecure && resolvedPort === 587),
                auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                } : undefined,
                pool: true,
            });
        }
    }

    /**
     * Send an email using the configured provider
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        if (process.env.EMAIL_ENABLED === 'false') {
            console.log(`[EmailService] Skipping email to ${options.to} (EMAIL_ENABLED=false)`);
            return;
        }

        const from = options.from || process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@glotrade.online";
        console.log(`[EmailService] Sending via ${this.provider} to ${options.to} (Subject: ${options.subject})`);

        if (this.provider === EmailProvider.SES && this.sesClient) {
            await this.sendViaSES(from, options);
        } else if (this.transporter) {
            await this.sendViaSMTP(from, options);
        } else {
            console.warn("[EmailService] No email provider initialized. Falling back to Ethereal in non-production.");
            if (process.env.NODE_ENV !== "production") {
                await this.sendViaEthereal(options);
            }
        }
    }

    private async sendViaSMTP(from: string, options: EmailOptions): Promise<void> {
        if (!this.transporter) return;
        await this.transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
    }

    private async sendViaSES(from: string, options: EmailOptions): Promise<void> {
        if (!this.sesClient) return;

        // For SES, we'll use the SDK directly to avoid version-specific wrapper issues in Nodemailer.
        // This is more reliable and gives us better control over errors.
        const command = new SendEmailCommand({
            FromEmailAddress: from,
            Destination: {
                ToAddresses: [options.to],
            },
            Content: {
                Simple: {
                    Subject: { Data: options.subject },
                    Body: {
                        Html: options.html ? { Data: options.html } : undefined,
                        Text: options.text ? { Data: options.text } : undefined,
                    },
                },
            },
        });

        await this.sesClient.send(command);
    }

    private async sendViaEthereal(options: EmailOptions): Promise<void> {
        try {
            const testAccount = await nodemailer.createTestAccount();
            const etherealTransporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
            const info = await etherealTransporter.sendMail({
                from: 'Glotrade Test <no-reply@ethereal.email>',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log('Ethereal preview URL:', preview);
        } catch (e) {
            console.warn('Ethereal fallback failed', e);
        }
    }

    /**
     * Shorthand for verification email
     */
    async sendVerificationEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Verify your email",
            text: `Verify: ${url}`,
            html: `<p>Verify your account:</p><p><a href="${url}">${url}</a></p>`,
        });
    }

    /**
     * Shorthand for password reset email
     */
    async sendPasswordResetEmail(email: string, url: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Reset your password",
            text: `Reset link: ${url}`,
            html: `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`,
        });
    }

    /**
     * Shorthand for reactivation email
     */
    async sendReactivationEmail(email: string, url: string, deletionCount: number): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: "Account Reactivation Required",
            text: `Your account was marked for deletion. Click here to reactivate: ${url}`,
            html: `
        <p>Your account was marked for deletion and requires reactivation.</p>
        <p>This is deletion attempt #${deletionCount}.</p>
        <p>Click the link below to reactivate your account:</p>
        <p><a href="${url}">${url}</a></p>
        <p>This link expires in 24 hours.</p>
      `,
        });
    }
}

export default new EmailService();
