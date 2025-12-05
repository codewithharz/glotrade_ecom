import crypto from "crypto";
import { IPaymentProvider, InitPaymentArgs, InitPaymentResult } from "../PaymentService";

export class PaystackProvider implements IPaymentProvider {
  private secret: string;
  private publicKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor(opts?: { secret?: string; publicKey?: string }) {
    this.secret = opts?.secret || process.env.PAYSTACK_SECRET_KEY || "";
    this.publicKey = opts?.publicKey || process.env.PAYSTACK_PUBLIC_KEY || "";
    if (!this.secret) {
      console.warn("PAYSTACK_SECRET_KEY not set");
    }
  }

  async initialize(args: InitPaymentArgs): Promise<InitPaymentResult> {
    const body = {
      amount: args.amount, // kobo
      email: args.customer.email,
      currency: args.currency || "NGN",
      callback_url: args.returnUrl,
      metadata: { orderId: args.orderId, ...args.metadata },
    };
    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!json.status) {
      throw new Error(json.message || "Failed to initialize Paystack");
    }
    return { url: json.data.authorization_url, reference: json.data.reference };
  }

  async verify(reference: string): Promise<{ paid: boolean; amount: number; currency: string }> {
    const res = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${this.secret}` },
    });
    const json: any = await res.json();
    if (!json.status) return { paid: false, amount: 0, currency: "NGN" };
    const paid = json.data.status === "success";
    return { paid, amount: json.data.amount, currency: json.data.currency };
  }

  async createRecipient(args: { name: string; accountNumber: string; bankCode: string; type?: string }) {
    const body = {
      type: args.type || "nuban",
      name: args.name,
      account_number: args.accountNumber,
      bank_code: args.bankCode,
      currency: "NGN",
    };
    const res = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!json.status) throw new Error(json.message || "Failed to create recipient");
    return { recipientCode: json.data.recipient_code };
  }

  async listBanks(): Promise<Array<{ name: string; code: string }>> {
    const res = await fetch(`${this.baseUrl}/bank`, { headers: { Authorization: `Bearer ${this.secret}` } });
    const json: any = await res.json();
    if (!json.status) throw new Error(json.message || "Failed to fetch banks");
    return (json.data || []).map((b: any) => ({ name: b.name, code: b.code }));
  }

  async resolveAccount(args: { accountNumber: string; bankCode: string }): Promise<{ accountName: string }> {
    const url = new URL(`${this.baseUrl}/bank/resolve`);
    url.searchParams.set("account_number", args.accountNumber);
    url.searchParams.set("bank_code", args.bankCode);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${this.secret}` } });
    const json: any = await res.json();
    if (!json.status) throw new Error(json.message || "Failed to resolve account");
    return { accountName: json.data.account_name };
  }

  async transfer(args: { recipientCode: string; amount: number; reason?: string }) {
    const body = {
      source: "balance",
      amount: args.amount,
      recipient: args.recipientCode,
      reason: args.reason || "Vendor payout",
    };
    const res = await fetch(`${this.baseUrl}/transfer`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!json.status) throw new Error(json.message || "Transfer failed");
    return { transferId: String(json.data?.transfer_code || json.data?.id || "") };
  }

  // helper for webhook signature verification
  static verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    return hash === signature;
  }
}

