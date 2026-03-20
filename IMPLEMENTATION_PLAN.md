# Bellara E-Commerce Implementation Plan

## Overview

Bellara is a luxury leather bag e-commerce platform with:
- **Customer (Guest)**: Browse products, add to cart, checkout with COD/Bank Transfer (NO LOGIN REQUIRED)
- **Admin**: Login to dashboard, manage products, orders, update shipping status, send notifications

---

## User Roles & Authentication

| Role | Access | Authentication |
|------|--------|----------------|
| **Customer** | Store, Cart, Checkout, Order Tracking | **None** (Guest checkout) |
| **Admin** | Admin Dashboard, Product Management, Order Management | Email/Password login |

### Routing
- `/` → Home (public)
- `/store`, `/product/:slug`, `/cart` → Customer pages (public)
- `/checkout` → Fill customer & billing details (public)
- `/order/:orderNumber` → Track order by order number (public)
- `/admin/login` → Admin login
- `/admin/*` → Admin dashboard (requires admin auth)

---

## Customer Flow (No Login)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Browse      │     │  Add to      │     │  Checkout    │     │  Order       │
│  Products    │────▶│  Cart        │────▶│  (Details)   │────▶│  Confirmed   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │                      │
                                                ▼                      ▼
                                          ┌──────────────┐     ┌──────────────┐
                                          │  Customer    │     │  Track Order │
                                          │  Details     │     │  by Number   │
                                          │  - Name      │     └──────────────┘
                                          │  - Phone     │
                                          │  - Email     │
                                          │  - Address   │
                                          └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Billing     │
                                          │  Details     │
                                          │  - COD       │
                                          │  - Bank      │
                                          │    Transfer  │
                                          │  - Upload    │
                                          │    Slip      │
                                          └──────────────┘
```

### Cart Storage
- Cart stored in **localStorage** (browser)
- No database cart for guests
- Cart data sent with order at checkout

---

## ER Diagram (Simplified - No Customer Auth)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BELLARA ER DIAGRAM                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                              ┌──────────────────┐
│    ADMIN     │                              │     CATEGORY     │
├──────────────┤                              ├──────────────────┤
│ PK id        │                              │ PK id            │
│    email     │                              │    name          │
│    password  │                              │    slug          │
│    name      │                              │    image         │
│    created_at│                              │    created_at    │
│    updated_at│                              │    updated_at    │
└──────────────┘                              └────────┬─────────┘
                                                       │
                                                       │
                                              ┌────────┴─────────┐
                                              │     PRODUCT      │
                                              ├──────────────────┤
                                              │ PK id            │
                                              │ FK category_id   │
                                              │    name          │
                                              │    slug          │
                                              │    description   │
                                              │    price         │
                                              │    original_price│
                                              │    stock         │
                                              │    is_active     │
                                              │    created_at    │
                                              │    updated_at    │
                                              └────────┬─────────┘
                                                       │
                                                       │
                                              ┌────────┴─────────┐
                                              │  PRODUCT_IMAGE   │
                                              ├──────────────────┤
                                              │ PK id            │
                                              │ FK product_id    │
                                              │    image_path    │
                                              │    is_primary    │
                                              │    sort_order    │
                                              │    created_at    │
                                              └──────────────────┘


┌──────────────────┐       ┌──────────────────┐
│      ORDER       │       │   ORDER_ITEM     │
├──────────────────┤       ├──────────────────┤
│ PK id            │       │ PK id            │
│    order_number  │       │ FK order_id      │
│    status        │       │ FK product_id    │
│    subtotal      │       │    product_name  │ (snapshot)
│    shipping_fee  │       │    product_price │ (snapshot)
│    total         │       │    product_image │ (snapshot)
│                  │       │    quantity      │
│  # Customer Info │       │    total         │
│    customer_name │       │    created_at    │
│    customer_phone│       └──────────────────┘
│    customer_email│
│                  │
│  # Shipping Addr │
│    shipping_street│
│    shipping_district│
│    shipping_city │
│    shipping_country│
│                  │
│  # Payment       │
│    payment_method│
│    payment_status│
│                  │
│  # Tracking      │
│    tracking_code │
│    courier_name  │
│    notes         │
│    created_at    │
│    updated_at    │
└────────┬─────────┘
         │
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│  PAYMENT_PROOF   │       │  ORDER_STATUS    │
├──────────────────┤       │    _HISTORY      │
│ PK id            │       ├──────────────────┤
│ FK order_id      │       │ PK id            │
│    image_path    │       │ FK order_id      │
│    bank_name     │       │ FK admin_id      │
│    transfer_date │       │    status        │
│    amount        │       │    note          │
│    created_at    │       │    created_at    │
└──────────────────┘       └──────────────────┘
```

---

## Entity Details

### 1. ADMIN
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- name: String
- created_at: DateTime
- updated_at: DateTime
```

### 2. CATEGORY
```sql
- id: UUID (Primary Key)
- name: String
- slug: String (Unique)
- image: String (Optional)
- created_at: DateTime
- updated_at: DateTime
```

### 3. PRODUCT
```sql
- id: UUID (Primary Key)
- category_id: UUID (Foreign Key → Category)
- name: String
- slug: String (Unique)
- description: Text
- price: Decimal(10,2)
- original_price: Decimal(10,2) (Optional, for discounts)
- stock: Integer
- is_active: Boolean (Default: true)
- created_at: DateTime
- updated_at: DateTime
```

### 4. PRODUCT_IMAGE
```sql
- id: UUID (Primary Key)
- product_id: UUID (Foreign Key → Product)
- image_path: String (e.g., "products/bag-001.jpg")
- is_primary: Boolean (Default: false)
- sort_order: Integer (Default: 0)
- created_at: DateTime
```

### 5. ORDER
```sql
- id: UUID (Primary Key)
- order_number: String (Unique, e.g., "BLR-20240315-001")
- status: Enum (PENDING, CONFIRMED, PROCESSING, PACKAGED, SHIPPED, DELIVERED, CANCELLED)

# Customer Details (captured at checkout)
- customer_name: String
- customer_phone: String
- customer_email: String

# Shipping Address
- shipping_street: String
- shipping_district: String
- shipping_city: String
- shipping_country: String

# Order Totals
- subtotal: Decimal(10,2)
- shipping_fee: Decimal(10,2)
- total: Decimal(10,2)

# Payment
- payment_method: Enum (CASH_ON_DELIVERY, BANK_TRANSFER)
- payment_status: Enum (PENDING, PAID, FAILED, REFUNDED)

# Tracking (added by admin)
- tracking_code: String (Optional)
- courier_name: String (Optional)
- notes: Text (Optional)

- created_at: DateTime
- updated_at: DateTime
```

### 6. ORDER_ITEM
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → Order)
- product_id: UUID (Foreign Key → Product)
- product_name: String (Snapshot)
- product_price: Decimal(10,2) (Snapshot)
- product_image: String (Snapshot of primary image)
- quantity: Integer
- total: Decimal(10,2)
- created_at: DateTime
```

### 7. PAYMENT_PROOF
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → Order)
- image_path: String (e.g., "receipts/BLR-20240315-001.jpg")
- bank_name: String (Optional)
- transfer_date: DateTime (Optional)
- amount: Decimal(10,2) (Optional)
- created_at: DateTime
```

### 8. ORDER_STATUS_HISTORY
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → Order)
- admin_id: UUID (Foreign Key → Admin)
- status: Enum (Same as Order.status)
- note: String (Optional)
- created_at: DateTime
```

---

## Order Status Flow

```
┌─────────┐     Customer      ┌───────────┐     Admin       ┌────────────┐
│ PENDING │ ───places order───▶│ CONFIRMED │ ───confirms────▶│ PROCESSING │
└─────────┘                    └───────────┘                 └─────┬──────┘
     │                               │                             │
     │ (Bank Transfer:               │                             │
     │  upload slip)                 ▼                             ▼
     │                         Email sent:               ┌──────────────┐
     │                         "Order Confirmed"         │   PACKAGED   │
     │                                                   └──────┬───────┘
     │                                                          │
     │                                                          ▼
     │                                                   ┌──────────────┐
     │                                                   │   SHIPPED    │
     │                                                   └──────┬───────┘
     │                                                          │
     │                                    Admin adds tracking   │
     │                                    code & courier name   │
     │                                                          ▼
     │                                                   Email sent:
     │                                                   "Order Shipped"
     │                                                   + tracking code
     │                                                          │
     │                                                          ▼
     │                                                   ┌──────────────┐
     └──────────────── CANCELLED ◀───────────────────────│  DELIVERED   │
                       (by admin)                        └──────────────┘
                                                                │
                                                                ▼
                                                         Email sent:
                                                         "Order Delivered"
```

### Email Triggers
| Status Change | Email Sent | Content |
|---------------|------------|---------|
| → CONFIRMED | Order Confirmation | Order number, items, total, estimated delivery |
| → SHIPPED | Shipping Notification | Tracking code, courier name, tracking link |
| → DELIVERED | Delivery Confirmation | Thank you message |

---

## Checkout Flow Details

### Step 1: Customer Details Form
```
┌─────────────────────────────────────────┐
│          CUSTOMER DETAILS               │
├─────────────────────────────────────────┤
│  Full Name *          [_______________] │
│  Phone Number *       [_______________] │
│  Email *              [_______________] │
│                                         │
│  Country *            [_Sri Lanka____▼] │
│  Street Address *     [_______________] │
│  District *           [_______________] │
│  Town/City *          [_______________] │
│                                         │
│  Order Notes          [_______________] │
│  (optional)           [_______________] │
│                                         │
│                    [Continue to Billing]│
└─────────────────────────────────────────┘
```

### Step 2: Billing Details Form
```
┌─────────────────────────────────────────┐
│          BILLING DETAILS                │
├─────────────────────────────────────────┤
│  Order Summary                          │
│  ─────────────────────────────────────  │
│  Bellara Classic Tote x2    Rs. 45,000  │
│  Bellara Mini Bag x1        Rs. 18,000  │
│  ─────────────────────────────────────  │
│  Subtotal                   Rs. 63,000  │
│  Shipping                   Rs.    500  │
│  ─────────────────────────────────────  │
│  Total                      Rs. 63,500  │
│                                         │
│  Payment Method *                       │
│  ○ Cash on Delivery (COD)               │
│  ○ Bank Transfer                        │
│                                         │
│  [If Bank Transfer selected:]           │
│  ┌─────────────────────────────────┐    │
│  │ Bank Details:                   │    │
│  │ Bank: Commercial Bank           │    │
│  │ Account: 1234567890             │    │
│  │ Name: Bellara (Pvt) Ltd         │    │
│  │                                 │    │
│  │ Upload Payment Slip *           │    │
│  │ [Choose File] receipt.jpg       │    │
│  │                                 │    │
│  │ Bank Name     [______________]  │    │
│  │ Transfer Date [______________]  │    │
│  │ Amount        [______________]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│                       [Place Order]     │
└─────────────────────────────────────────┘
```

### Step 3: Order Confirmation
```
┌─────────────────────────────────────────┐
│         ORDER CONFIRMED ✓               │
├─────────────────────────────────────────┤
│                                         │
│  Thank you for your order!              │
│                                         │
│  Order Number: BLR-20240315-001         │
│                                         │
│  We've sent a confirmation email to     │
│  your email address.                    │
│                                         │
│  [Track Your Order]  [Continue Shopping]│
│                                         │
└─────────────────────────────────────────┘
```

---

## Order Tracking (Public)

Customer can track order by entering order number:

```
┌─────────────────────────────────────────┐
│          TRACK YOUR ORDER               │
├─────────────────────────────────────────┤
│                                         │
│  Order Number    [BLR-20240315-001]     │
│                                         │
│                          [Track Order]  │
└─────────────────────────────────────────┘

                    ▼

┌─────────────────────────────────────────┐
│     ORDER: BLR-20240315-001             │
├─────────────────────────────────────────┤
│                                         │
│  Status: SHIPPED                        │
│  Tracking: EMS123456789LK               │
│  Courier: Sri Lanka Post                │
│                                         │
│  Timeline:                              │
│  ● Mar 15, 10:30 - Order Placed         │
│  ● Mar 15, 14:00 - Order Confirmed      │
│  ● Mar 16, 09:00 - Processing           │
│  ● Mar 16, 16:00 - Packaged             │
│  ● Mar 17, 10:00 - Shipped              │
│  ○ Delivered (pending)                  │
│                                         │
│  Items:                                 │
│  - Bellara Classic Tote x2              │
│  - Bellara Mini Bag x1                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## File Storage Structure

```
server/
├── assets/
│   ├── products/           # Product images
│   │   ├── prod-uuid-1.jpg
│   │   ├── prod-uuid-2.jpg
│   │   └── ...
│   └── receipts/           # Payment proof uploads
│       ├── BLR-20240315-001.jpg
│       └── ...
```

---

## API Endpoints

### Public Endpoints (No Auth)
```
GET    /api/products                    # List products (with filters, pagination)
GET    /api/products/:slug              # Get product details
GET    /api/categories                  # List categories

POST   /api/orders                      # Create order (checkout)
GET    /api/orders/:orderNumber/track   # Track order by order number
POST   /api/orders/:orderNumber/payment # Upload payment proof (bank transfer)
```

### Admin Endpoints (Auth Required)
```
POST   /api/admin/login                 # Admin login
POST   /api/admin/logout                # Admin logout
GET    /api/admin/me                    # Get current admin

# Dashboard
GET    /api/admin/dashboard             # Stats overview

# Products
GET    /api/admin/products              # List all products
POST   /api/admin/products              # Create product
GET    /api/admin/products/:id          # Get product
PATCH  /api/admin/products/:id          # Update product
DELETE /api/admin/products/:id          # Delete product
POST   /api/admin/products/:id/images   # Upload product images
DELETE /api/admin/products/:id/images/:imageId  # Delete image

# Categories
GET    /api/admin/categories            # List categories
POST   /api/admin/categories            # Create category
PATCH  /api/admin/categories/:id        # Update category
DELETE /api/admin/categories/:id        # Delete category

# Orders
GET    /api/admin/orders                # List all orders (with filters)
GET    /api/admin/orders/:id            # Get order details
PATCH  /api/admin/orders/:id/status     # Update order status
PATCH  /api/admin/orders/:id/tracking   # Add/update tracking code
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [x] Initialize Express + TypeScript
- [ ] Set up Prisma with MySQL
- [ ] Create database schema (migrations)
- [ ] Set up file upload (multer)
- [ ] Admin authentication (JWT)
- [ ] Error handling middleware
- [ ] Create assets folders

### Phase 2: Product Management (Week 2)
- [ ] Admin: CRUD categories
- [ ] Admin: CRUD products
- [ ] Admin: Upload/delete product images
- [ ] Public: List products (filter, search, pagination)
- [ ] Public: Get product details

### Phase 3: Checkout & Orders (Week 3)
- [ ] Public: Create order (guest checkout)
- [ ] Public: Upload payment proof
- [ ] Public: Track order by number
- [ ] Order number generation (BLR-YYYYMMDD-XXX)

### Phase 4: Admin Order Management (Week 4)
- [ ] Admin: List/filter orders
- [ ] Admin: View order details
- [ ] Admin: Update order status
- [ ] Admin: Add tracking code
- [ ] Order status history

### Phase 5: Email Notifications (Week 5)
- [ ] Set up Nodemailer
- [ ] Order confirmation email
- [ ] Shipping notification email
- [ ] Delivery confirmation email

### Phase 6: Frontend Integration (Week 6-7)
- [ ] Connect React frontend to API
- [ ] Cart (localStorage)
- [ ] Checkout pages
- [ ] Order tracking page
- [ ] Admin dashboard
- [ ] Testing & bug fixes

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Database** | MySQL 8.0 |
| **ORM** | Prisma |
| **Backend** | Express + TypeScript |
| **Authentication** | JWT (Admin only) |
| **File Upload** | Multer |
| **Email** | Nodemailer |
| **Validation** | Zod |
| **Frontend** | React + TypeScript (existing) |
| **Cart Storage** | localStorage (browser) |

---

## Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/bellara"

# JWT (Admin only)
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development
CLIENT_URL="http://localhost:8080"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Bellara <noreply@bellara.com>"

# File Upload
UPLOAD_DIR="./assets"
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

---

## Security Considerations

1. **Admin Password**: bcrypt with salt rounds = 12
2. **JWT**: HTTP-only cookies for admin sessions
3. **Input Validation**: Zod schemas for all inputs
4. **File Upload**: Validate MIME types, size limits
5. **SQL Injection**: Prisma ORM handles parameterization
6. **CORS**: Allow only client origin
7. **Rate Limiting**: On order creation, payment upload
8. **Order Tracking**: Only show limited info (no customer details)

---

## Next Steps

1. Set up Prisma and create schema
2. Run migrations to create database tables
3. Seed initial admin user
4. Create assets folders
5. Implement admin authentication
6. Build out API incrementally per phases above
