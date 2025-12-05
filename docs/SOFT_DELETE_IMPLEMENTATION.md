# Soft Delete Implementation for Vendor Management

## Overview
This document outlines the backend implementation requirements for the soft delete functionality in vendor management, ensuring data integrity and audit compliance.

## 🎯 **Current Status**
- ✅ **Frontend**: Confirmation modal implemented with required deletion reason
- ⚠️ **Backend**: Needs implementation of soft delete logic

## 🔧 **Backend Implementation Requirements**

### **1. Database Schema Updates**

#### **User Model Enhancement**
```typescript
// Add to User schema
interface IUser {
  // ... existing fields
  isDeleted: boolean;           // Soft delete flag
  deletedAt?: Date;            // Deletion timestamp
  deletedBy?: string;          // Admin who performed deletion
  deletionReason?: string;     // Reason for deletion
  deletedData?: {              // Snapshot of data at deletion
    store?: any;
    sellerInfo?: any;
    // ... other relevant data
  };
}
```

#### **Seller Model Enhancement**
```typescript
// Add to Seller schema
interface ISeller {
  // ... existing fields
  isDeleted: boolean;           // Soft delete flag
  deletedAt?: Date;            // Deletion timestamp
  deletedBy?: string;          // Admin who performed deletion
  deletionReason?: string;     // Reason for deletion
}
```

### **2. API Endpoint Updates**

#### **Permanently Delete Vendor Endpoint**
```typescript
// PUT /api/v1/admin/vendors/:id/permanent
const permanentlyDeleteVendor = async (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    // Soft delete User
    await User.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.admin.id,
      deletionReason: reason,
      deletedData: {
        store: user.store,
        sellerInfo: user.sellerInfo,
        // ... other relevant data
      }
    });
    
    // Soft delete Seller record
    await Seller.findOneAndUpdate(
      { userId: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.admin.id,
        deletionReason: reason
      }
    );
    
    // Hide all vendor products (soft delete)
    await Product.updateMany(
      { seller: id },
      { 
        isDeleted: true,
        deletedAt: new Date(),
        status: 'inactive'
      }
    );
    
    // Cancel pending orders
    await Order.updateMany(
      { seller: id, status: 'pending' },
      { 
        status: 'cancelled',
        cancellationReason: 'Vendor permanently deleted',
        cancelledAt: new Date()
      }
    );
    
    res.json({
      status: 'success',
      message: 'Vendor permanently deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete vendor'
    });
  }
};
```

### **3. Query Updates**

#### **Vendor List Queries**
```typescript
// Update all vendor queries to exclude soft-deleted vendors
const fetchVendors = async (filters: any) => {
  const query = {
    isDeleted: { $ne: true },  // Exclude soft-deleted vendors
    ...filters
  };
  
  return await User.find(query);
};
```

#### **Product Queries**
```typescript
// Update product queries to exclude soft-deleted vendor products
const fetchProducts = async (filters: any) => {
  const query = {
    isDeleted: { $ne: true },  // Exclude soft-deleted products
    ...filters
  };
  
  return await Product.find(query);
};
```

### **4. Admin Interface Updates**

#### **Deleted Vendors Tab**
```typescript
// Add new tab for viewing deleted vendors
const fetchDeletedVendors = async (req: AdminRequest, res: Response) => {
  try {
    const deletedVendors = await User.find({
      isDeleted: true
    }).populate('deletedBy', 'username email');
    
    res.json({
      status: 'success',
      data: { vendors: deletedVendors }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deleted vendors'
    });
  }
};
```

#### **Restore Deleted Vendor**
```typescript
// Restore soft-deleted vendor
const restoreDeletedVendor = async (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  
  try {
    // Restore User
    await User.findByIdAndUpdate(id, {
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      deletionReason: undefined,
      deletedData: undefined
    });
    
    // Restore Seller
    await Seller.findOneAndUpdate(
      { userId: id },
      {
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
        deletionReason: undefined
      }
    );
    
    // Restore products (optional - may want to keep them hidden)
    // await Product.updateMany(
    //   { seller: id },
    //   { 
    //     isDeleted: false,
    //     deletedAt: undefined,
    //     status: 'active'
    //   }
    // );
    
    res.json({
      status: 'success',
      message: 'Vendor restored successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to restore vendor'
    });
  }
};
```

## 🚀 **Benefits of Soft Delete**

### **1. Data Integrity**
- ✅ **Preserves Data**: All vendor information maintained for audit
- ✅ **Recovery Option**: Vendors can be restored if needed
- ✅ **Order History**: Maintains complete transaction history

### **2. Compliance & Audit**
- ✅ **Audit Trail**: Complete record of deletion actions
- ✅ **Reason Tracking**: All deletions require documented reasons
- ✅ **Admin Accountability**: Tracks who performed deletions

### **3. Business Continuity**
- ✅ **Customer Support**: Can reference deleted vendor data
- ✅ **Dispute Resolution**: Historical data available for conflicts
- ✅ **Analytics**: Maintains data for business intelligence

## 📋 **Implementation Checklist**

### **Backend Tasks**
- [ ] Update User model with soft delete fields
- [ ] Update Seller model with soft delete fields
- [ ] Implement soft delete endpoint
- [ ] Update all vendor queries to exclude deleted vendors
- [ ] Update product queries to exclude deleted vendor products
- [ ] Implement deleted vendors list endpoint
- [ ] Implement restore vendor endpoint
- [ ] Add proper error handling and validation

### **Frontend Tasks**
- [x] Confirmation modal with required reason
- [ ] Add "Deleted Vendors" tab to admin interface
- [ ] Add restore functionality for deleted vendors
- [ ] Update vendor list to exclude deleted vendors
- [ ] Add audit trail display for deletions

### **Testing Tasks**
- [ ] Test soft delete functionality
- [ ] Test restore functionality
- [ ] Test data integrity after deletion
- [ ] Test query performance with soft delete
- [ ] Test audit trail accuracy

## 🎯 **Next Steps**

1. **Backend Implementation**: Implement soft delete logic in vendor controller
2. **Database Migration**: Add soft delete fields to existing models
3. **Query Updates**: Update all vendor-related queries
4. **Admin Interface**: Add deleted vendors management
5. **Testing**: Comprehensive testing of soft delete functionality

## 📚 **Related Documentation**

- `docs/VENDOR_ACCESS_CONTROL_IMPLEMENTATION.md` - Main vendor management documentation
- `docs/ENHANCED_SELLER_FORM_PLAN.md` - Vendor application system
- `docs/DOCUMENT_DEDUPLICATION_IMPLEMENTATION.md` - Document management system