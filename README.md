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
- **Mentorship**: (Future Scope) Guide current students.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State/Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend & Services

- **Server**: PHP 8.x on XAMPP/Apache
- **Database**: [Firebase Firestore](https://firebase.google.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/)
- **File Storage**: [Firebase Storage](https://firebase.google.com/)

---

## 📦 Installation & Setup (First Time Only)

### Prerequisites

- [XAMPP](https://www.apachefriends.org/) installed
- [Node.js](https://nodejs.org/) installed

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Departmental_Intership
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 3: Setup PHP Backend

#### 🍎 Mac Instructions

```bash
# Copy backend-php to XAMPP htdocs
sudo cp -r backend-php /Applications/XAMPP/htdocs/internship-api

# Set permissions
sudo chmod -R 755 /Applications/XAMPP/htdocs/internship-api

# Install PHP dependencies
cd /Applications/XAMPP/htdocs/internship-api
curl -sS https://getcomposer.org/installer | /Applications/XAMPP/xamppfiles/bin/php
/Applications/XAMPP/xamppfiles/bin/php composer.phar install --ignore-platform-req=ext-sodium
```

#### 🪟 Windows Instructions

1.  **Copy backend-php folder**:

    - Open File Explorer
    - Copy the `backend-php` folder
    - Paste it to: `C:\xampp\htdocs\`
    - Rename the pasted folder to `internship-api`

2.  **Install PHP dependencies**:

    - Open Command Prompt (cmd) as Administrator
    - Run these commands:

    ```cmd
    cd C:\xampp\htdocs\internship-api

    # Download Composer
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php
    php -r "unlink('composer-setup.php');"

    # Install dependencies
    php composer.phar install --ignore-platform-req=ext-sodium
    ```

### Step 4: Configure Environment

Create/edit `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost/internship-api/api
```

---

## 🏃 Running the Project

### Step 1: Start XAMPP

1.  Open **XAMPP Control Panel**
2.  Click **Start** next to **Apache**
3.  Wait until it shows green "Running"

### Step 2: Test Backend (Optional)

Open browser and visit: `http://localhost/internship-api/`

Expected output:

```json
{ "message": "Internship Portal PHP Backend API", "status": "running" }
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

### Step 4: Open in Browser

Visit: **http://localhost:8080** (or the URL shown in terminal)

---

## 📁 Project Structure

```
├── frontend/           # React + Vite frontend
├── backend-php/        # PHP backend source code
├── backend/            # (Legacy) Node.js backend
├── .env                # Environment variables
└── README.md           # This file
```

---

## 🔄 Updating PHP Backend

If you make changes to `backend-php/`, copy the updated files to XAMPP:

**Mac:**

```bash
sudo cp -r backend-php/* /Applications/XAMPP/htdocs/internship-api/
```

**Windows:**

- Manually copy files from `backend-php` to `C:\xampp\htdocs\internship-api\`

---

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
