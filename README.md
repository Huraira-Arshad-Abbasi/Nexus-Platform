# Nexus — Investor & Entrepreneur Collaboration Platform

A full-stack web application that connects investors and entrepreneurs, enabling them to collaborate, schedule meetings, share documents, and manage investments.

## 🚀 Live Demo
Wil be added soon

---

## 📌 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## Overview

Nexus is a platform where **entrepreneurs** can showcase their startups and connect with **investors** who are looking for investment opportunities. The platform provides tools for real-time communication, document management, meeting scheduling, video calling, and payment processing.

---

## ✨ Features

### Authentication & Profiles
- JWT-based secure authentication
- Role-based access (Entrepreneur / Investor)
- Extended profile management stored in MongoDB
- Password hashing with bcrypt
- Forgot/Reset password flow

### Meeting Scheduling
- Schedule meetings between investors and entrepreneurs
- Accept / Reject / Cancel meetings
- Conflict detection (no double booking)
- Join video call directly from meeting

### Video Calling
- WebRTC peer-to-peer video calling
- Socket.IO signaling server
- Toggle audio/video
- Real-time connection status

### Document Chamber (Entrepreneur)
- Upload documents (PDF, DOCX, images)
- Cloud storage via Cloudinary
- Document preview
- E-signature via canvas drawing
- Download documents

### Payments
- Stripe sandbox integration
- Deposit funds (real Stripe test card flow)
- Withdraw funds (mock)
- Transfer funds between users
- Full transaction history with status

### Security
- Helmet security headers
- Rate limiting on auth routes
- Form validation & sanitization (express-validator)
- XSS prevention
- 2FA OTP via Nodemailer (Gmail)
- Role-based route protection

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Tailwind CSS | Styling |
| Socket.IO Client | WebSocket connection |
| Stripe.js | Payment UI |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.IO | WebRTC signaling |
| Multer + Cloudinary | File uploads |
| Stripe | Payment processing |
| Nodemailer | OTP emails |
| express-validator | Input validation |
| express-rate-limit | Rate limiting |
| Helmet | Security headers |

---

## 📁 Project Structure
nexus/
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.ts        # Axios instance + interceptors
│   │   │   └── api.ts          # All API calls
│   │   ├── components/
│   │   │   ├── layout/         # DashboardLayout, Sidebar
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx  # Auth state + provider
│   │   │   └── useAuth.ts       # Auth hook
│   │   ├── hooks/
│   │   │   └── useWebRTC.ts     # WebRTC logic
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register
│   │   │   ├── dashboard/       # Entrepreneur & Investor dashboards
│   │   │   ├── profile/         # Entrepreneur & Investor profiles
│   │   │   ├── meetings/        # Meetings + Schedule modal
│   │   │   ├── video/           # Video call page
│   │   │   ├── documents/       # Documents + Signature modal
│   │   │   ├── deals/           # Payments + modals
│   │   │   └── settings/        # Profile & Security settings
│   │   └── types/
│   │       └── index.ts         # TypeScript interfaces
│   └── package.json
│
└── backend/                    # Node.js + Express
├── config/
│   ├── db.js               # MongoDB connection
│   ├── cloudinary.js       # Cloudinary setup
│   └── mailer.js           # Nodemailer setup
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── meeting.controller.js
│   ├── document.controller.js
│   └── payment.controller.js
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── role.middleware.js   # Role-based access
│   ├── validation.js        # Input validation rules
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── User.model.js
│   ├── Meeting.model.js
│   ├── Document.model.js
│   ├── Transaction.model.js
│   └── Wallet.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── meeting.routes.js
│   ├── document.routes.js
│   └── payment.routes.js
├── socket/
│   └── videoSignaling.js   # Socket.IO WebRTC signaling
└── server.js

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Stripe account (free test mode)
- Gmail account with App Password

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/nexus.git
cd nexus
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Email (Gmail App Password)
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

Start frontend:
```bash
npm run dev
```

### 4. Open in browser

[text](http://localhost:5173)

---

## 🔐 Environment Variables

### Backend `/backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `FRONTEND_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `EMAIL_USER` | Gmail address for OTP emails |
| `EMAIL_PASS` | Gmail App Password |

### Frontend `/frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test mode) |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ |
| POST | `/api/auth/send-otp` | Send OTP to email | ✅ |
| POST | `/api/auth/verify-otp` | Verify OTP | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | Get all users | ✅ |
| GET | `/api/users/:id/profile` | Get user profile | ✅ |
| PUT | `/api/users/:id/profile` | Update user profile | ✅ |

### Meetings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/meetings` | Get all user meetings | ✅ |
| POST | `/api/meetings` | Schedule new meeting | ✅ |
| PATCH | `/api/meetings/:id/status` | Accept/Reject/Cancel | ✅ |
| DELETE | `/api/meetings/:id` | Delete meeting | ✅ |

### Documents
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/documents` | Get all documents | ✅ |
| POST | `/api/documents/upload` | Upload document | ✅ |
| DELETE | `/api/documents/:id` | Delete document | ✅ |
| POST | `/api/documents/:id/signature` | Attach e-signature | ✅ |

### Payments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/payments/wallet` | Get wallet balance | ✅ |
| GET | `/api/payments/transactions` | Get transaction history | ✅ |
| POST | `/api/payments/deposit` | Create deposit intent | ✅ |
| POST | `/api/payments/deposit/confirm` | Confirm deposit | ✅ |
| POST | `/api/payments/withdraw` | Withdraw funds | ✅ |
| POST | `/api/payments/transfer` | Transfer to user | ✅ |

---

## 👨‍💻 Developer

**Huraira Arshad**
Full Stack Development Intern
Nexus Platform — 3 Week Internship Project
Deadline: May 25, 2026

---

## 📝 License
This project was built as part of an internship assignment.