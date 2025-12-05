# OPay Public Key (PEM) – Legacy Notes

We now integrate OPay via Flutterwave hosted checkout by setting `payment_options: opay`. Direct OPay API keys and RSA public key setup are no longer required for pay‑ins in this project.

If you still need to manage OPay RSA keys for separate, legacy payout flows, keep these rules in mind:

- Public keys are safe to share; never commit private keys.
- Do not store private keys in the repository. Use a secure secret manager.

Example PEM format (public key):
```
-----BEGIN PUBLIC KEY-----
PASTE_YOUR_PUBLIC_KEY_BASE64_LINES_HERE
-----END PUBLIC KEY-----
```

For current pay‑in setup, configure Flutterwave instead:
```
FLW_BASE_URL=https://api.flutterwave.com
FLW_ACCESS_TOKEN=FLWSECK_TEST-xxxxxxxxx   # or FLW_SECRET_KEY
FLW_DEBUG=true
```

For payouts, we use Paystack transfers today. If we enable OPay disbursements in the future, we’ll add a dedicated doc with exact steps and environment variables.