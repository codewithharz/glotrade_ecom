# Quick Reference: Bulk Pricing Setup

## Admin: Create Bulk Pricing (3 Steps)

### 1. Go to Product Form
```
/vendor/products/new
```

### 2. Add Pricing Tiers
Scroll to "Bulk Pricing Tiers" section → Click "+ Add pricing tier"

### 3. Configure Each Tier
```
Min Quantity: 10
Max Quantity: 49 (or leave empty for "10+")
Choose ONE:
  - Price Per Unit: ₦95 (fixed price)
  - OR Discount %: 5 (percentage off)
```

---

## Example: 3-Tier Setup

**Product: Widget (Base: ₦100)**

| Tier | Quantity | Price | Savings |
|------|----------|-------|---------|
| 1 | 10-49 | ₦95 | 5% |
| 2 | 50-99 | ₦90 | 10% |
| 3 | 100+ | ₦85 | 15% |

---

## Customer Experience

### Product Page
- See pricing table in blue box
- Shows all tiers and savings

### Cart
- Pricing auto-applies based on quantity
- "Bulk Savings" line shows discount
- No coupon needed!

### Example Order
```
50 units × ₦100 = ₦5,000
Bulk Savings: -₦500 (Tier 2: 10% off)
Total: ₦4,500
```

---

## Tips

✅ **DO:**
- Start with 2-3 tiers
- Make tier jumps meaningful (10, 50, 100)
- Test pricing before launch

❌ **DON'T:**
- Create overlapping ranges
- Make tiers too close together
- Forget to set Min Quantity

---

## Troubleshooting

**Pricing not showing?**
- Check product has tiers configured
- Refresh page

**Discount not applied?**
- Verify quantity meets minimum
- Check which tier applies

---

*For full guide, see: b2b_features_guide.md*
