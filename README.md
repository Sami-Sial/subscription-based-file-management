# SaaS File Management System

A full-featured **Subscription-Based File & Folder Management System** where storage capabilities are dynamically controlled by Admin-defined subscription packages.

---

## 🚀 Tech Stack

**Backend:**

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* Stripe (Payment Gateway + Webhooks)
* 2FA Authentication

**Frontend:**

* Next.js

---

# 📌 Project Overview

This project simulates a real-world SaaS storage product where different subscription tiers unlock different storage capabilities.
All storage rules are dynamically defined by the Admin and strictly enforced at the backend level on every request.

Users can manage folders and upload files based on the limits of their active subscription package.

---


# 🔐 Core Features

## 👨‍💼 Admin Panel

* Default seeded admin credentials
* Create, update, delete subscription packages
* Define package rules:

  * Max Folders
  * Max Nesting Level
  * Allowed File Types (Image, Video, PDF, Audio)
  * Max File Size (MB)
  * Total File Limit
  * Files Per Folder
* Admin Dashboard with analytics:

  * Total users
  * Active subscriptions
  * Files & folders count
  * Package distribution
  * Storage insights

---

## 👤 User Panel

### Authentication

* User Registration
* Login
* Email verification
* Password reset
* Logged-in user password update

### Subscription Management

* View available packages
* Subscribe / Upgrade / Downgrade
* Subscription history tracking

### 💳 Stripe Integration

* Stripe Checkout for paid packages
* Webhook handling for:

  * Payment confirmation
  * Automatic subscription activation
  * Subscription updates

---

## 📁 File & Folder Management

### Folder Features

* Create folders
* Create sub-folders
* Rename folders
* Delete folders
* Nesting limited by subscription package

### File Features

* Upload files (Image, Video, Audio, PDF)
* View files
* Download files
* Rename files
* Package-based validation on every upload

---

# ⚙️ Enforcement Logic

Every file and folder action checks the user's active subscription before proceeding.

### Folder Creation Checks

* Max Folders
* Max Nesting Level

### File Upload Checks

* Allowed File Types
* Max File Size
* Total File Limit
* Files Per Folder Limit

If a user switches packages:

* New limits apply going forward
* Existing files/folders are NOT deleted

---

# 📊 Dashboards

## Admin Dashboard

* User analytics
* Subscription analytics
* Storage metrics
* Tier distribution

## User Dashboard

* Active subscription details
* Storage usage
* Total folders and files
* Subscription status

---

# 🗄️ Database Design

* Well-structured relational schema
* Prisma ORM for type-safe queries
* Strong relationships between:

  * Users
  * Subscriptions
  * Packages
  * Folders
  * Files

All business rules are enforced at the backend service layer.

---

# 🛠️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Sami-Sial/subscription-based-file-management
cd subscription-based-file-management
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside backend folder:

```
PORT=
DATABASE_URL=

FRONTEND_URL=

STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

JWT_SECRET=

```

Run migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file inside client folder:

```
NEXT_PUBLIC_BACKEND_BASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Start frontend:

```bash
npm run dev
```

---

# 🌐 Deployment

Frontend and Backend can be deployed separately.

* Backend: Vercel / Render / Railway
* Frontend: Vercel / Netlify
* Database: PostgreSQL (Supabase / Neon / Railway)

---
