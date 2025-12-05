# Admin Interface Testing Guide

## 🚀 Quick Start Testing

### 1. **Start Both Servers**
```bash
# Terminal 1 - Start API server
cd apps/api
npm run dev

# Terminal 2 - Start Web server  
cd apps/web
npm run dev
```

### 2. **Create an Admin User**

#### Option A: Use the Admin Creation API
```bash
# First, create a regular user account at /auth/register
# Then use the admin creation endpoint (requires existing admin or super admin)
POST /api/v1/admin/create-admin
{
  "username": "testadmin",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

#### Option B: Manual Database Update (for testing only)
```javascript
// In MongoDB, update an existing user
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

#### Option C: Use the Seed Script
```bash
cd apps/api
npm run seed
# This will create test users including admin accounts
```

### 3. **Test the Admin Interface**

1. **Login** with your admin account at `/auth/login`
2. **Navigate** to `/admin`
3. **Check Console** for authentication logs
4. **Explore** the dashboard, users, and vendors sections

## 🔍 Debugging Authentication Issues

### Check Browser Console
The admin interface logs detailed authentication information:
- User data found in localStorage
- User role and permissions
- Redirect reasons

### Common Issues & Solutions

#### Issue: "Loading admin interface..." then redirect to login
**Cause**: No user data in localStorage or user lacks admin privileges
**Solution**: 
1. Ensure you're logged in at `/auth/login`
2. Check that your user has `role: "admin"` or `isSuperAdmin: true`
3. Verify localStorage contains `afritrade:user`

#### Issue: Redirect to `/dashboard` instead of admin
**Cause**: User is logged in but lacks admin privileges
**Solution**: Update user role to "admin" in database

#### Issue: API endpoints return 403 Forbidden
**Cause**: Backend admin authentication middleware rejecting requests
**Solution**: Ensure user has proper admin role and valid JWT token

## 🧪 Testing Different User Roles

### Regular User (role: "buyer")
- Should be redirected to `/dashboard` when accessing `/admin`
- Cannot access admin API endpoints

### Seller User (role: "seller")  
- Should be redirected to `/dashboard` when accessing `/admin`
- Cannot access admin API endpoints

### Admin User (role: "admin")
- Can access all admin interface pages
- Can perform user and vendor management operations
- Cannot access super admin only features

### Super Admin User (isSuperAdmin: true)
- Can access all admin features
- Can create other admin users
- Full platform control

## 📱 Testing Responsive Design

### Mobile Testing
- Test sidebar collapse/expand on mobile
- Verify touch targets are appropriately sized
- Check data table scrolling on small screens

### Desktop Testing  
- Test sidebar navigation
- Verify data table pagination
- Test bulk operations with multiple selections

## 🔧 API Testing

### Test Admin Endpoints
```bash
# Get dashboard metrics
GET /api/v1/admin/dashboard

# Get users list
GET /api/v1/admin/users

# Get vendors list  
GET /api/v1/admin/vendors

# Update user role
PUT /api/v1/admin/users/{userId}/role
{
  "role": "admin"
}
```

### Required Headers
```bash
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## 🐛 Troubleshooting

### Frontend Issues
1. Check browser console for errors
2. Verify localStorage contains user data
3. Check network tab for failed API calls

### Backend Issues  
1. Check API server logs
2. Verify admin middleware is working
3. Check database connection and user data

### Database Issues
1. Verify user document has correct role field
2. Check JWT token validity
3. Ensure user exists and is not blocked

## 📋 Test Checklist

- [ ] Admin user can access `/admin`
- [ ] Non-admin users are redirected away
- [ ] Dashboard metrics load correctly
- [ ] User management table displays data
- [ ] Vendor management table displays data
- [ ] Search and filtering work
- [ ] Bulk operations function properly
- [ ] Mobile responsive design works
- [ ] API endpoints return correct data
- [ ] Authentication persists across page refreshes

## 🚨 Security Testing

### Test Unauthorized Access
- Try accessing `/admin` without login
- Test with non-admin user accounts
- Verify API endpoint protection

### Test Role Escalation
- Ensure regular users cannot become admin
- Verify admin users cannot access super admin features
- Test JWT token expiration handling

## 📞 Getting Help

If you encounter issues:
1. Check this guide first
2. Review browser console logs
3. Check API server logs
4. Verify user permissions in database
5. Test with a known working admin account

---

**Note**: This admin interface is designed for production use with proper security measures. Always test in a development environment first. 