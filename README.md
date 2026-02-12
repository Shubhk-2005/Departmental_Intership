# Internship & Placement Management System

A comprehensive web application designed to streamline the internship and placement process for students, administrators, and alumni. This platform facilitates communication, manages opportunities, and tracks placement statistics effectively.

## 🚀 Features

### 🎓 For Students

- **Dashboard**: View relevant stats and upcoming opportunities.
- **Apply**: Easy application process for internships and placement drives.
- **Profile**: Manage personal and academic details.
- **Status Tracking**: Track the status of applications.

### 🛡️ For Admins

- **Management Console**: Post and manage new drives and internships.
- **Analytics**: Visual insights into placement records and yearly trends.
- **Student Management**: Verify documents and manage student records.
- **Notices**: Broadcast important announcements.

### 🤝 For Alumni

- **Alumni Directory**: Connect with other alumni and expand your network.
- **Profile**: Update professional achievements and higher studies details.
- **Stats**: View department placement statistics.
- **Off-Campus Placements**: Share your success stories.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

### Backend & Services

- **Server**: PHP 8.x (Works with built-in server or Apache/XAMPP)
- **Database**: [Firebase Firestore](https://firebase.google.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/) (for media/docs) & Firebase Storage

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v16+)
- **PHP** (v8.0+) - via XAMPP or standalone
- **Composer** (PHP dependency manager)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Departmental_Intership
```

### Step 2: Install Dependencies

**Frontend:**

```bash
cd frontend
npm install
cd ..
```

**Backend:**

```bash
cd backend-php
composer install
cd ..
```

### Step 3: Environment Configuration

Create a `.env` file in the **project root** directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend URL (for frontend to connect to PHP)
VITE_API_URL=http://127.0.0.1:8000/api

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🏃 Running the Project

### Option A: One-Click Start (Recommended)

**🍎 macOS / Linux:**
Run the startup script in terminal:

```bash
./start-dev.sh
```

_(You may need to run `chmod +x start-dev.sh` first)_

**🪟 Windows:**
Double-click `start-dev.bat` or run in CMD:

```cmd
start-dev.bat
```

Use `http://localhost:8080` (or the port shown) to access the application.

### Option B: Manual Start

**1. Start PHP Backend:**

```bash
cd backend-php
php -S 127.0.0.1:8000 router.php
```

**2. Start React Frontend:**
(Open a new terminal)

```bash
cd frontend
npm run dev
```

---

## 📁 Project Structure

```
├── frontend/           # React + Vite frontend
├── backend-php/        # PHP backend source code
    ├── config/         # Configuration (Cloudinary, Firebase)
    ├── routes/         # API Endpoint definitions
    ├── services/       # Business logic services
    ├── router.php      # Main entry point for PHP server
├── .env                # Environment variables
└── README.md           # This file
```

## 📄 License

This project is licensed under the ISC License.
