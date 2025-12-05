export class FlutterwaveBanking {
  private baseUrl = process.env.FLW_BASE_URL || "https://api.flutterwave.com/v3";
  private secret = process.env.FLW_SECRET_KEY || process.env.FLW_ACCESS_TOKEN || "";

  constructor(secret?: string) {
    if (secret) this.secret = secret;
    if (!this.secret) {
      console.warn("FLW_SECRET_KEY not set");
    }
  }

  async listBanks(countryCode: string = "NG"): Promise<Array<{ name: string; code: string }>> {
    try {
      const res = await fetch(`${this.baseUrl}/banks/${encodeURIComponent(countryCode)}`, {
        headers: { Authorization: `Bearer ${this.secret}` },
      });
      
      // Check if the response is not ok
      if (!res.ok) {
        console.warn(`Flutterwave banks API returned ${res.status} for country ${countryCode}`);
        // Return empty array for unsupported countries instead of throwing error
        return [];
      }
      
      const json: any = await res.json();
      if (!json || json.status !== "success") {
        console.warn(`Flutterwave banks API failed for country ${countryCode}:`, json?.message);
        return [];
      }
      return (json.data || []).map((b: any) => ({ name: b.name, code: String(b.code) }));
    } catch (error) {
      console.warn(`Flutterwave banks API error for country ${countryCode}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async resolveAccount(args: { accountNumber: string; bankCode: string }): Promise<{ accountName: string }> {
    const body = { account_number: args.accountNumber, account_bank: args.bankCode };
    const res = await fetch(`${this.baseUrl}/accounts/resolve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!json || json.status !== "success") {
      throw new Error(json?.message || "Failed to resolve account");
    }
    return { accountName: json.data?.account_name };
  }
}

import crypto from "crypto";
import { IPaymentProvider, InitPaymentArgs, InitPaymentResult } from "../PaymentService";

interface FlutterwaveInitPaymentResponse {
  status: string;
  message?: string;
  data?: {
    link?: string;
    id?: number;
  };
}

interface FlutterwaveVerifyByRefResponse {
  status: string;
  message?: string;
  data?: {
    id: number;
    tx_ref: string;
    status: string; // successful, failed, pending
    currency: string;
    amount: number;
  };
}

export class FlutterwaveProvider implements IPaymentProvider {
  private baseUrl: string;
  private accessToken: string;

  constructor(opts?: { baseUrl?: string; accessToken?: string }) {
    const configured = opts?.baseUrl || process.env.FLW_BASE_URL || "https://api.flutterwave.com";
    // Ensure we target v3 API
    this.baseUrl = configured.endsWith("/v3") ? configured : `${configured.replace(/\/$/, "")}/v3`;
    this.accessToken = (
      opts?.accessToken || process.env.FLW_ACCESS_TOKEN || process.env.FLW_SECRET_KEY || ""
    ).trim();
    if (!this.accessToken) {
      console.warn(
        "Flutterwave secret not set. Set FLW_ACCESS_TOKEN (or FLW_SECRET_KEY) to your Flutterwave Secret Key, e.g., FLWSECK_TEST-..."
      );
    }

    if (process.env.FLW_DEBUG === "true") {
      const prefix = this.accessToken ? this.accessToken.slice(0, 8) : "";
      const suffix = this.accessToken ? this.accessToken.slice(-4) : "";
      console.info(
        `[FLW] baseUrl=${this.baseUrl} token=${this.accessToken ? `${prefix}...${suffix}` : "<missing>"}`
      );
    }
  }

  private commonHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Trace-Id": crypto.randomUUID(),
      "X-Idempotency-Key": crypto.randomUUID(),
    } as Record<string, string>;
  }

  async initialize(args: InitPaymentArgs): Promise<InitPaymentResult> {
    if (!this.accessToken) {
      throw new Error(
        "Flutterwave access token missing. Set FLW_ACCESS_TOKEN to your Flutterwave Secret Key (e.g., FLWSECK_TEST-...)"
      );
    }

    // Initialize payment via Flutterwave hosted page using OPay as the payment option
    const txRef = `flwop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const amountInMajorUnit = Math.round((args.amount || 0) / 100);
    const initBody = {
      tx_ref: txRef,
      amount: amountInMajorUnit,
      currency: args.currency || "NGN",
      redirect_url: args.returnUrl,
      payment_options: "opay",
      customer: {
        email: args.customer.email,
        name: args.customer.name || "Customer",
        phonenumber: (args.customer as any).phone || (args.customer as any).phoneNumber || undefined,
      },
      meta: { orderId: args.orderId, provider: "flutterwave" },
    };
    const payRes = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: this.commonHeaders(),
      body: JSON.stringify(initBody),
    });
    if (!payRes.ok) {
      const errText = await payRes.text().catch(() => "");
      throw new Error(`Flutterwave init payment failed (${payRes.status}): ${errText || payRes.statusText}`);
    }
    const payJson = (await payRes.json().catch(() => ({}))) as unknown as FlutterwaveInitPaymentResponse;
    const redirectUrl = payJson?.data?.link;
    if (payJson?.status !== "success" || !redirectUrl) {
      throw new Error(payJson?.message || "Flutterwave: failed to initialize payment");
    }
    // Use tx_ref for verification later
    return { url: redirectUrl, reference: txRef };
  }

  async verify(reference: string): Promise<{ paid: boolean; amount: number; currency: string }> {
    if (!this.accessToken) throw new Error("Flutterwave not configured: FLW_ACCESS_TOKEN missing");
    const res = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`, {
      headers: this.commonHeaders(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (process.env.FLW_DEBUG === "true") {
        console.error(`[FLW] verify_by_reference failed: status=${res.status} body=${txt}`);
      }
      return { paid: false, amount: 0, currency: "NGN" };
    }
    const json = (await res.json().catch(() => ({}))) as unknown as FlutterwaveVerifyByRefResponse;
    if (process.env.FLW_DEBUG === "true") {
      try {
        console.info(`[FLW] verify_by_reference json: ${JSON.stringify(json)}`);
      } catch {}
    }
    if (json?.status !== "success" || !json?.data) return { paid: false, amount: 0, currency: "NGN" };
    const normalized = String(json.data.status || "").toLowerCase();
    const paid = ["successful", "success", "completed", "succeeded"].includes(normalized);
    return { paid, amount: json.data.amount, currency: json.data.currency };
  }
}

