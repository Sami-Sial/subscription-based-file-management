# Cloud Drive Saas

A full-featured **Subscription-Based File & Folder Management System** where storage capabilities are dynamically controlled by Admin-defined subscription packages.

---

## 🚀 Tech Stack

**Backend:**

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Stripe (Payment Gateway + Webhooks)
- 2FA Authentication

**Frontend:**

- Next.js

---

# 📌 Project Overview

This project simulates a real-world SaaS storage product where different subscription tiers unlock different storage capabilities.
All storage rules are dynamically defined by the Admin and strictly enforced at the backend level on every request.

Users can manage folders and upload files based on the limits of their active subscription package.

---

# 🔐 Core Features

## 👨‍💼 Admin Panel

- Default seeded admin credentials
- Create, update, delete subscription packages
- Define package rules:
  - Max Folders
  - Max Nesting Level
  - Allowed File Types (Image, Video, PDF, Audio)
  - Max File Size (MB)
  - Total File Limit
  - Files Per Folder

- Admin Dashboard with analytics:
  - Total users
  - Active subscriptions
  - Files & folders count
  - Package distribution
  - Storage insights

---

## 👤 User Panel

### Authentication

- User Registration
- Login
- Email verification
- Password reset
- Logged-in user password update

### Subscription Management

- View available packages
- Subscribe / Upgrade / Downgrade
- Subscription history tracking

### 💳 Stripe Integration

- Stripe Checkout for paid packages
- Webhook handling for:
  - Payment confirmation
  - Automatic subscription activation
  - Subscription updates

---

## 📁 File & Folder Management

### Folder Features

- Create folders
- Create sub-folders
- Rename folders
- Delete folders
- Nesting limited by subscription package

### File Features

- Upload files (Image, Video, Audio, PDF)
- View files
- Download files
- Rename files
- Package-based validation on every upload

---

# ⚙️ Enforcement Logic

Every file and folder action checks the user's active subscription before proceeding.

### Folder Creation Checks

- Max Folders
- Max Nesting Level

### File Upload Checks

- Allowed File Types
- Max File Size
- Total File Limit
- Files Per Folder Limit

If a user switches packages:

- New limits apply going forward
- Existing files/folders are NOT deleted

---

# 📊 Dashboards

## Admin Dashboard

- User analytics
- Subscription analytics
- Storage metrics
- Tier distribution

## User Dashboard

- Active subscription details
- Storage usage
- Total folders and files
- Subscription status

---

# 🗄️ Database Design

- Well-structured relational schema
- Prisma ORM for type-safe queries
- Strong relationships between:
  - Users
  - Subscriptions
  - Packages
  - Folders
  - Files

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

- Backend: Vercel / Render / Railway
- Frontend: Vercel / Netlify
- Database: PostgreSQL (Supabase / Neon / Railway)

---

# 📱 Mobile Apps (Android & iOS)

This project includes fully functional mobile applications for Android and iOS using **Capacitor**. The mobile apps bundle the statically exported Next.js frontend into a native app shell.

## 🛠️ Mobile Setup

1. **Build the Next.js Client**
   Before running the mobile app, you must build the client into the `out` directory:

   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Sync with Capacitor**
   Copy the web assets into the native mobile folders:
   ```bash
   cd ../mobile
   npm install
   npx cap sync
   ```

## 💻 Opening in Native IDEs

If you want to run the apps locally on emulators or real devices, you can open the native projects directly:

**For Android (Requires Android Studio):**

```bash
cd mobile
npx cap open android
```

_This will launch Android Studio. From there, you can click the "Run" button to build and test the APK._

**For iOS (Requires macOS & Xcode):**

```bash
cd mobile
npx cap open ios
```

_This will launch Xcode. Select your simulator or connected iPhone and hit "Run". Note that running on a physical iPhone requires an Apple Developer Account._

## ☁️ Cloud Builds (GitHub Actions)

If you don't want to install Android Studio or Xcode locally, this repository comes pre-configured with a **GitHub Actions Workflow** (`mobile-build.yml`) to build the apps in the cloud.

Whenever you push to the `main` branch, the workflow will automatically:

1. Build the Next.js `client`.
2. Sync the assets to the `mobile` folder.
3. Build the Android APK (`app-debug.apk`).
4. Build the iOS Simulator App (`ios-app-simulator`).

You can download these directly from the **Actions > Artifacts** tab on GitHub!

---
