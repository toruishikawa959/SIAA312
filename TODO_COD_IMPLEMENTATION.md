# COD Quezon City Restriction Implementation

## Tasks
- [x] Analyze current checkout flow and understand the codebase
- [x] Update lib/types.ts - Add "cod" to paymentMethod type
- [x] Update app/checkout/page.tsx - Add COD option with Quezon City validation
- [x] Update app/checkout/payment/page.tsx - Handle COD payment flow
- [x] Update app/api/orders/route.ts - Add backend validation for COD
- [x] Implementation complete

## Summary of Changes

### 1. lib/types.ts
- Added `"cod"` to the `paymentMethod` union type

### 2. app/checkout/page.tsx
- Added `paymentMethod` state ("qrph" | "cod")
- Added `handlePaymentMethodChange` function
- Added `isQuezonCity()` helper - checks if city contains "quezon city", "qc", or "q.c."
- Added `isCodAvailable()` helper - COD only available for delivery + Quezon City
- Added COD payment option UI with dynamic enable/disable
- Added warning/info messages for COD availability
- Updated form validation to block COD for non-Quezon City addresses
- Updated submit button text based on payment method
- Added `paymentMethod` to order payload

### 3. app/checkout/payment/page.tsx
- Added `paymentMethod` to OrderData interface
- Added `isCodOrder` check
- Updated `handleInitiatePayment` to skip QR generation for COD
- Added COD-specific UI with confirmation message
- Added success screen for COD orders with next steps

### 4. app/api/orders/route.ts
- Accept `paymentMethod` from request body
- Added backend validation:
  - COD not allowed for pickup orders
  - COD only allowed for Quezon City addresses (checks "quezon city", ", qc", " q.c.", " qc ")
- Store `paymentMethod` in order document

## User-Friendly Error Messages Implemented

1. **When COD is disabled (non-Quezon City):**
   - "Cash on Delivery is only available for deliveries within Quezon City. Please enter 'Quezon City' as your city to enable this option."

2. **When user tries to submit with invalid COD:**
   - "Cash on Delivery is only available for Quezon City deliveries. Please select a different payment method or change your delivery address."

3. **When COD is available (Quezon City):**
   - "Great! Cash on Delivery is available for your Quezon City address."

4. **Backend validation errors:**
   - "Cash on Delivery is not available for store pickup orders"
   - "Cash on Delivery is only available for deliveries within Quezon City"
   - "Delivery address is required for Cash on Delivery"

## How It Works

1. User enters delivery address
2. System checks if city field contains "Quezon City" (case-insensitive)
3. If yes → COD option is enabled
4. If no → COD option is disabled with "Quezon City only" badge
5. Warning message shown explaining the restriction
6. On form submission, both frontend and backend validate COD eligibility
7. If COD selected, payment page shows confirmation instead of QR code
8. Order is marked with `paymentMethod: "cod"` and `paymentStatus: "pending"`

## Testing Checklist

- [ ] Enter "Quezon City" as city → COD should be enabled
- [ ] Enter "Manila" as city → COD should be disabled
- [ ] Select pickup → COD should be disabled
- [ ] Try to submit with COD + non-Quezon City → Should show error
- [ ] Submit with COD + Quezon City → Should go to payment page with COD confirmation
- [ ] Confirm COD order → Should show success screen


## Implementation Details

### Frontend Changes (app/checkout/page.tsx)
1. Add paymentMethod state ("qrph" | "cod")
2. Add isQuezonCity helper function
3. Add COD payment option UI with dynamic enable/disable
4. Show warning message when COD is unavailable
5. Update form submission to include payment method

### Backend Changes (app/api/orders/route.ts)
1. Accept paymentMethod in request body
2. Validate COD is only for Quezon City addresses
3. Return appropriate error messages

### Types (lib/types.ts)
1. Add "cod" to paymentMethod union type
