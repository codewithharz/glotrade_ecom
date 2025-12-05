# AfriTrade Hub - Frontend

## Overview

This is the Next.js 15 frontend for **AfriTrade Hub**, a B2B wholesale e-commerce platform with MOQ (Minimum Order Quantity) enforcement and admin-managed product catalog.

## Key Features

### 🛍️ Wholesale Customer Experience
- Product browsing with MOQ (Minimum Order Quantity) display
- Shopping cart with MOQ enforcement
- Wishlist management
- Complete checkout flow with payment integration
- Order tracking and management
- Product reviews and ratings

### 👑 Admin Product Management
- Comprehensive admin dashboard
- User management and role assignment
- **Product Management**: Admin-only access to add/edit products via `/admin` dashboard
- **Bulk Pricing Tiers**: Set quantity-based discounts (e.g., 10-49 units = 5% off, 50+ = 10% off)
- Inventory control with MOQ settings
- Order processing and fulfillment
- Sales analytics and reporting
- Coupon and promotion management

### 🔐 Admin Role Management
- **Super Admin**: Full platform control, can promote/demote users
- **Admin**: Store management access, cannot modify roles
- **Buyer**: Regular customer access

### 🎨 UI/UX
- Responsive design for all devices
- Dark/Light theme support
- Real-time notifications
- Modern, intuitive interface

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State**: React hooks + localStorage
- **Real-time**: Server-Sent Events (SSE)
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running API server (see `/apps/api`)

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and management
│   ├── auth/              # Authentication pages
│   ├── marketplace/       # Product catalog
│   ├── profile/           # User profile
│   ├── vendor/            # DEPRECATED (Moved to admin)
├── components/            # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   └── layout/           # Layout components
├── styles/               # Global styles
└── utils/                # Utility functions
```

## Admin Access

### Creating First Super Admin

The first super admin must be created using the backend CLI script:

```bash
cd apps/api
npm run create-admin
```

Follow the prompts to create the super admin account with email: **harunjibs@gmail.com**

### Admin Features

- **Dashboard**: Real-time metrics and analytics
- **User Management**: View, edit, and manage users
- **Role Management**: Promote users to admin (Super Admin only)
- **Product Management**: Full CRUD operations
- **Order Management**: Process and fulfill orders
- **Store Settings**: Configure store policies and information

## Key Pages

- `/` - Home page with featured products
- `/marketplace` - Product catalog
- `/marketplace/[id]` - Product details
- `/profile` - User profile and settings
- `/admin` - Admin dashboard (Admin/Super Admin only)
- `/admin/store` - Store management (Admin/Super Admin only)
- `/auth/login` - Login page
- `/auth/register` - Registration page

## B2B Wholesale Platform Model

This platform operates as a **B2B wholesale marketplace** where:
- **Admin-Managed Products**: All products are added and managed by administrators via the `/admin` dashboard
- **MOQ Enforcement**: Products have Minimum Order Quantities enforced at cart and checkout
- **Wholesale Customers**: Regular users can browse and purchase (must meet MOQ requirements)
- **Access Control**: Product management is restricted to admin/superAdmin roles only
- **No Public Vendor Registration**: Vendor application features are disabled

### Recent Changes (Phase 1: Multi-Vendor Cleanup)

**Completed:**
- ✅ Created `AdminGuard` component for access control
- ✅ Restricted `/vendor/*` pages to admin/superAdmin only
- ✅ Removed public vendor application (`/vendor/apply`)
- ✅ Updated breadcrumbs: "Store Management" → "Product Management"
- ✅ Deleted admin vendor management page

**Access Control:**
- `/admin/products` - Product Management Dashboard (Admin only)
- `/admin/products/new` - Add New Product (Admin only)
- `/admin/store` - Store Settings (Admin only)
- `/admin/coupons` - Coupon Management (Admin only)

Non-admin users attempting to access these pages will be redirected to the home page.

### Phase 2: Essential Wholesale Features (In Progress)

**Completed:**
- ✅ **Bulk Pricing Tiers** - Quantity-based discounts
  - Admin can set multiple pricing tiers per product
  - Tiers support fixed price OR percentage discount
  - Auto-applied in cart based on quantity
  - Displayed prominently on product pages
  - Savings shown at checkout
- ✅ **Business Customer Registration**
  - Dedicated registration flow for business accounts
  - Collection of company details (Tax ID, Reg Number, etc.)
  - Admin verification workflow
  - Business badges on profile and admin dashboard
- ✅ **Invoice Generation**
  - Auto-generated PDF invoices for all orders
  - Downloadable from Order Details page
  - Includes comprehensive order and tax information
- ✅ **Purchase Order Support**
  - Optional PO number field at checkout
  - Displayed on invoices and order details
  - Streamlines B2B procurement processes

**In Progress:**
- None (Phase 2 Complete)

### Phase 3: Advanced Wholesale Features (Roadmap)

**Completed:**
- ✅ **Credit Limits & Net Terms** (Partial)
  - Backend credit management system
  - User model with credit fields (limit, usage, terms)
  - CreditService for balance checks and reservations
  - Admin endpoints to set credit limits
  - Order model supports net_terms payment method
  - Profile page displays credit information
  - *Remaining: Checkout integration, Admin UI*

**Planned Features:**

#### Feature 2: Request for Quote (RFQ) 💬
**Goal:** Allow customers to negotiate prices for very large orders
- **Backend Implementation**
  - [ ] Create Quote model (customer, products, quantities, status, messages)
  - [ ] Add quote endpoints (create, reply, convert to order)
  - [ ] Email notifications for quote updates
- **Frontend Implementation**
  - [ ] Add "Request Quote" button on cart or product page
  - [ ] Create Quote Management Dashboard for customers and admins
  - [ ] Implement negotiation chat UI for back-and-forth pricing discussions
  - [ ] Convert approved quotes to orders with one click

#### Feature 3: Quick Reorder Form ⚡
**Goal:** Streamline ordering for repeat customers
- **Frontend Implementation**
  - [ ] Create a "Quick Order" page
  - [ ] Allow entering SKUs/Product IDs and quantities directly
  - [ ] Bulk paste support (e.g., from Excel/CSV)
  - [ ] Enhance existing "Reorder" button on past orders to bulk add all items
  - [ ] Integrate seamlessly with cart

#### Feature 4: Multi-User Business Accounts 👥
**Goal:** Allow businesses to have teams (e.g., Purchasing Manager, Buyer)
- **Backend Implementation**
  - [ ] Add `parentAccount` field to User model
  - [ ] Implement role-based access control (RBAC) for business sub-accounts
  - [ ] Define permissions (e.g., view-only, can-order, can-approve)
  - [ ] Shared credit limit across team members
- **Frontend Implementation**
  - [ ] Create Team Management interface in profile
  - [ ] Invite team members via email
  - [ ] Activity logs for business admins (who ordered what, when)
  - [ ] Approval workflows for large orders

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Main Project README](../../README.md)
- [Admin Guide](../api/ADMIN_GUIDE.md)
