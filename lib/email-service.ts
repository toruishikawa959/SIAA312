/**
 * Email Service using SendGrid
 * For development: Uses console.log to simulate emails
 * For production: Uses SendGrid API
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html } = options

  // Development mode: Log emails instead of sending
  if (process.env.NODE_ENV === "development" || !process.env.SENDGRID_API_KEY) {
    console.log("📧 [EMAIL - DEV MODE]")
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${html}\n`)
    return
  }

  // Production: Send via SendGrid
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@sierbosten.com",
          name: "Sierbosten Literature Collective",
        },
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`)
    }

    console.log(`✅ Email sent to ${to}`)
  } catch (error) {
    console.error("❌ Failed to send email:", error)
    throw error
  }
}

/**
 * Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(data: {
  email: string
  name: string
  orderId: string
  items: Array<{ title: string; quantity: number; price: number }>
  totalAmount: number
  deliveryMethod: string
  address?: string
}): Promise<void> {
  const { email, name, orderId, items, totalAmount, deliveryMethod, address } = data

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₱${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("")

  const pickupInfo =
    deliveryMethod === "pickup"
      ? `
    <h3 style="color: #8b7355; margin-top: 24px;">📍 Pickup Instructions</h3>
    <p>Your order will be ready for pickup at our store within 2-3 business days.</p>
    <p><strong>Pickup Location:</strong><br/>
    Sierbosten Literature Collective<br/>
    Portland, Oregon<br/>
    Phone: +1 (555) 123-4567</p>
  `
      : `
    <h3 style="color: #8b7355; margin-top: 24px;">🚚 Shipping Address</h3>
    <p>${address || "Will be confirmed by our team"}</p>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b7355 0%, #a89968 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f7f4; padding: 30px; margin: 20px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #d4af37; color: white; padding: 12px; text-align: left; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .button { display: inline-block; background: #8b7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed!</h1>
          <p>Thank you for your purchase, ${name}!</p>
        </div>

        <div class="content">
          <h2 style="color: #8b7355;">Order Details</h2>
          <p><strong>Order Number:</strong> ${orderId}</p>

          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="background: #fff; font-weight: bold;">
                <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">₱${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #8b7355;">💳 Payment Status</h3>
          <p><strong>✓ Payment Confirmed</strong></p>

          ${pickupInfo}

          <h3 style="color: #8b7355;">What's Next?</h3>
          <ul>
            <li>Your order is confirmed and being prepared</li>
            <li>We'll send you an update when it's ready</li>
            <li>${deliveryMethod === "pickup" ? "Visit our store to pick up your order" : "Track your shipment with the provided tracking number"}</li>
          </ul>

          <p style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/orders/${orderId}" class="button">View Order Details</a>
          </p>
        </div>

        <div class="footer">
          <p>Sierbosten Literature Collective</p>
          <p>hello@sierbosten.com | +1 (555) 123-4567</p>
          <p>© 2025 Sierbosten. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderId}`,
    html,
  })
}

/**
 * Order Status Update Email (for admin/staff notifications)
 */
export async function sendOrderStatusUpdateEmail(data: {
  email: string
  name: string
  orderId: string
  status: string
  message: string
  trackingUrl?: string
}): Promise<void> {
  const { email, name, orderId, status, message, trackingUrl } = data

  const statusMessages: Record<string, { icon: string; title: string }> = {
    confirmed: { icon: "✓", title: "Order Confirmed" },
    preparing: { icon: "📦", title: "Being Prepared" },
    ready_for_pickup: { icon: "📍", title: "Ready for Pickup" },
    shipped: { icon: "🚚", title: "On the Way" },
    delivered: { icon: "✓", title: "Delivered" },
    cancelled: { icon: "✗", title: "Cancelled" },
  }

  const statusInfo = statusMessages[status] || { icon: "ℹ️", title: "Update" }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #f0f8ff; border-left: 4px solid #8b7355; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; background: #8b7355; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${statusInfo.icon} ${statusInfo.title}</h2>
        <p>Hi ${name},</p>

        <div class="alert">
          <p><strong>Order #${orderId}</strong></p>
          <p>${message}</p>
        </div>

        ${trackingUrl ? `<p><a href="${trackingUrl}" class="button">Track Order</a></p>` : ""}

        <p style="color: #666; font-size: 14px;">
          Questions? Contact us at hello@sierbosten.com
        </p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `${statusInfo.title} - Order #${orderId}`,
    html,
  })
}

/**
 * Internal Staff Notification - New Order Alert
 */
export async function sendStaffOrderAlert(data: {
  email: string
  orderId: string
  items: Array<{ title: string; quantity: number }>
  deliveryMethod: string
  customerName: string
  customerPhone: string
}): Promise<void> {
  const { email, orderId, items, deliveryMethod, customerName, customerPhone } = data

  const itemsHtml = items
    .map((item) => `<li>${item.title} x${item.quantity}</li>`)
    .join("")

  const html = `
    <h2>📋 New Order Received</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Phone:</strong> ${customerPhone}</p>
    <p><strong>Delivery Method:</strong> ${deliveryMethod === "pickup" ? "Store Pickup" : "Delivery"}</p>
    <h3>Items:</h3>
    <ul>${itemsHtml}</ul>
    <p><a href="http://localhost:3000/admin/orders/${orderId}" style="background: #8b7355; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin</a></p>
  `

  await sendEmail({
    to: email,
    subject: `[ALERT] New Order - ${orderId}`,
    html,
  })
}
