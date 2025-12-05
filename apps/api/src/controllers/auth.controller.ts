// Express types handled by any
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { ValidationError } from "../utils/errors";
import { WalletService } from "../services/WalletService";
import { UserService } from "../services/UserService";

const resolvedPort = Number(process.env.SMTP_PORT || 587);
const resolvedSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || resolvedPort === 465;
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || undefined, // e.g., 'gmail'
  host: process.env.SMTP_HOST,
  port: resolvedPort,
  secure: resolvedSecure,
  requireTLS: String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true' || (!resolvedSecure && resolvedPort === 587),
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  pool: true,
  connectionTimeout: 12000,
  socketTimeout: 12000,
  greetingTimeout: 12000,
});

async function sendViaEthereal(to: string, url: string): Promise<string | null> {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const etherealTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await etherealTransporter.sendMail({
      from: 'AfriTrade <no-reply@ethereal.email>',
      to,
      subject: 'Verify your email',
      text: `Verify: ${url}`,
      html: `<p>Verify your account:</p><p><a href="${url}">${url}</a></p>`,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Ethereal preview URL:', preview);
    return preview || null;
  } catch (e) {
    console.warn('Ethereal fallback failed', e);
    return null;
  }
}

export class AuthController {
  private walletService: WalletService;
  private userService: UserService;

  constructor() {
    this.walletService = new WalletService();
    this.userService = new UserService();
  }

  register = async (req: any, res: any, next: any) => {
    try {
      const { email, username, password, accountType, businessInfo } = req.body || {};
      if (!email || !username || !password) throw new ValidationError("Missing fields");

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedUsername = String(username).trim();

      // Sanitize optional address; avoid creating empty-string duplicates
      const rawAddress = typeof req.body?.address === 'string' ? String(req.body.address).trim() : undefined;
      const address = rawAddress && rawAddress.length > 0 ? rawAddress.toLowerCase() : undefined;

      // Check duplicates individually to return precise errors
      const emailDoc = await User.findOne({ email: normalizedEmail });
      const usernameDoc = await User.findOne({ username: normalizedUsername });

      let addressDoc = null;
      if (address) {
        addressDoc = await User.findOne({ address });
      }

      if (emailDoc) throw new ValidationError('email already exists');
      if (usernameDoc) throw new ValidationError('username already exists');
      if (address && addressDoc) throw new ValidationError('address already exists');

      const passwordHash = await bcrypt.hash(password, 10);
      const verifyToken = crypto.randomBytes(24).toString("hex");

      const createDoc: any = {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        verifyToken,
        verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        accountType: accountType === 'business' ? 'business' : 'individual'
      };

      if (accountType === 'business' && businessInfo) {
        createDoc.businessInfo = {
          companyName: String(businessInfo.companyName || '').trim(),
          taxId: String(businessInfo.taxId || '').trim(),
          businessType: String(businessInfo.businessType || 'Other'),
          registrationNumber: String(businessInfo.registrationNumber || '').trim(),
          website: String(businessInfo.website || '').trim(),
          industry: String(businessInfo.industry || '').trim(),
          yearEstablished: Number(businessInfo.yearEstablished) || undefined,
          isVerified: false // Always false initially
        };
      }

      // Only add address if it's provided
      if (address) {
        createDoc.address = address;
      }

      const user = await User.create(createDoc);

      // Create wallets for new user
      try {
        await this.walletService.createUserWallets(user._id.toString());
      } catch (error) {
        console.warn(`Failed to create wallets for new user ${user._id}:`, error);
        // Don't fail registration if wallet creation fails, just log the warning
      }

      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/verify?token=${verifyToken}`;

      // Fire-and-forget email sending; do not block registration response
      if (process.env.NODE_ENV !== 'test') {
        (async () => {
          if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
              await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com",
                to: email,
                subject: "Verify your email",
                text: `Verify: ${url}`,
                html: `<p>Verify your account:</p><p><a href=\"${url}\">${url}</a></p>`
              });
            } catch (mailErr) {
              console.warn("Email send failed (registration will still succeed)", mailErr);
              if (process.env.NODE_ENV !== 'production') {
                await sendViaEthereal(email, url);
              }
            }
          } else if (process.env.NODE_ENV !== 'production') {
            await sendViaEthereal(email, url);
          }
        })();
      }

      const token = jwt.sign(
        { id: user._id, role: (user as any).role || 'buyer' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Set secure cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        status: "success",
        token,
        data: {
          token, // Restore for frontend compatibility
          id: user._id,
          email,
          username
        }
      });
    } catch (e) {
      next(e);
    }
  };

  login = async (req: any, res: any, next: any) => {
    try {
      const { email, username, password } = req.body || {};

      // Support both email and username login
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else if (username) {
        user = await User.findOne({ username });
      } else {
        throw new ValidationError("Email or username is required");
      }

      if (!user || !(user as any).passwordHash) throw new ValidationError("Invalid credentials");

      // Check if account is marked for deletion
      if ((user as any).isDeletionRequested) {
        // Generate reactivation token and send email
        const reactivationToken = crypto.randomBytes(24).toString("hex");
        (user as any).verifyToken = reactivationToken;
        (user as any).verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        // Send reactivation email
        const origin = process.env.APP_ORIGIN || "http://localhost:3000";
        const reactivationUrl = `${origin}/auth/reactivate?token=${reactivationToken}`;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com",
              to: user.email, // Use user's email from database, not input
              subject: "Account Reactivation Required",
              text: `Your account was marked for deletion. Click here to reactivate: ${reactivationUrl}`,
              html: `
                <p>Your account was marked for deletion and requires reactivation.</p>
                <p>This is deletion attempt #${(user as any).deletionCount || 1}.</p>
                <p>Click the link below to reactivate your account:</p>
                <p><a href="${reactivationUrl}">${reactivationUrl}</a></p>
                <p>This link expires in 24 hours.</p>
              `,
            });
          } catch (emailError) {
            console.error('Failed to send reactivation email:', emailError);
          }
        }

        await user.save();
        throw new ValidationError("Account is marked for deletion. A reactivation email has been sent to your email address.");
      }

      const ok = await bcrypt.compare(password, (user as any).passwordHash);
      if (!ok) throw new ValidationError("Invalid credentials");

      // Ensure user has walletId (for existing users who might not have it)
      try {
        const walletId = await this.userService.ensureWalletId(user._id.toString());
        (user as any).walletId = walletId;
        console.log(`Ensured walletId ${walletId} for user ${user.email}`);

        // Refresh user object to get updated data
        const refreshedUser = await User.findById(user._id);
        if (refreshedUser) {
          Object.assign(user, refreshedUser.toObject());
        }
      } catch (error) {
        console.warn(`Failed to ensure walletId for user ${user._id}:`, error);
      }

      // Ensure user has wallets created (auto-create if they don't exist)
      try {
        await this.walletService.getWalletSummary(user._id.toString(), "user");
      } catch (error) {
        console.warn(`Failed to ensure wallets for user ${user._id}:`, error);
        // Don't fail login if wallet creation fails, just log the warning
      }

      // Generate JWT token for authentication
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          username: user.username,
          role: (user as any).role || 'buyer'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set secure cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        token,
        data: {
          token, // Restore for frontend compatibility
          id: user._id,
          email: user.email,
          username: user.username,
          role: (user as any).role || 'buyer',
          isEmailVerified: (user as any).emailVerified,
          firstName: (user as any).firstName,
          lastName: (user as any).lastName,
          isSuperAdmin: (user as any).isSuperAdmin || false,
          walletId: (user as any).walletId,
        }
      });
    } catch (e) { next(e); }
  };

  logout = async (req: any, res: any, next: any) => {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax'
      });
      res.status(200).json({ status: "success", message: "Logged out successfully" });
    } catch (e) { next(e); }
  };

  verify = async (req: any, res: any, next: any) => {
    try {
      const token = String(req.query.token || "");
      const user = await User.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
      if (!user) throw new ValidationError("Invalid or expired token");
      (user as any).emailVerified = true; (user as any).verifyToken = undefined; (user as any).verifyTokenExpires = undefined; await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  reactivate = async (req: any, res: any, next: any) => {
    try {
      // Accept token from either query params (GET) or body (POST)
      const token = String(req.query.token || req.body?.token || "");
      // console.log("Reactivation attempt - Token:", token);
      // console.log("Query params:", req.query);
      // console.log("Body:", req.body);

      if (!token) throw new ValidationError("Reactivation token is required");

      // Find user with this token
      const user = await User.findOne({
        verifyToken: token,
        verifyTokenExpires: { $gt: new Date() },
        isDeletionRequested: true
      });

      // console.log("User found:", user ? "Yes" : "No");
      if (user) {
        // console.log("User deletion status:", user.isDeletionRequested);
        // console.log("Token expires:", user.verifyTokenExpires);
        // console.log("Current time:", new Date());
      }

      if (!user) throw new ValidationError("Invalid or expired reactivation token");

      // Reactivate the account
      (user as any).isDeletionRequested = false;
      (user as any).deletionRequestedAt = undefined;
      (user as any).deletionReason = undefined;
      (user as any).gracePeriodEndsAt = undefined;
      (user as any).canDelete = true;
      (user as any).verifyToken = undefined;
      (user as any).verifyTokenExpires = undefined;

      await user.save();

      res.json({
        status: "success",
        message: "Account reactivated successfully! You can now log in again.",
        data: {
          ok: true,
          deletionCount: (user as any).deletionCount || 0
        }
      });
    } catch (e) {
      console.error("Reactivation error:", e);
      next(e);
    }
  };

  resendVerify = async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body || {};
      const user = await User.findOne({ email });
      if (!user) throw new ValidationError("User not found");
      if ((user as any).emailVerified) return res.json({ status: "success", data: { ok: true } });
      const verifyToken = crypto.randomBytes(24).toString("hex");
      (user as any).verifyToken = verifyToken;
      (user as any).verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
      await user.save();
      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/verify?token=${verifyToken}`;
      if (process.env.SMTP_HOST) {
        await transporter.sendMail({ from: process.env.SMTP_FROM || "no-reply@example.com", to: email, subject: "Verify your email", text: `Verify: ${url}`, html: `<p>Verify your account:</p><p><a href="${url}">${url}</a></p>` });
      }
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  changePassword = async (req: any, res: any, next: any) => {
    try {
      const { email, oldPassword, newPassword } = req.body || {};
      // Accept either authenticated Bearer user id or email in body
      const bearer = req.headers.authorization;
      let user = null as any;
      if (bearer && bearer.startsWith("Bearer ")) {
        const token = bearer.split(" ")[1];
        if (/^[a-f\d]{24}$/i.test(token)) {
          user = await User.findById(token);
        }
      }
      if (!user && email) {
        user = await User.findOne({ email });
      }
      if (!user || !(user as any).passwordHash) throw new ValidationError("Invalid account");
      if (!newPassword || String(newPassword).length < 6) throw new ValidationError("New password too short");
      const ok = await bcrypt.compare(oldPassword || "", (user as any).passwordHash);
      if (!ok) {
        (user as any).passwordChangeFailedCount = ((user as any).passwordChangeFailedCount || 0) + 1;
        (user as any).passwordChangeLastFailedAt = new Date();
        await user.save();
        throw new ValidationError("Old password incorrect");
      }
      (user as any).passwordHash = await bcrypt.hash(String(newPassword || ""), 10);
      (user as any).passwordChangedAt = new Date();
      (user as any).passwordChangeCount = ((user as any).passwordChangeCount || 0) + 1;
      await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  forgotPassword = async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body || {};
      if (!email) throw new ValidationError("Email is required");
      const user = await User.findOne({ email: String(email).toLowerCase().trim() });
      // Always respond success to prevent email enumeration
      if (!user) return res.json({ status: "success", data: { ok: true } });
      const resetToken = crypto.randomBytes(24).toString("hex");
      (user as any).resetToken = resetToken;
      (user as any).resetTokenExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
      await user.save();
      const origin = process.env.APP_ORIGIN || "http://localhost:3000";
      const url = `${origin}/auth/reset?token=${resetToken}`;
      // Fire-and-forget email
      (async () => {
        try {
          if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com",
              to: email,
              subject: "Reset your password",
              text: `Reset link: ${url}`,
              html: `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`,
            });
          } else if (process.env.NODE_ENV !== 'production') {
            await sendViaEthereal(email, url);
          }
        } catch (e) {
          console.warn("Password reset email failed", e);
        }
      })();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };

  resetPassword = async (req: any, res: any, next: any) => {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) throw new ValidationError("Missing fields");
      if (String(newPassword).length < 6) throw new ValidationError("New password too short");
      const user = await User.findOne({ resetToken: String(token), resetTokenExpires: { $gt: new Date() } });
      if (!user) throw new ValidationError("Invalid or expired token");
      (user as any).passwordHash = await bcrypt.hash(String(newPassword), 10);
      (user as any).passwordChangedAt = new Date();
      (user as any).passwordChangeCount = ((user as any).passwordChangeCount || 0) + 1;
      (user as any).resetToken = undefined;
      (user as any).resetTokenExpires = undefined;
      await user.save();
      res.json({ status: "success", data: { ok: true } });
    } catch (e) { next(e); }
  };
}

export default new AuthController();


