// // src/services/EscrowService.ts
// import { BaseService } from "./BaseService";
// import { TokenService } from "./TokenService";
// import { OrderService } from "./OrderService";
// import { ValidationError, UnauthorizedError } from "../utils/errors";

// interface EscrowTransaction {
//   orderId: string;
//   buyerAddress: string;
//   sellerAddress: string;
//   amount: number;
//   releaseDate?: Date;
//   status: "pending" | "locked" | "released" | "refunded" | "disputed";
//   releaseTrigger: "automatic" | "manual";
// }

// export class EscrowService {
//   private tokenService: TokenService;
//   private orderService: OrderService;

//   constructor() {
//     this.tokenService = new TokenService();
//     this.orderService = new OrderService();
//   }

//   async createEscrow(
//     orderId: string,
//     buyerAddress: string,
//     sellerAddress: string,
//     amount: number,
//     holdPeriodDays: number = 3
//   ): Promise<EscrowTransaction> {
//     // Verify buyer has sufficient balance
//     const buyerBalance = await this.tokenService.getTokenBalance(buyerAddress);
//     if (buyerBalance.available < amount) {
//       throw new ValidationError("Insufficient balance for escrow");
//     }

//     // Lock tokens in escrow
//     await this.tokenService.stake(buyerAddress, amount);

//     const releaseDate = new Date();
//     releaseDate.setDate(releaseDate.getDate() + holdPeriodDays);

//     return {
//       orderId,
//       buyerAddress,
//       sellerAddress,
//       amount,
//       releaseDate,
//       status: "locked",
//       releaseTrigger: "manual",
//     };
//   }

//   async releaseEscrow(
//     escrowTransaction: EscrowTransaction,
//     initiator: string
//   ): Promise<void> {
//     // Verify initiator is authorized
//     if (initiator !== escrowTransaction.buyerAddress) {
//       throw new UnauthorizedError("Only buyer can release escrow");
//     }

//     if (escrowTransaction.status !== "locked") {
//       throw new ValidationError("Escrow is not in locked state");
//     }

//     // Transfer tokens to seller
//     await this.tokenService.delegate(
//       escrowTransaction.buyerAddress,
//       escrowTransaction.sellerAddress,
//       escrowTransaction.amount
//     );

//     escrowTransaction.status = "released";

//     // Update order status
//     await this.orderService.updateOrderStatus(
//       escrowTransaction.orderId,
//       "completed",
//       initiator
//     );
//   }

//   async refundEscrow(
//     escrowTransaction: EscrowTransaction,
//     initiator: string
//   ): Promise<void> {
//     // Verify initiator is authorized admin or seller
//     if (
//       initiator !== escrowTransaction.sellerAddress &&
//       !(await this.isAdmin(initiator))
//     ) {
//       throw new UnauthorizedError("Unauthorized to refund escrow");
//     }

//     if (escrowTransaction.status !== "locked") {
//       throw new ValidationError("Escrow is not in locked state");
//     }

//     // Return tokens to buyer
//     await this.tokenService.unstake(
//       escrowTransaction.buyerAddress,
//       escrowTransaction.amount
//     );

//     escrowTransaction.status = "refunded";

//     // Update order status
//     await this.orderService.updateOrderStatus(
//       escrowTransaction.orderId,
//       "cancelled",
//       initiator
//     );
//   }

//   async handleDispute(
//     escrowTransaction: EscrowTransaction,
//     resolution: "buyer" | "seller" | "split",
//     adminAddress: string
//   ): Promise<void> {
//     // Verify admin
//     if (!(await this.isAdmin(adminAddress))) {
//       throw new UnauthorizedError("Only admin can resolve disputes");
//     }

//     if (escrowTransaction.status !== "disputed") {
//       throw new ValidationError("Escrow is not in disputed state");
//     }

//     switch (resolution) {
//       case "buyer":
//         await this.refundEscrow(escrowTransaction, adminAddress);
//         break;
//       case "seller":
//         await this.releaseEscrow(escrowTransaction, adminAddress);
//         break;
//       case "split":
//         const halfAmount = escrowTransaction.amount / 2;
//         // Split the amount between buyer and seller
//         await Promise.all([
//           this.tokenService.delegate(
//             escrowTransaction.buyerAddress,
//             escrowTransaction.sellerAddress,
//             halfAmount
//           ),
//           this.tokenService.unstake(escrowTransaction.buyerAddress, halfAmount),
//         ]);
//         break;
//     }

//     escrowTransaction.status = "resolved";
//   }

//   async initiateDispute(
//     escrowTransaction: EscrowTransaction,
//     initiator: string
//   ): Promise<void> {
//     if (
//       initiator !== escrowTransaction.buyerAddress &&
//       initiator !== escrowTransaction.sellerAddress
//     ) {
//       throw new UnauthorizedError("Unauthorized to initiate dispute");
//     }

//     if (escrowTransaction.status !== "locked") {
//       throw new ValidationError("Can only dispute locked escrow");
//     }

//     escrowTransaction.status = "disputed";

//     // Create dispute record
//     await this.orderService.createDispute(
//       escrowTransaction.orderId,
//       initiator,
//       {
//         reason: "Escrow dispute",
//         description: `Dispute initiated by ${initiator}`,
//       }
//     );
//   }

//   private async isAdmin(address: string): Promise<boolean> {
//     // Implement admin check logic
//     return true; // Placeholder
//   }
// }
