# PayMongo Webhook Setup Guide

## Overview
Your bookstore is now set up to receive real-time payment updates from PayMongo through webhooks.

## Webhook Endpoint
Your webhook endpoint is located at:
```
https://yourdomain.com/api/webhooks/paymongo
```

## PayMongo Dashboard Setup

### Steps to Register Your Webhook:

1. **Go to PayMongo Dashboard**
   - Visit: https://dashboard.paymongo.com

2. **Navigate to Webhooks**
   - Settings → Webhooks (or Developers section)

3. **Create New Webhook**
   - Click "Add Endpoint"

4. **Configure Endpoint**
   - **URL:** `https://yourdomain.com/api/webhooks/paymongo`
   - **Events to subscribe to:**
     - ✅ `payment.paid` - Payment successful
     - ✅ `payment.failed` - Payment failed
     - ✅ `qrph.expired` - QR code expired (30 min timeout)

5. **Save Webhook**
   - PayMongo will send a test event to verify the endpoint works

## For Local Development Testing

During development on `http://localhost:3001`, use a tunneling service:

### Option A: ngrok (Recommended)
```bash
# Download from: https://ngrok.com/download
ngrok http 3001
```

This gives you a public URL like: `https://abc123.ngrok.io`

Then register webhook as:
```
https://abc123.ngrok.io/api/webhooks/paymongo
```

### Option B: expose
```bash
npm install -g expose
expose 3001
```

## Webhook Events Handled

### 1. `payment.paid`
- **Trigger:** Payment completed successfully via QR Ph
- **Action:** Updates order status to "paid"
- **Fields Updated:**
  - `paymentStatus: "paid"`
  - `status: "confirmed"`
  - `paidAt: timestamp`
  - `paymentId: paymentId`

**Example Response:**
```json
{
  "data": {
    "id": "evt_123",
    "type": "event",
    "attributes": {
      "type": "payment.paid",
      "data": {
        "id": "pay_Haq1UQKf4p7b4cDRcxRrnF8j",
        "attributes": {
          "status": "paid",
          "amount": 10000,
          "payment_intent_id": "pi_EXpLFBparajBVHFiU78NKdY3"
        }
      }
    }
  }
}
```

### 2. `payment.failed`
- **Trigger:** Payment attempt failed
- **Action:** Updates order status to "failed"
- **Fields Updated:**
  - `paymentStatus: "failed"`
  - `status: "payment_failed"`
  - `paymentFailedReason: failedMessage`
  - `paymentFailedCode: failedCode`
  - `failedAt: timestamp`

**Example Response:**
```json
{
  "data": {
    "id": "evt_123",
    "type": "event",
    "attributes": {
      "type": "payment.failed",
      "data": {
        "id": "pay_kVjqqErX7nJatqtdJnTGdXs5",
        "attributes": {
          "status": "failed",
          "failed_code": "RJCT",
          "failed_message": "Unknown processing error.",
          "payment_intent_id": "pi_cufYwN1b9mzrvKpXXQLknRiB"
        }
      }
    }
  }
}
```

### 3. `qrph.expired`
- **Trigger:** QR code not scanned/paid within 30 minutes
- **Action:** Updates order status to "expired"
- **Fields Updated:**
  - `paymentStatus: "expired"`
  - `status: "qrcode_expired"`
  - `qrCodeExpiredAt: timestamp`

**Example Response:**
```json
{
  "data": {
    "id": "evt_Y4BLNd6MhCDc4SYCWngSAq2Y",
    "type": "event",
    "attributes": {
      "type": "qrph.expired",
      "data": {
        "id": "qrph_Dbzwvb5X44BSJc4MgLpZXFaF",
        "attributes": {
          "payment_intent_id": "pi_3z1Va2HEd1cfjAWzx6N7Cppm"
        }
      }
    }
  }
}
```

## Order Status States

| Status | Meaning | Action |
|--------|---------|--------|
| `pending` | Order created, waiting for QR code generation | Show payment page |
| `confirmed` | Payment successful | Show success page, process order |
| `payment_failed` | Payment attempt failed | Allow retry |
| `qrcode_expired` | QR code expired (30 min) | Generate new QR code |

## Testing Webhooks Locally

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Set up ngrok tunnel:**
   ```bash
   ngrok http 3001
   ```

3. **Register webhook in PayMongo dashboard:**
   - Use the ngrok URL: `https://abc123.ngrok.io/api/webhooks/paymongo`

4. **Test payment flow:**
   - Complete checkout and generate QR code
   - Check the webhook logs in your terminal

5. **View webhook events in PayMongo Dashboard:**
   - Settings → Webhooks → Recent Deliveries
   - See the HTTP status codes and response times

## Debugging Webhook Issues

**Check logs in terminal:**
```
[PayMongo Webhook] Received event: payment.paid
[PayMongo Webhook] Payment successful for intent: pi_...
[PayMongo Webhook] Order marked as paid
```

**Common Issues:**

1. **Webhook not receiving events**
   - Verify URL is public and accessible
   - Check endpoint returns 200 status code
   - Ensure all events are subscribed in dashboard

2. **Events not updating order**
   - Check MongoDB connection
   - Verify paymentIntentId matches in database
   - Check console logs for errors

3. **CORS/Origin issues**
   - Webhooks are server-to-server, CORS doesn't apply
   - Check Authorization header is correct

## Production Deployment

When deploying to production:

1. **Update webhook URL to production domain:**
   ```
   https://yourbookstore.com/api/webhooks/paymongo
   ```

2. **Use production API keys:**
   - Update `.env` with live keys starting with `sk_live_`

3. **Subscribe to webhooks with production account:**
   - Register same webhook events in PayMongo production dashboard

4. **Monitor webhook delivery:**
   - Set up alerts for failed webhook deliveries
   - Log all webhook events to database for audit trail

## Webhook Security Best Practices

1. **Verify webhook origin** (Optional but recommended)
   - PayMongo doesn't include signature, but you can:
     - Whitelist PayMongo IPs
     - Use API key in Authorization header
     - Log all webhook requests

2. **Idempotency**
   - Same event might be delivered multiple times
   - Use payment ID to check if already processed
   - Our code handles this with MongoDB updateOne

3. **Error Handling**
   - Always return 200 OK to confirm receipt
   - Don't throw errors in webhook (log instead)
   - Retry failed updates with exponential backoff

## Support

For webhook issues, contact:
- PayMongo Support: support@paymongo.com
- PayMongo Developers: developers@paymongo.com
