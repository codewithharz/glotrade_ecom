# B2B Wholesale Features - User Guide

This guide provides step-by-step instructions and examples for using the B2B wholesale features of the platform.

---

## 🎉 Feature 1: Bulk Pricing Tiers

### Overview
Bulk pricing allows you to offer quantity-based discounts to encourage larger orders. Customers automatically receive better prices when they order more units.

### For Admins: Setting Up Bulk Pricing

#### Step 1: Navigate to Product Creation
1. Login as admin/superAdmin
2. Go to `/vendor/products/new`
3. Fill in basic product details (title, price, description, etc.)

#### Step 2: Add Pricing Tiers
1. Scroll to the **"Bulk Pricing Tiers"** section
2. Click **"+ Add pricing tier"**
3. Configure each tier:
   - **Min Quantity**: Minimum units to qualify (e.g., 10)
   - **Max Quantity**: Maximum units (leave empty for "10+")
   - **Price Per Unit**: Fixed price (e.g., ₦95) OR
   - **Discount %**: Percentage off (e.g., 5%)

#### Example Configuration:

**Product: Premium Widget**
- Base Price: ₦100 per unit

**Tier 1:**
- Min Quantity: 10
- Max Quantity: 49
- Discount %: 5
- Result: ₦95 per unit (Save 5%)

**Tier 2:**
- Min Quantity: 50
- Max Quantity: 99
- Discount %: 10
- Result: ₦90 per unit (Save 10%)

**Tier 3:**
- Min Quantity: 100
- Max Quantity: (leave empty)
- Price Per Unit: 85
- Result: ₦85 per unit (Save 15%)

#### Step 3: Preview & Save
- Live preview shows: "10-49 units = ₦95 each (Save 5%)"
- Click **"Create Product"** to save
- Add product images in the next step

---

### For Customers: Using Bulk Pricing

#### Viewing Bulk Pricing

1. Browse to any product with bulk pricing
2. Look for the **"Wholesale Pricing"** section (blue box)
3. See all available tiers and savings

**Example Display:**
```
💰 Wholesale Pricing - Save More When You Buy More!

10-49 units    ₦95 each    Save 5%
50-99 units    ₦90 each    Save 10%
100+ units     ₦85 each    Save 15%
```

#### Automatic Application in Cart

1. Add product to cart
2. Adjust quantity using +/- buttons
3. **Pricing updates automatically** when you hit a tier
4. See "Bulk Savings" line in order summary

**Example Cart:**
```
Items Total:        ₦5,000  (50 units × ₦100)
Items Discount:     -₦0
Bulk Savings:       -₦500   (50 units × ₦10 saved)
─────────────────────────
Total:              ₦4,500
```

#### At Checkout

- Final total reflects bulk pricing
- Savings clearly displayed
- No coupon code needed - automatic!

---

## 📊 Real-World Examples

### Example 1: Office Supplies Store

**Product: Premium Notebooks**
- Base Price: ₦500 each
- MOQ: 5 units

**Bulk Pricing:**
- 5-19 units: ₦500 each (no discount)
- 20-49 units: 10% off = ₦450 each
- 50+ units: 15% off = ₦425 each

**Customer Order: 25 notebooks**
- Without bulk pricing: 25 × ₦500 = ₦12,500
- With bulk pricing: 25 × ₦450 = ₦11,250
- **Savings: ₦1,250**

---

### Example 2: Electronics Wholesaler

**Product: USB Cables**
- Base Price: ₦1,200 each
- MOQ: 10 units

**Bulk Pricing:**
- 10-49 units: ₦1,200 each
- 50-99 units: ₦1,100 each (fixed price)
- 100-499 units: ₦1,000 each (fixed price)
- 500+ units: ₦900 each (fixed price)

**Customer Order: 150 cables**
- Tier applied: 100-499 units
- Price: 150 × ₦1,000 = ₦150,000
- **Savings vs base: ₦30,000**

---

### Example 3: Food & Beverage Distributor

**Product: Energy Drinks (24-pack)**
- Base Price: ₦8,000 per case
- MOQ: 1 case

**Bulk Pricing:**
- 1-4 cases: ₦8,000 each
- 5-9 cases: 5% off = ₦7,600 each
- 10-24 cases: 10% off = ₦7,200 each
- 25+ cases: 15% off = ₦6,800 each

**Customer Order: 12 cases**
- Tier: 10-24 cases (10% off)
- Price: 12 × ₦7,200 = ₦86,400
- **Savings: ₦9,600**

---

## 💡 Best Practices

### For Admins

1. **Start Conservative**
   - Begin with 2-3 tiers
   - Test pricing with real customers
   - Adjust based on feedback

2. **Clear Tier Gaps**
   - Avoid overlapping ranges
   - Make tier jumps meaningful (e.g., 10, 50, 100)
   - Ensure higher quantities = better prices

3. **Competitive Pricing**
   - Research competitor bulk pricing
   - Ensure margins remain profitable
   - Consider shipping costs in pricing

4. **Communicate Value**
   - Highlight savings percentages
   - Use marketing to promote bulk deals
   - Email customers about bulk pricing

### For Customers

1. **Plan Ahead**
   - Calculate total needs before ordering
   - Combine orders to reach higher tiers
   - Check if bulk pricing beats individual discounts

2. **Compare Tiers**
   - Sometimes ordering slightly more saves significantly
   - Example: 48 units vs 50 units might unlock 10% off

3. **Storage Considerations**
   - Ensure you have space for bulk orders
   - Check product shelf life/expiration
   - Consider shared orders with partners

---

## 🔧 Troubleshooting

### Bulk Pricing Not Showing?

**Check:**
- Product has bulk pricing tiers configured
- You're viewing the correct product
- Refresh the page

### Discount Not Applied in Cart?

**Check:**
- Quantity meets minimum tier requirement
- Cart quantity matches product page quantity
- No conflicting promotions

### Wrong Price Calculated?

**Verify:**
- Which tier your quantity falls into
- Whether tier uses fixed price or percentage
- Base price is correct

---

## 📞 Support

For questions or issues:
- **Admin Support**: Contact platform administrator
- **Technical Issues**: Check console for errors
- **Feature Requests**: Submit via admin dashboard

---

## 🎉 Feature 2: Business Customer Registration

### Overview
Business customers can now register for a dedicated business account, allowing them to provide company details and receive verified status.

### How to Register
1. Go to the **Register** page.
2. Select **"Register as Business"**.
3. Fill in your **Company Name**, **Tax ID**, and other business details.
4. Submit your registration.

### Verification
- After registration, your account will be pending verification.
- Once verified by an admin, you will see a **"Verified Business"** badge on your profile.
- Verified businesses may get access to exclusive pricing and terms.

---

## 🎉 Feature 3: Invoice Generation

### Overview
Automatic PDF invoices are generated for every order, making accounting and record-keeping easier for business customers.

### How to Access Invoices
1. Go to **My Orders** in your profile.
2. Click on an order to view details.
3. Click the **"Invoice"** button in the action bar.
4. The PDF invoice will download automatically.

### Invoice Details
- **Invoice Number:** Unique identifier (e.g., INV-2025-123456).
- **Date:** Date of issue.
- **Bill To:** Your billing details.
- **Items:** Full breakdown of products, quantities, and prices.
- **PO Number:** Your Purchase Order number (if provided).

---

## 🎉 Feature 4: Purchase Order (PO) Support

### Overview
Streamline your procurement process by adding your internal Purchase Order (PO) numbers to orders.

### How to Use
1. Add items to your cart and proceed to **Checkout**.
2. In the checkout form, look for the **"Purchase Order (Optional)"** field.
3. Enter your internal PO number (e.g., PO-998877).
4. Complete the order.

### Tracking
- The PO number will appear on your **Order Confirmation**.
- It is included on the **PDF Invoice**.
- You can reference this number when communicating with support.

---

## 📝 Version History

### v1.0 - Bulk Pricing Tiers (December 2025)
- ✅ Multiple pricing tiers per product
- ✅ Fixed price OR percentage discount
- ✅ Auto-apply in cart
- ✅ Display on product pages
- ✅ Savings breakdown at checkout

---

### v1.1 - Phase 2 Complete (December 2025)
- ✅ Business Customer Registration
- ✅ PDF Invoice Generation
- ✅ Purchase Order (PO) Support
- ✅ Bulk Pricing Tiers

*Last Updated: December 2, 2025*
