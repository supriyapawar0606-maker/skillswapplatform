# 🔄 SkillSwap — Skill Exchange Platform

> **Learn. Share. Grow.**
> A modern skill-exchange platform where users can teach their skills, learn from others, and connect through meaningful skill swaps.

---

## 📌 About The Project

**SkillSwap** is a full-stack web application designed to connect people who want to **learn new skills and share their knowledge**.

Instead of paying for courses, users can exchange their knowledge with each other. For example, one user can teach **React Development** while learning **Music, Designing, Programming, or another skill** from someone else.

The platform provides a complete environment for discovering users, managing skills, sending swap requests, scheduling sessions, messaging, notifications, reviews, bookmarks, and tracking progress.

---

## ✨ Key Features

### 🌐 Public Website

* Modern responsive landing page
* Explore skills
* Browse skill categories
* About SkillSwap
* Login and Sign Up
* Professional and clean UI

### 👤 User Management

* User registration
* User login
* Authentication
* User profile
* Profile editing
* Location information
* Profile sharing

### 🛠️ Skill Management

* Add new skills
* Select skill category
* Add skill description
* Set skill level
* Set availability
* Search and manage personal skills

### 🔍 Explore Skills

* Search skills
* Search users
* Browse categories
* Popular skills
* Trending skills
* Newest skills
* Filters
* Location-based discovery

### 🔄 Skill Swap

* Send swap requests
* Receive swap requests
* Accept requests
* Reject requests
* Cancel requests
* Track sent and received requests
* View swap status

### 📅 Session Scheduling

* Schedule skill-exchange sessions
* Select accepted swap
* Choose topic
* Select day
* Select available time
* Select session duration
* View upcoming sessions

### 💬 Messaging

* User-to-user messaging
* Real-time communication
* Chat interface
* Notifications for new activity

### 🔔 Notifications

* Swap request notifications
* Message notifications
* Activity notifications
* Notification management

### 🏆 Gamification

* Skill points
* User levels
* Leaderboard
* Completed swap tracking
* Reviews and ratings

### ⭐ Reviews & Ratings

* Review users
* Give ratings
* Display user ratings
* Track review points

### 🔖 Bookmarks

* Bookmark useful skills/users
* Manage saved content

---

## 🖥️ Main Screens

### Public Pages

* Home
* Explore Skills
* Categories
* About Us
* Login
* Registration

### User Dashboard

* Dashboard
* Discover Users
* My Profile
* My Skills
* Swap Requests
* Schedule
* Workshops
* Messages
* Notifications
* Leaderboard
* Bookmarks
* Reviews
* Settings

---

## 🎨 UI Design

SkillSwap uses a modern, clean interface focused on usability.

### Design Highlights

* 💜 Primary Purple Theme
* 🤍 Clean White Cards
* 🌫️ Soft Light Background
* 🖤 Dark Professional Typography
* ✨ Rounded Components
* 📱 Responsive Layout
* 🎯 Clear Navigation
* ⚡ Interactive Dashboard

The application maintains a consistent design system across the public website, authentication pages, and user dashboard.

---

## 🏗️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* React Router
* Axios
* Lucide React Icons

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Socket.IO

### Database

* MongoDB
* Mongoose

### Development Tools

* VS Code
* Git
* GitHub
* npm
* Postman

---

## 🧩 System Architecture

```text
                    ┌─────────────────────┐
                    │      SkillSwap      │
                    │     Web Platform    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐           ┌────────▼────────┐
        │ React Frontend │           │ Node/Express API │
        └───────┬────────┘           └────────┬────────┘
                │                             │
                │                    ┌────────▼────────┐
                │                    │    MongoDB      │
                │                    │    Database     │
                │                    └─────────────────┘
                │
        ┌───────▼────────┐
        │   Socket.IO    │
        │ Real-time Chat │
        └────────────────┘
```

---

## 🔐 Authentication

SkillSwap uses authentication to protect user-specific functionality.

The authentication system includes:

* User Registration
* User Login
* JWT-based authentication
* Protected routes
* User session handling
* Secure password handling

---

## 📂 Project Structure

A simplified structure of the project:

```text
SkillSwap/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Explore/
│   │   │   ├── Categories/
│   │   │   ├── About/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── Dashboard/
│   │   │
│   │   ├── services/
│   │   ├── context/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

```bash
cd SkillSwap
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Add any additional environment variables required by your project.

### 5. Start Backend

```bash
npm start
```

or, if your project uses nodemon:

```bash
npm run dev
```

### 6. Start Frontend

Inside the `client` directory:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## 🌍 Deployment

### Backend

The SkillSwap backend is deployed on Render:

**Backend API:**

https://skillswap-server-rqtg.onrender.com

### Frontend

Add your deployed frontend URL here:

```text
YOUR_FRONTEND_DEPLOYED_URL
```

---

## 🔗 Project Links

| Resource             | Link                                         |
| -------------------- | -------------------------------------------- |
| 🌐 Live Website      | `YOUR_FRONTEND_DEPLOYED_URL`                 |
| 💻 GitHub Repository | `YOUR_GITHUB_REPOSITORY_URL`                 |
| ⚙️ Backend API       | `https://skillswap-server-rqtg.onrender.com` |

---

## 🔄 How SkillSwap Works

```text
Register / Login
       ↓
Create Your Profile
       ↓
Add Your Skills
       ↓
Explore Other Users
       ↓
Find A Skill You Want To Learn
       ↓
Send Swap Request
       ↓
Request Accepted
       ↓
Schedule A Session
       ↓
Exchange Skills
       ↓
Complete Swap
       ↓
Give Review & Rating
       ↓
Earn Skill Points
```

---

## 📊 Dashboard

The SkillSwap dashboard provides users with an overview of their activity.

It displays:

* My Skills
* Swap Requests
* Completed Swaps
* Bookmarks
* Recent Swap Requests
* Skill Points
* User Level
* Trending Skills
* Suggestions

---

## 🏆 Leaderboard

The leaderboard encourages users to actively participate in the SkillSwap community.

Users can earn points through:

* Completing skill swaps
* Receiving reviews
* Participating in the platform

The leaderboard displays users according to their skill points.

---

## 🔒 Security

The application follows common web security practices including:

* JWT authentication
* Protected API routes
* Password hashing
* Environment variables
* Input validation
* Authentication middleware
* Restricted user-specific resources

**Never commit your `.env` file or secret keys to GitHub.**

---

## 📱 Responsive Design

SkillSwap is designed to provide a consistent experience across:

* 💻 Desktop
* 📱 Mobile
* 📟 Tablet

The UI uses responsive layouts and reusable components to maintain consistency throughout the application.

---

## 🎯 Project Goals

The main goals of SkillSwap are:

1. Make skill learning more accessible.
2. Encourage people to share their knowledge.
3. Build a community around learning.
4. Provide a platform for skill exchange without requiring payment.
5. Help users discover people with similar interests.
6. Encourage continuous learning through gamification.

---

## 🔮 Future Improvements

Possible future enhancements include:

* Video calling for skill sessions
* AI-based skill recommendations
* Advanced skill matching
* Email notifications
* Google authentication
* Calendar integration
* Advanced analytics
* Online workshops
* Skill verification
* Improved recommendation system
* Mobile application

---

## 👩‍💻 Developer

### SkillSwap Project

**Developed as a full-stack web application using the MERN stack.**

The project demonstrates practical implementation of:

* Frontend development
* Backend API development
* Database management
* Authentication
* Real-time communication
* REST APIs
* Responsive UI/UX
* Full-stack application architecture

---

## 📄 License

This project is developed for educational and project purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**SkillSwap — Learn. Share. Grow. 🔄**
