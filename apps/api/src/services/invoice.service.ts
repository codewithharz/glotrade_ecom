import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IOrder } from '../models/Order';
import { IUser } from '../types/user.types';

export class InvoiceService {
    private static readonly INVOICE_DIR = path.join(process.cwd(), 'public', 'invoices');

    constructor() {
        // Ensure invoice directory exists
        if (!fs.existsSync(InvoiceService.INVOICE_DIR)) {
            fs.mkdirSync(InvoiceService.INVOICE_DIR, { recursive: true });
        }
    }

    /**
     * Generate a unique invoice number
     * Format: INV-YYYY-RANDOM
     */
    private generateInvoiceNumber(): string {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `INV-${year}-${random}`;
    }

    /**
     * Generate PDF invoice for an order
     */
    async generateInvoice(order: IOrder, buyer: IUser, seller?: IUser): Promise<{ invoiceNumber: string; filePath: string; fileName: string }> {
        return new Promise((resolve, reject) => {
            try {
                const invoiceNumber = order.invoiceNumber || this.generateInvoiceNumber();
                const fileName = `${invoiceNumber}.pdf`;
                const filePath = path.join(InvoiceService.INVOICE_DIR, fileName);

                const doc = new PDFDocument({ margin: 50 });
                const writeStream = fs.createWriteStream(filePath);

                doc.pipe(writeStream);

                // --- Header ---
                doc
                    .fillColor('#444444')
                    .fontSize(20)
                    .text('Glotrade International', 50, 57)
                    .fontSize(10)
                    .text('123 Business Street', 200, 65, { align: 'right' })
                    .text('Lagos, Nigeria', 200, 80, { align: 'right' })
                    .moveDown();

                // --- Invoice Details ---
                doc
                    .fillColor('#000000')
                    .fontSize(20)
                    .text('INVOICE', 50, 160);

                doc
                    .fontSize(10)
                    .text(`Invoice Number: ${invoiceNumber}`, 50, 200)
                    .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
                    .text(`Order Number: ${order._id}`, 50, 230)
                    .text(`Total Amount: ${order.currency} ${order.totalPrice.toLocaleString()}`, 50, 245);

                if (order.purchaseOrderNumber) {
                    doc.text(`PO Number: ${order.purchaseOrderNumber}`, 50, 260);
                }

                doc.moveDown();

                // --- Bill To ---
                doc
                    .text('Bill To:', 300, 200)
                    .font('Helvetica-Bold')
                    .text(buyer.username || 'Valued Customer', 300, 215)
                    .font('Helvetica')
                    .text(buyer.email, 300, 230)
                    .text(order.shippingDetails?.address || '', 300, 245)
                    .text(`${order.shippingDetails?.city || ''}, ${order.shippingDetails?.country || ''}`, 300, 260)
                    .moveDown();

                // --- Table Header ---
                const tableTop = 330;
                doc
                    .font('Helvetica-Bold')
                    .text('Item', 50, tableTop)
                    .text('Quantity', 300, tableTop)
                    .text('Unit Price', 370, tableTop)
                    .text('Total', 470, tableTop, { align: 'right' });

                doc
                    .strokeColor('#aaaaaa')
                    .lineWidth(1)
                    .moveTo(50, tableTop + 15)
                    .lineTo(550, tableTop + 15)
                    .stroke();

                // --- Table Rows ---
                let i = 0;
                let position = tableTop + 30;

                if (order.lineItems && order.lineItems.length > 0) {
                    for (const item of order.lineItems) {
                        const title = item.productTitle || 'Product';
                        const qty = item.qty;
                        const price = item.unitPrice;
                        const total = qty * price;

                        doc
                            .font('Helvetica')
                            .fontSize(10)
                            .text(title.substring(0, 40) + (title.length > 40 ? '...' : ''), 50, position)
                            .text(qty.toString(), 300, position)
                            .text(`${order.currency} ${price.toLocaleString()}`, 370, position)
                            .text(`${order.currency} ${total.toLocaleString()}`, 470, position, { align: 'right' });

                        position += 20;
                        i++;
                    }
                } else {
                    // Fallback for single product orders (legacy structure)
                    doc
                        .font('Helvetica')
                        .fontSize(10)
                        .text('Product Order', 50, position)
                        .text(order.quantity?.toString() || '1', 300, position)
                        .text(`${order.currency} ${order.totalPrice.toLocaleString()}`, 370, position)
                        .text(`${order.currency} ${order.totalPrice.toLocaleString()}`, 470, position, { align: 'right' });
                    position += 20;
                }

                doc
                    .strokeColor('#aaaaaa')
                    .lineWidth(1)
                    .moveTo(50, position + 10)
                    .lineTo(550, position + 10)
                    .stroke();

                // --- Total ---
                const totalPosition = position + 30;
                doc
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Total:', 370, totalPosition)
                    .text(`${order.currency} ${order.totalPrice.toLocaleString()}`, 470, totalPosition, { align: 'right' });

                // --- Footer ---
                doc
                    .fontSize(10)
                    .text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

                doc.end();

                writeStream.on('finish', () => {
                    resolve({ invoiceNumber, filePath, fileName });
                });

                writeStream.on('error', (err) => {
                    reject(err);
                });

            } catch (error) {
                reject(error);
            }
        });
    }
}
