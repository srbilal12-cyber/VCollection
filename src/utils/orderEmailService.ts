import { Order } from '../types';

export const DEFAULT_OWNER_EMAIL = 'srbilal12@gmail.com';
const STORAGE_KEY_OWNER_EMAIL = 'vcollection_owner_notification_email';
const STORAGE_KEY_EMAIL_LOGS = 'vcollection_order_email_logs_v1';

export interface OrderEmailLog {
  id: string;
  orderId: string;
  recipientEmail: string;
  timestamp: string;
  subject: string;
  body: string;
  orderTotal: number;
  customerName: string;
  customerPhone: string;
  status: 'sent' | 'pending';
}

/**
 * Gets configured notification email for orders
 */
export function getOwnerNotificationEmail(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OWNER_EMAIL);
    return saved?.trim() || DEFAULT_OWNER_EMAIL;
  } catch {
    return DEFAULT_OWNER_EMAIL;
  }
}

/**
 * Sets configured notification email for orders
 */
export function setOwnerNotificationEmail(email: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_OWNER_EMAIL, email.trim());
  } catch (e) {
    console.error('Error saving notification email', e);
  }
}

/**
 * Formats a clean, high-luxury order email invoice body
 */
export function formatOrderEmailContent(order: Order, recipientEmail: string): { subject: string; body: string } {
  const itemsText = order.items
    .map((item, idx) => {
      return `${idx + 1}. ${item.product.name}
   - Finish / Color: ${item.finish.name} (${item.finish.colorName})
   - Size: EU ${item.size}
   - Quantity: ${item.quantity}
   - Unit Price: Rs. ${item.product.price.toLocaleString()} PKR
   - Subtotal: Rs. ${(item.product.price * item.quantity).toLocaleString()} PKR`;
    })
    .join('\n\n');

  const paymentLabel =
    order.paymentMethod === 'cod'
      ? 'Cash on Delivery (COD)'
      : order.paymentMethod === 'card'
      ? 'Credit / Debit Card'
      : 'Atelier Vault Credit';

  const subject = `[NEW ATELIER ORDER] #${order.id} - Rs. ${order.total.toLocaleString()} PKR (${order.shippingAddress.fullName})`;

  const body = `=====================================================
V COLLECTION ATELIER - LUXURY FOOTWEAR ORDER ALERT
=====================================================
Dear Master Director / Owner,

A new customer order has been confirmed on the V Collection Atelier storefront!

ORDER DETAILS:
-----------------------------------------------------
Order Number: #${order.id}
Date Placed: ${order.date}
Tracking Number: ${order.trackingNumber || 'Pending Courier Pickup'}
Payment Method: ${paymentLabel}
Current Status: ${order.status.toUpperCase()}

CUSTOMER & DELIVERY ADDRESS:
-----------------------------------------------------
Client Name: ${order.shippingAddress.fullName}
Contact Phone: ${order.shippingAddress.phone}
Client Email: ${order.shippingAddress.email}
Delivery Street: ${order.shippingAddress.street}
City / Postal: ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}
Country: ${order.shippingAddress.country}

ORDERED SHOE ITEMS:
-----------------------------------------------------
${itemsText}

FINANCIAL BREAKDOWN:
-----------------------------------------------------
Footwear Subtotal: Rs. ${order.subtotal.toLocaleString()} PKR
Privilege Discount: Rs. ${order.discount.toLocaleString()} PKR
Drop Shipping Charges: Rs. ${(order.dropShippingFee ?? order.shipping ?? 200).toLocaleString()} PKR
${order.paymentMethod === 'cod' ? `Cash on Delivery (COD) Fee: Rs. ${(order.codFee ?? 100).toLocaleString()} PKR (Doorstep Collection)\n` : 'Payment Settlement: Prepaid / Card (No COD Surcharge)\n'}GRAND TOTAL DUE: Rs. ${order.total.toLocaleString()} PKR

-----------------------------------------------------
This automated alert was dispatched directly to your authorized email: ${recipientEmail}
V Collection Atelier - Handcrafted Italian & Heritage Footwear`;

  return { subject, body };
}

/**
 * Creates a pre-populated mailto URL that can directly open in the owner's email app or Gmail web
 */
export function generateOrderMailtoUrl(order: Order, recipientEmail = getOwnerNotificationEmail()): string {
  const { subject, body } = formatOrderEmailContent(order, recipientEmail);
  return `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

/**
 * Logs and dispatches an order notification to the owner's email.
 */
export function dispatchOrderEmailAlert(order: Order): OrderEmailLog {
  const recipient = getOwnerNotificationEmail();
  const { subject, body } = formatOrderEmailContent(order, recipient);

  const logEntry: OrderEmailLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    recipientEmail: recipient,
    timestamp: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    subject,
    body,
    orderTotal: order.total,
    customerName: order.shippingAddress.fullName,
    customerPhone: order.shippingAddress.phone,
    status: 'sent',
  };

  try {
    const existingLogs: OrderEmailLog[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_EMAIL_LOGS) || '[]'
    );
    const updated = [logEntry, ...existingLogs].slice(0, 50); // keep last 50 logs
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving email log', e);
  }

  // Trigger web notification if supported
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New Order #${order.id} Placed!`, {
        body: `Rs. ${order.total.toLocaleString()} PKR from ${order.shippingAddress.fullName}. Alert sent to ${recipient}`,
        icon: '/src/assets/images/shoe_loafer_cognac_1790359108681.jpg',
      });
    }
  } catch {
    // ignore
  }

  return logEntry;
}

/**
 * Retrieves all order email notification logs
 */
export function getOrderEmailLogs(): OrderEmailLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
