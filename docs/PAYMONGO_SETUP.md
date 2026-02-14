# 🔧 PayMongo Setup Guide

## Step 1: Create PayMongo Account

### Go to PayMongo
1. Visit https://dashboard.paymongo.com
2. Click "Sign Up"
3. Fill in details:
   - Email
   - Password
   - Business name
4. Verify email
5. Complete profile setup

---

## Step 2: Get Your API Key

### In PayMongo Dashboard
1. Login to https://dashboard.paymongo.com
2. Go to **Settings** (gear icon)
3. Click **API Keys**
4. You'll see:
   - **Public Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Sandbox vs Live
**For Testing (Sandbox):**
- Use keys starting with `pk_test_` and `sk_test_`
- No real charges
- Test payments only

**For Production:**
- Use keys starting with `pk_live_` and `sk_live_`
- Real payments processed
- Real charges applied

---

## Step 3: Add to Your Project

### Update `.env.local`
Create/edit the file `.env.local` in your project root:

```env
# PayMongo
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

**Windows PowerShell (PowerShell profile):**
```powershell
$env:PAYMONGO_SECRET_KEY = "sk_test_xxxxxxxxxxxxxxxx"
$env:NEXT_PUBLIC_BASE_URL = "http://localhost:3001"
```

**Or create `.env.local` file:**
```
PAYMONGO_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Verify File Created
```powershell
ls -Path d:\v0-bookstore-management-system\.env.local
type d:\v0-bookstore-management-system\.env.local
```

---

## Step 4: Restart Dev Server

### Kill Current Process
```powershell
# Stop current dev server (Ctrl+C in terminal)
```

### Restart
```powershell
cd d:\v0-bookstore-management-system
npm run dev
```

### Verify Environment Variable Loaded
- Check terminal output for any warnings
- Should start on http://localhost:3001 normally

---

## Step 5: Test PayMongo Integration

### Test QR Code Generation

1. **Add items to cart**
   - Go to http://localhost:3001/catalog
   - Add a book

2. **Go through checkout**
   - Navigate to `/cart`
   - Click "Checkout"
   - Fill form:
     - Email: `test@paymongo.com`
     - Name: `Test User`
     - Phone: `+63 9181234567`
     - Select "Delivery" or "Pickup"
     - If delivery: fill address
   - Click "Proceed to Payment"

3. **On payment page**
   - Click "Generate Payment QR Code"
   - **Expected:** QR code image should display
   - **Check browser console:** No errors should appear

### Test with PayMongo Sandbox

If QR displays, you can test the full flow:

1. **Get Test Card** (from PayMongo docs)
   - Visa: 4343434343434345
   - Expiry: Any future date
   - CVV: Any 3 digits

2. **Scan QR with PayMongo Test App** (if available)
   - Or use test payment link

3. **Complete payment**
   - Should redirect to `/checkout/success`

---

## Step 6: Verify in Browser DevTools

### Check Request
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Generate Payment QR Code"
4. Find POST request to `/api/payment`
5. Check Response tab:
   ```json
   {
     "success": true,
     "sourceId": "src_xxxxx",
     "qrCode": "https://pay.paymongo.com/qr/xxxxx",
     "amount": 1500,
     "currency": "PHP"
   }
   ```

### Check Console Logs
- No errors should appear
- May see "QR code generated" or similar success message

---

## Troubleshooting

### Error: "PayMongo API key not configured"
**Solution:**
1. Check `.env.local` file exists
2. Verify key starts with `sk_test_` or `sk_live_`
3. No spaces around `=`
4. Restart dev server
5. Check: `node -e "console.log(process.env.PAYMONGO_SECRET_KEY)"`

### Error: "Failed to create payment source"
**Causes:**
1. Invalid API key format
2. API key expired or revoked
3. PayMongo API down
4. Incorrect environment variable name

**Solution:**
1. Regenerate key from PayMongo dashboard
2. Copy-paste key carefully (no extra spaces)
3. Restart server
4. Check PayMongo status

### QR Code Not Displaying
**Causes:**
1. PayMongo API error
2. Missing `NEXT_PUBLIC_BASE_URL`
3. Invalid amount format

**Solution:**
1. Check browser console for errors
2. Ensure both env vars set
3. Verify order total is a number

### "Network Error" When Generating QR
**Solution:**
1. Check PAYMONGO_SECRET_KEY is set
2. Verify internet connection
3. Check PayMongo API status
4. Try refreshing page

---

## Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Get `sk_live_` key from PayMongo
   - Update `.env.local` (or `.env.production.local`)

2. **Update Domain**
   ```env
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

3. **Enable HTTPS**
   - Required for PayMongo
   - Use SSL certificate

4. **Test with Small Amount**
   - Create test order
   - Process small payment
   - Verify success page
   - Check database

5. **Set Up Webhooks** (Optional but Recommended)
   - PayMongo → Settings → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/payment`
   - Events: `payment.paid`, `payment.failed`

---

## PayMongo Features Available

### Current Implementation
- ✅ GCash QR Payment
- ✅ Create Payment Source
- ✅ Check Payment Status

### Future Enhancements
- [ ] Credit Card Payment
- [ ] Installment Plans
- [ ] Webhooks for Auto-Update
- [ ] Refund Processing
- [ ] Multi-currency
- [ ] Invoice Generation

---

## PayMongo Documentation

### Useful Links
- [PayMongo Dashboard](https://dashboard.paymongo.com)
- [API Documentation](https://developers.paymongo.com/docs)
- [GCash Payments](https://developers.paymongo.com/reference/gcash)
- [Testing Guide](https://developers.paymongo.com/guides/testing)

### Test Credentials
- **Visa**: 4343 4343 4343 4345
- **Mastercard**: 5555 5555 5555 4444
- **Expiry**: Any future date
- **CVV**: Any 3 digits

---

## Monitoring Payments

### In PayMongo Dashboard
1. Go to **Transactions**
2. See all payments processed
3. View status (pending, completed, failed)
4. Download reports

### In Your Database
```javascript
db.orders.find({ paymentStatus: "paid" })
```

---

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use `.gitignore`: Add `.env.local`
- [ ] Only use live key in production
- [ ] Enable HTTPS on production
- [ ] Use strong passwords
- [ ] Rotate API keys periodically
- [ ] Monitor failed transactions
- [ ] Set up fraud alerts
- [ ] Log all transactions
- [ ] Implement webhook verification

---

## Common Issues & Solutions

### "Invalid API Key Format"
- Check key starts with `sk_` (not `pk_`)
- Regenerate key if unsure
- Copy directly from PayMongo dashboard

### "Redirect URL not whitelisted"
- May need to add your domain to PayMongo settings
- Check Developers → Webhooks → Redirect URLs
- Add both `http://localhost:3001` (dev) and your production URL

### Payment Creates but QR Doesn't Show
- Check browser console for 401/403 errors
- Verify PAYMONGO_SECRET_KEY is correct
- Restart dev server after env changes

### GCash QR Scanner Not Working
- Use official GCash app (not other apps)
- Ensure QR code displays clearly
- Try refreshing payment page
- Verify amount is in PHP

---

## Next Steps

1. **Setup Complete** ✓
   - API key added to `.env.local`
   - Dev server restarted
   - PayMongo integration ready

2. **Test Payment Flow**
   ```
   1. Go to /catalog
   2. Add book to cart
   3. Go to /checkout
   4. Fill form and proceed
   5. See QR code on /checkout/payment
   ```

3. **Verify Order**
   ```
   Check database: 
   db.orders.findOne({ guestEmail: "test@paymongo.com" })
   ```

4. **Deploy to Production**
   - Update environment variables
   - Switch to live keys
   - Test with real payment
   - Monitor transactions

---

## Support

**PayMongo Support:**
- Email: support@paymongo.com
- Status Page: https://status.paymongo.com
- Docs: https://developers.paymongo.com

**Your Project Support:**
- Check `GUEST_CHECKOUT_QUICK_START.md`
- Check `TESTING_GUIDE.md`
- Review browser console errors
- Check database for order records

---

**Your bookstore is now payment-ready! 💳✅**
