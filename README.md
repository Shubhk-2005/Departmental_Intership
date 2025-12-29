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

- **Server**: Node.js with Express (Backend folder)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Internshsip /Departmental_Intership"
   ```

2. **Install Dependencies**
   Run this once from the root directory to install dependencies for both Frontend and Backend:

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `frontend` directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the Application**

   **Recommended:** Run both Frontend and Backend with one command:

   ```bash
   npm run dev
   ```

   Or run them individually:

   _Start Frontend:_

   ```bash
   npm run dev:frontend
   ```

   _Start Backend:_

   ```bash
   npm run dev:backend
   ```

   _Build Frontend:_

   ```bash
   npm run build:frontend
   ```

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
