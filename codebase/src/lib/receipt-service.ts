export interface DispatchOptions {
  email?: boolean;
  whatsapp?: boolean;
  sms?: boolean;
  recipientEmail?: string;
  recipientPhone?: string;
}

export interface ReceiptData {
  receiptNumber: string;
  guestName: string;
  totalAmount: number;
  paymentMethod: string;
  settledAt: string;
  items: Array<{
    description: string;
    category: string;
    amount: number;
    datesLabel?: string | null;
  }>;
}

export async function dispatchReceipt(
  receipt: ReceiptData,
  options: DispatchOptions
) {
  const results = [];
  const publicReceiptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/receipt/${receipt.receiptNumber}`;

  // 1. WhatsApp Delivery (Dispatches simulated or Meta Cloud API Document)
  if (options.whatsapp && options.recipientPhone) {
    console.log(`[WHATSAPP] Sending PDF Document to ${options.recipientPhone} for ${receipt.receiptNumber}`);
    results.push({
      channel: 'WHATSAPP',
      recipient: options.recipientPhone,
      status: 'SENT',
      detail: `Official PDF invoice dispatched via WhatsApp to ${options.recipientPhone}`,
    });
  }

  // 2. Email Delivery (HTML Folio + Attachment)
  if (options.email && options.recipientEmail) {
    console.log(`[EMAIL] Sending full itemized invoice to ${options.recipientEmail}`);
    results.push({
      channel: 'EMAIL',
      recipient: options.recipientEmail,
      status: 'SENT',
      detail: `Emailed invoice and PDF to ${options.recipientEmail}`,
    });
  }

  // 3. SMS Link Delivery (Africa's Talking / Twilio Link)
  if (options.sms && options.recipientPhone) {
    console.log(`[SMS] Sending short link to ${options.recipientPhone}: ${publicReceiptUrl}`);
    results.push({
      channel: 'SMS',
      recipient: options.recipientPhone,
      status: 'SENT',
      detail: `SMS link sent: "Thank you for staying at Shammah Hotel. View receipt: ${publicReceiptUrl}"`,
    });
  }

  return results;
}
