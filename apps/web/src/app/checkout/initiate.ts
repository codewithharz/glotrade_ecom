import { API_BASE_URL, getAuthHeader } from "@/utils/api";

export async function initiatePayment(payload: any) {
  const res = await fetch(new URL("/api/v1/payments/init", API_BASE_URL).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`init payment failed: ${text}`);
  }
  return res.json();
}

export async function createOrder(payload: any) {
  const res = await fetch(new URL("/api/v1/orders", API_BASE_URL).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`create order failed: ${text}`);
  }
  return res.json();
}

