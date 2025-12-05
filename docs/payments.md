## Payments Integration Plan (Paystack + Flutterwave) with Escrow and 2% Platform Fee

This guide documents how we integrate Paystack and Flutterwave (using Flutterwave hosted checkout with `payment_options: opay`), collect customer payments into the platform account (escrow), and settle vendors after delivery with a 2% platform fee. It also covers mixed‑vendor orders.

### Goals
- Collect payments via Paystack and Flutterwave (test and live keys)
- Escrow funds on platform until delivery or end of hold period
- Deduct a 2% platform fee on successful delivery
- Handle mixed‑vendor orders (split settlement per vendor)
- Webhook‑driven, idempotent, auditable

---

### Data model additions (MongoDB)

1) Payment
```ts
// payments collection
{
  _id,
  orderId: ObjectId,
  provider: 'paystack' | 'flutterwave',
  reference: string,        // provider reference (unique)
  amount: number,           // kobo (integer)
  currency: 'NGN',
  status: 'pending' | 'paid' | 'failed',
  settled: boolean,         // vendor payout done
  metadata: any,            // cart snapshot, customer, provider session
  rawWebhook?: any,         // last webhook payload
  createdAt, updatedAt
}
```

2) Payout
```ts
// payouts collection
{
  _id,
  orderId: ObjectId,
  vendorId: ObjectId,
  provider: 'paystack' | 'flutterwave',
  recipientCode: string,    // provider recipient id
  amountGross: number,      // kobo
  feePlatform2p: number,    // kobo
  amountNet: number,        // kobo
  transferId?: string,      // provider transfer id
  status: 'queued' | 'processing' | 'paid' | 'failed',
  attempts: number,
  lastError?: string,
  createdAt, updatedAt
}
```

3) Order (extend)
```ts
paymentStatus: 'unpaid' | 'paid' | 'refunded'
payoutStatus:  'none' | 'pending' | 'settled' | 'partial' | 'failed'
deliveredAt?: Date
lineItems: [{ productId, vendorId, qty, unitPrice, currency }] // added
```

---

### Service interfaces

`IPaymentProvider`
```ts
initialize(args): Promise<{ authorizationUrl: string; reference: string }>
verify(reference: string): Promise<{ paid: boolean; amount: number; currency: string }>
// For payouts we use provider-specific helpers (e.g., Paystack transfer APIs)
```

Providers implemented: `PaystackProvider` (init/verify/recipient/transfer), `FlutterwaveProvider` (hosted checkout with OPay option using `payment_options: opay`, init/verify).

---

### API endpoints

```http
POST  /api/v1/payments/init
GET   /api/v1/payments/verify?provider=paystack|flutterwave&reference=...
POST  /api/v1/payments/webhook/paystack   (raw body, signature: x-paystack-signature)
POST  /api/v1/vendors/recipient           (create/store provider recipient for a vendor)
POST  /api/v1/payouts/:orderId/settle     (trigger settlement once delivered)
```

Request/response sketch
```json
// POST /api/v1/payments/init
{
  "orderId": "...",
  "provider": "paystack",
  "returnUrl": "https://app.example.com/checkout/callback"
}

// =>
{
  "url": "https://checkout.paystack.com/....",
  "reference": "psk_..."
}
```

---

### Escrow + 2% fee logic

1) Customer pays → Provider confirms → `Payment.status=paid`, `Order.paymentStatus=paid`, `Order.payoutStatus=pending`.

2) On delivery confirmation (or after hold period) run settlement:
```ts
for each vendor in order.lineItems:
  amountGross = sum(unitPrice*qty for that vendor)
  feePlatform2p = Math.round(amountGross * 0.02)
  amountNet = amountGross - feePlatform2p
  create Payout(vendor, amountGross, feePlatform2p, amountNet)
  provider.payout(recipientCode, amountNet)
```

3) After all vendor transfers succeed → `Order.payoutStatus=settled`. On partial failures → `partial` and enqueue retries.

Rationale: we avoid immediate provider split so funds stay with us until delivery (escrow behavior), then we disburse.

---

### Mixed‑vendor orders (YES, supported)

- The order already carries `lineItems.vendorId`. During settlement we aggregate by `vendorId` and create one transfer per vendor.
- Vendors must have a saved provider recipient (`recipientCode`). We expose `/vendors/recipient` to create and store it once.
- If a vendor is missing recipient, we hold their share and mark payout as `failed` with retry once onboarding is completed.

---

### Paystack specifics

- Initialize: `POST /transaction/initialize` (amount in kobo), include `metadata.orderId`, `callback_url`.
- Verify: `GET /transaction/verify/:reference`.
- Webhook: validate `x-paystack-signature` HMAC SHA512 of raw body using `PAYSTACK_WEBHOOK_SECRET`.
- Recipient: `POST /transferrecipient`. Payout: `POST /transfer` (amount in kobo).

Environment
```
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
```

### Flutterwave specifics (OPay via hosted checkout)

- Base host: `https://api.flutterwave.com/v3` (Bearer auth)
- Initialize: `POST /payments` with body `{ tx_ref, amount, currency, redirect_url, payment_options: "opay", customer, meta }`
- Verify: `GET /transactions/verify_by_reference?tx_ref=...`

Environment
```
FLW_BASE_URL=https://api.flutterwave.com
FLW_ACCESS_TOKEN=FLWSECK_TEST-xxxxxxxxx   # or FLW_SECRET_KEY
FLW_DEBUG=true
```

### Common configuration
```
PAYMENTS_MODE=test        # or live
PLATFORM_FEE_BPS=200      # 2%
SETTLEMENT_HOLD_DAYS=7    # 7 or 14 are realistic options
BASE_URL_API=https://api.example.com
```

---

### Idempotency + security
- Store `Payment.reference` as unique; ignore duplicate webhooks.
- Keep `rawWebhook` for auditing; never trust client callbacks without server‑side verify.
- Parse raw body for HMAC; do not JSON.parse before verifying.
- Use integer amounts (kobo) throughout.

---

### Implementation checklist

1) Models: Payment, Payout; extend Order
2) Provider adapters: PaystackProvider, FlutterwaveProvider
3) Routes + controllers for init, verify, Paystack webhook, vendor recipient, settle
4) PaymentService: orchestrate init/verify, write Payment (added)
5) PayoutService: aggregate by vendor, compute 2% fee, trigger transfers (added basic route `/payouts/:orderId/settle` using Paystack)
6) Cron/queue worker: retry failed payouts, auto‑settle after hold period
7) Frontend: provider selection, call `/payments/init`, handle redirect + `/payments/verify`

---

### Test plan (sandbox)
- Create two vendors with different banks; save recipients
- Place mixed‑vendor order; pay with Paystack test card or Flutterwave hosted OPay (both init/verify implemented)
- Receive webhook → Payment=paid
- Mark order delivered → call `/payouts/:orderId/settle`
- Verify two provider transfers (net after 2% fee)
- Simulate payout failure → observe retry/backoff

---

### Open questions
- Hold period (days) and dispute policy
- Non‑NGN currencies (future)
- Refunds: refund to original method and reverse payouts (if already paid)

