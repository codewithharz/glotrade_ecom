# Sample Vendor Applications Guide

This document provides sample data for three vendor applications from different African countries to help with testing and demonstration of the "Become a Seller" form.

## 🌍 **Target Countries**

1. **Senegal** (SN) - XOF Currency
2. **Ghana** (GH) - GHS Currency  
3. **Nigeria** (NG) - NGN Currency

---

## 🇸🇳 **SENEGAL VENDOR - Amadou Diop**

### **Basic Store Information**
- **Store Name**: `Diop Artisanat Dakar`
- **Description**: `Authentic Senegalese handcrafted jewelry, textiles, and home decor. Supporting local artisans and preserving traditional craftsmanship.`
- **Logo URL**: `https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=200&fit=crop&crop=face`

### **Business Information**
- **Business Type**: `individual`
- **Industry**: `Fashion & Accessories`

### **Contact Information**
- **Business Phone**: `+221 77 123 4567`
- **Business Email**: `amadou.diop@diopartisanat.sn`
- **Business Address**: `Rue de la République, Plateau`
- **Business City**: `Dakar`
- **Business State**: `Dakar`
- **Business Postal Code**: `10000`

### **Business Verification**
- **CAC Type**: `N/A` (Not applicable for Senegal)
- **CAC Number**: `N/A`
- **Tax ID**: `SN123456789`
- **Business License**: `BL-SN-2023-001`
- **Business Registration Date**: `2023-01-15`

### **Payment Setup**
- **Country**: `SN` (Senegal)
- **Payout Provider**: `flutterwave`
- **Bank Code**: `SN001` (Banque Internationale pour le Commerce et l'Industrie du Sénégal)
- **Account Number**: `1234567890`
- **Account Name**: `Amadou Diop`

### **Business Documents** (Required for Senegal)
- Business License Number: `BL-SN-2023-001`
- Tax ID: `SN123456789`
- Business Registration Date: `2023-01-15`

---

## 🇬🇭 **GHANA VENDOR - Kofi Asante**

### **Basic Store Information**
- **Store Name**: `Asante Tech Solutions`
- **Description**: `Leading provider of mobile accessories, electronics, and tech gadgets in Ghana. Authorized dealer for major brands with nationwide delivery.`
- **Logo URL**: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=face`

### **Business Information**
- **Business Type**: `company`
- **Industry**: `Electronics & Technology`

### **Contact Information**
- **Business Phone**: `+233 24 567 8901`
- **Business Email**: `kofi.asante@asantetech.gh`
- **Business Address**: `Oxford Street, Osu`
- **Business City**: `Accra`
- **Business State**: `Greater Accra`
- **Business Postal Code**: `GA-123-4567`

### **Business Verification**
- **CAC Type**: `N/A` (Not applicable for Ghana)
- **CAC Number**: `N/A`
- **Tax ID**: `GH987654321`
- **Business License**: `BL-GH-2022-045`
- **Business Registration Date**: `2022-06-20`

### **Payment Setup**
- **Country**: `GH` (Ghana)
- **Payout Provider**: `paystack`
- **Bank Code**: `GH001` (Ghana Commercial Bank)
- **Account Number**: `9876543210`
- **Account Name**: `Asante Tech Solutions Ltd`

### **Business Documents** (Required for Ghana)
- Business License Number: `BL-GH-2022-045`
- Tax ID: `GH987654321`
- Business Registration Date: `2022-06-20`

---

## 🇳🇬 **NIGERIA VENDOR - Fatima Ibrahim**

### **Basic Store Information**
- **Store Name**: `Ibrahim Fashion House`
- **Description**: `Premium Nigerian fashion brand specializing in traditional and contemporary clothing for men, women, and children. Custom tailoring and ready-to-wear collections.`
- **Logo URL**: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face`

### **Business Information**
- **Business Type**: `company`
- **Industry**: `Fashion & Accessories`

### **Contact Information**
- **Business Phone**: `+234 80 1234 5678`
- **Business Email**: `fatima.ibrahim@ibrahimfashion.ng`
- **Business Address**: `123 Allen Avenue, Ikeja`
- **Business City**: `Ikeja`
- **Business State**: `Lagos`
- **Business Postal Code**: `100001`

### **Business Verification**
- **CAC Type**: `RC` (Registered Company)
- **CAC Number**: `RC1234567`
- **Tax ID**: `NG1234567890`
- **Business License**: `BL-NG-2021-089`
- **Business Registration Date**: `2021-03-10`

### **Payment Setup**
- **Country**: `NG` (Nigeria)
- **Payout Provider**: `paystack`
- **Bank Code**: `NG001` (Access Bank)
- **Account Number**: `1234567890`
- **Account Name**: `Ibrahim Fashion House Ltd`

### **Business Documents** (Required for Nigeria)
- CAC Type: `RC`
- CAC Number: `RC1234567`
- Tax ID: `NG1234567890`
- Business Registration Date: `2021-03-10`

---

## 📋 **Form Field Mapping**

### **Step 1: Basic Information**
```json
{
  "storeName": "Store Name",
  "description": "Store Description", 
  "logoUrl": "Logo URL"
}
```

### **Step 2: Business Details**
```json
{
  "businessType": "individual|company|partnership",
  "industry": "Selected Industry Category"
}
```

### **Step 3: Contact Information**
```json
{
  "businessPhone": "+country_code phone_number",
  "businessEmail": "business@email.com",
  "businessAddress": "Street Address",
  "businessCity": "City Name",
  "businessState": "State/Region",
  "businessPostalCode": "Postal Code"
}
```

### **Step 4: Business Verification**
```json
{
  "cacType": "RC|BN (Nigeria only)",
  "cacNumber": "CAC Registration Number",
  "taxId": "Tax Identification Number",
  "businessLicense": "Business License Number",
  "businessRegistrationDate": "YYYY-MM-DD"
}
```

### **Step 5: Payment Setup**
```json
{
  "country": "Country Code (SN|GH|NG)",
  "payoutProvider": "paystack|flutterwave",
  "bankCode": "Bank Code",
  "accountNumber": "Account Number",
  "accountName": "Account Holder Name"
}
```

---

## 🏦 **Bank Codes Reference**

### **Nigeria (NG)**
- Access Bank: `NG001`
- First Bank: `NG002`
- GTBank: `NG003`
- Zenith Bank: `NG004`
- UBA: `NG005`

### **Ghana (GH)**
- Ghana Commercial Bank: `GH001`
- Ecobank Ghana: `GH002`
- Standard Chartered: `GH003`
- Fidelity Bank: `GH004`
- Stanbic Bank: `GH005`

### **Senegal (SN)**
- BICIS: `SN001`
- Société Générale: `SN002`
- Crédit Lyonnais: `SN003`
- Banque Atlantique: `SN004`
- Orabank: `SN005`

---

## 🏷️ **Industry Categories**

Available industry options in the form:
- `Electronics & Technology`
- `Fashion & Accessories`
- `Home & Garden`
- `Health & Beauty`
- `Sports & Outdoors`
- `Books & Media`
- `Food & Beverages`
- `Automotive`
- `Toys & Games`
- `Office Supplies`

---

## 📝 **Testing Instructions**

1. **Navigate to**: `/vendor/apply`
2. **Fill out the form** using the sample data above
3. **Test different countries** to see country-specific requirements
4. **Verify validation** for required fields
5. **Test payment provider** selection based on country
6. **Check document requirements** vary by country

---

## 🔍 **Country-Specific Requirements**

### **Nigeria (NG)**
- ✅ CAC Type (RC/BN)
- ✅ CAC Number
- ✅ Tax ID
- ✅ Business Registration Date
- ✅ Both Paystack & Flutterwave supported

### **Ghana (GH)**
- ✅ Business License
- ✅ Tax ID
- ✅ Business Registration Date
- ✅ Both Paystack & Flutterwave supported

### **Senegal (SN)**
- ✅ Business License
- ✅ Tax ID
- ✅ Business Registration Date
- ✅ Flutterwave & Mobile Money supported

---

## 🚀 **Next Steps After Application**

1. **Admin Review**: Applications go to admin dashboard for approval
2. **Wallet Creation**: Vendor wallets (NGN/ATH) created upon approval
3. **Store Setup**: Vendor can customize store appearance
4. **Product Upload**: Start adding products to catalog
5. **Payment Setup**: Configure payout methods
6. **Go Live**: Store becomes active and visible to customers

---

*This guide provides realistic sample data for testing the vendor application form across different African markets. All data is fictional and for demonstration purposes only.*
