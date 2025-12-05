import { Order, Payout } from "../models";

export class PayoutService {
  constructor(private getRecipientCode: (vendorId: string) => Promise<string>, private providerTransfer: (vendorRecipient: string, amountKobo: number, reason: string) => Promise<{ transferId: string }>) {}

  async settleOrder(orderId: string, provider: "paystack" | "flutterwave") {
    const order: any = await Order.findById(orderId).lean();
    if (!order) throw new Error("Order not found");
    // For now we consider single seller order schema; extend later to lineItems
    const vendorId = String(order.seller);
    const amountGross = Math.round(order.totalPrice * 100); // convert to kobo if NGN stored in naira
    const feePlatform2p = Math.round(amountGross * 0.02);
    const amountNet = amountGross - feePlatform2p;
    const recipientCode = await this.getRecipientCode(vendorId);
    const transfer = await this.providerTransfer(recipientCode, amountNet, `Order ${orderId}`);
    await Payout.create({ orderId, vendorId, provider, recipientCode, amountGross, feePlatform2p, amountNet, transferId: transfer.transferId, status: "paid" });
    return { ok: true };
  }
}

