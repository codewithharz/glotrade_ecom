# Admin Authentication Middleware

This directory contains authentication and authorization middleware for the AfriTrade Hub API.

## Overview

The admin authentication middleware extends the existing `auth` middleware to provide admin-specific access control. It validates that authenticated users have the appropriate admin privileges before allowing access to admin routes.

## Middleware Components

### 1. `adminAuth` - Basic Admin Access
- **Purpose**: Validates that the user has admin privileges
- **Access**: Users with `role === 'admin'` OR `isSuperAdmin === true`
- **Usage**: Apply to all admin routes that require basic admin access

```typescript
import { adminAuth } from '../middleware/adminAuth';

// Basic admin route
router.get('/admin/dashboard', auth(userService), adminAuth, adminController.getDashboard);
```

### 2. `superAdminAuth` - Super Admin Only Access
- **Purpose**: Validates that the user has super admin privileges
- **Access**: Users with `isSuperAdmin === true` only
- **Usage**: Apply to system-level operations that require elevated privileges

```typescript
import { superAdminAuth } from '../middleware/adminAuth';

// Super admin only route
router.post('/admin/system/config', auth(userService), superAdminAuth, adminController.updateSystemConfig);
```

### 3. `roleBasedAdminAuth` - Flexible Role-Based Access
- **Purpose**: Provides flexible role-based access control for admin operations
- **Access**: Configurable based on allowed roles and super admin requirements
- **Usage**: Apply when you need fine-grained control over admin access

```typescript
import { roleBasedAdminAuth } from '../middleware/adminAuth';

// Admin role required, super admin not required
router.get('/admin/users', auth(userService), roleBasedAdminAuth(['admin'], false), adminController.getUsers);

// Admin role required, super admin also required
router.get('/admin/system', auth(userService), roleBasedAdminAuth(['admin'], true), adminController.getSystemInfo);

// Multiple roles allowed
router.get('/admin/moderate', auth(userService), roleBasedAdminAuth(['admin', 'moderator'], false), adminController.moderateContent);
```

## Implementation Order

**Important**: Always apply the middleware in this order:

1. **First**: `auth(userService)` - Authenticates the user and populates `req.user`
2. **Second**: Admin middleware (`adminAuth`, `superAdminAuth`, or `roleBasedAdminAuth`) - Validates admin privileges

```typescript
// ✅ Correct order
router.get('/admin/users', auth(userService), adminAuth, adminController.getUsers);

// ❌ Wrong order - adminAuth will fail because req.user is not set
router.get('/admin/users', adminAuth, auth(userService), adminController.getUsers);
```

## User Model Requirements

The admin authentication middleware expects the user object to have these properties:

```typescript
interface IUser {
  _id: string;
  username: string;
  role: "buyer" | "seller" | "admin";
  isSuperAdmin: boolean;
  // ... other properties
}
```

## Error Handling

The middleware follows the established error handling patterns:

- **403 Forbidden**: When user lacks admin privileges
- **401 Unauthorized**: When user is not authenticated (handled by main auth middleware)

All errors are passed to the Express error handling middleware via `next(error)`.

## Audit Logging

The middleware automatically logs admin access for audit purposes:

```typescript
console.log("Admin access granted:", {
  userId: req.user._id,
  username: req.user.username,
  role: req.user.role,
  isSuperAdmin: req.user.isSuperAdmin,
  timestamp: new Date().toISOString()
});
```

## Example Route Implementation

```typescript
// apps/api/src/routes/admin.routes.ts
import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminAuth, superAdminAuth, roleBasedAdminAuth } from "../middleware/adminAuth";
import { UserService } from "../services/UserService";
import { AdminController } from "../controllers/admin.controller";

const router = Router();
const userService = new UserService();
const adminController = new AdminController(userService);

// Apply admin authentication to all routes
router.use(auth(userService));
router.use(adminAuth);

// Basic admin routes
router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.getUsers);

// Super admin only routes
router.post("/system/config", superAdminAuth, adminController.updateSystemConfig);

// Role-based routes
router.get("/analytics", roleBasedAdminAuth(['admin'], false), adminController.getAnalytics);
router.get("/system/health", roleBasedAdminAuth(['admin'], true), adminController.getSystemHealth);

export default router;
```

## Testing

The middleware includes comprehensive tests in `tests/middleware/adminAuth.spec.ts`:

```bash
# Run admin auth middleware tests
npm test -- --testPathPattern=adminAuth.spec.ts

# Run all middleware tests
npm test -- --testPathPattern=middleware
```

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate input** on all admin endpoints
3. **Rate limiting** should be applied to admin routes
4. **Audit logging** is automatically enabled
5. **Session management** should be configured appropriately
6. **IP whitelisting** can be added as an additional security layer

## Future Enhancements

- **Two-factor authentication** for admin access
- **IP-based access control**
- **Time-based access restrictions**
- **Advanced role permissions** with granular capabilities
- **Admin session management** with forced logout capabilities 