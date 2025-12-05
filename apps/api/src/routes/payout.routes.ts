import { Router } from "express";
import { Order, User, Payout } from "../models";
import { PaystackProvider } from "../services/providers/PaystackProvider";

const router = Router();

router.post("/:orderId/settle", async (req: any, res: any, next: any) => {
  try {
    const { orderId } = req.params;
    const provider: "paystack" | "flutterwave" = (req.body?.provider || "paystack");

    const order: any = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ status: "error", message: "Order not found" });

    // Optional hold period before settlement (default 7 days)
    const force: boolean = !!req.body?.force;
    const holdDays = Number(process.env.SETTLEMENT_HOLD_DAYS || 7);
    if (!force) {
      if (order.status !== "delivered") {
        return res.status(400).json({ status: "error", message: "Order not delivered yet" });
      }
      const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
      if (deliveredAt) {
        const msHeld = Date.now() - deliveredAt.getTime();
        const needMs = holdDays * 24 * 60 * 60 * 1000;
        if (msHeld < needMs) {
          const remaining = Math.ceil((needMs - msHeld) / (24 * 60 * 60 * 1000));
          return res.status(400).json({ status: "error", message: `Hold period not reached (remaining ~${remaining} day(s))` });
        }
      }
    }

    // Aggregate by vendor using lineItems if present; fallback to single seller
    type VendorAgg = { amountGross: number };
    const vendorMap = new Map<string, VendorAgg>();
    if (Array.isArray(order.lineItems) && order.lineItems.length > 0) {
      for (const li of order.lineItems) {
        const key = String(li.vendorId);
        const amt = Math.round((li.unitPrice || 0) * (li.qty || 0) * 100);
        const agg = vendorMap.get(key) || { amountGross: 0 };
        agg.amountGross += amt;
        vendorMap.set(key, agg);
      }
    } else {
      const key = String(order.seller);
      const amt = Math.round((order.totalPrice || 0) * 100);
      vendorMap.set(key, { amountGross: amt });
    }

    const paystack = new PaystackProvider();
    const results: any[] = [];
    for (const [vendorId, agg] of vendorMap.entries()) {
      const fee = Math.round(agg.amountGross * 0.02);
      const net = agg.amountGross - fee;
      const user: any = await User.findById(vendorId).lean();
      const recipientCode = user?.paymentRecipients?.paystack;
      if (!recipientCode) {
        await Payout.create({ orderId, vendorId, provider, recipientCode: "", amountGross: agg.amountGross, feePlatform2p: fee, amountNet: net, status: "failed", lastError: "Missing recipient" });
        results.push({ vendorId, status: "failed", reason: "missing recipient" });
        continue;
      }
      try {
        const transfer = await paystack.transfer({ recipientCode, amount: net, reason: `Order ${orderId}` });
        await Payout.create({ orderId, vendorId, provider, recipientCode, amountGross: agg.amountGross, feePlatform2p: fee, amountNet: net, transferId: transfer.transferId, status: "paid" });
        results.push({ vendorId, status: "paid", transferId: transfer.transferId });
      } catch (e: any) {
        await Payout.create({ orderId, vendorId, provider, recipientCode, amountGross: agg.amountGross, feePlatform2p: fee, amountNet: net, status: "failed", lastError: e?.message || String(e) });
        results.push({ vendorId, status: "failed", reason: e?.message || String(e) });
      }
    }

    return res.json({ status: "success", data: { results } });
  } catch (err) {
    next(err);
  }
});

export default router;

