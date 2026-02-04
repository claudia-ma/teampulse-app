# TeamPulse

Web application for internal team management.

TeamPulse is a full-stack application designed to manage team tasks and roles through a clean and intuitive interface, with authentication and protected API access.

---

## ✨ Features
- Authentication with Laravel Sanctum
- Task management (list, filter, update status)
- Role-based access (admin / employee)
- Real-time UX feedback (loading states and errors)
- Clean and responsive UI

---

## 🧰 Tech Stack
- **Frontend:** Angular (standalone components)
- **Backend:** Laravel (REST API)
- **Authentication:** Laravel Sanctum
- **Database:** MySQL / SQLite
- **Styling:** Custom CSS

---

## 🔐 Demo credentials
Email: **admin@teampulse.com**  
Password: **password123**

---

## 🚀 Run TeamPulse locally

TeamPulse is split into two parts:
- **Backend (Laravel + REST API)**
- **Frontend (Angular)**

### 1️⃣ Backend
```bash
cd teampulse/teampulse-api
php artisan serve

### 2️⃣ Frontend
```bash
cd teampulse/teampulse-front
ng serve