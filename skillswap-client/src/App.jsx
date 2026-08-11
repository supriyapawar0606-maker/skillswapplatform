import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ToastProvider } from "./components/Toast";
import { NotificationProvider } from "./context/NotificationContext";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ======================================================
// Public Pages
// ======================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import About from "./pages/About";

// ======================================================
// Dashboard Pages
// ======================================================

import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import MySkills from "./pages/MySkills";
import SwapRequests from "./pages/SwapRequests";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import AddReview from "./pages/AddReview";
import Bookmarks from "./pages/Bookmarks";
import Settings from "./pages/Settings";
import Schedule from "./pages/Schedule";
import Workshops from "./pages/Workshops";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

// ======================================================
// Video Call
// ======================================================

import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>

        {/* =================================================
            NOTIFICATION PROVIDER

            IMPORTANT:
            This must wrap DashboardLayout because
            Sidebar uses useNotifications().
        ================================================= */}

        <NotificationProvider>

          <Routes>

            {/* =================================================
                PUBLIC WEBSITE
            ================================================= */}

            <Route element={<PublicLayout />}>

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/explore"
                element={<Explore />}
              />

              <Route
                path="/categories"
                element={<Categories />}
              />

              <Route
                path="/about"
                element={<About />}
              />

            </Route>

            {/* =================================================
                AUTH
            ================================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* =================================================
                PROTECTED ROUTES
            ================================================= */}

            <Route element={<ProtectedRoute />}>

              {/* =================================================
                  DASHBOARD LAYOUT
              ================================================= */}

              <Route element={<DashboardLayout />}>

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/dashboard/discover"
                  element={<Discover />}
                />

                <Route
                  path="/dashboard/profile"
                  element={<Profile />}
                />

                <Route
                  path="/dashboard/skills"
                  element={<MySkills />}
                />

                <Route
                  path="/dashboard/requests"
                  element={<SwapRequests />}
                />

                <Route
                  path="/dashboard/schedule"
                  element={<Schedule />}
                />

                <Route
                  path="/dashboard/workshops"
                  element={<Workshops />}
                />

                <Route
                  path="/dashboard/chat"
                  element={<Chat />}
                />

                <Route
                  path="/dashboard/notifications"
                  element={<Notifications />}
                />

                <Route
                  path="/dashboard/leaderboard"
                  element={<Leaderboard />}
                />

                <Route
                  path="/dashboard/reviews"
                  element={<Reviews />}
                />

                <Route
                  path="/dashboard/reviews/add"
                  element={<AddReview />}
                />

                <Route
                  path="/dashboard/bookmarks"
                  element={<Bookmarks />}
                />

                <Route
                  path="/dashboard/settings"
                  element={<Settings />}
                />

                <Route
                  path="/dashboard/admin"
                  element={<Admin />}
                />

              </Route>

              {/* =================================================
                  VIDEO CALL
                  Outside DashboardLayout
              ================================================= */}

              <Route
                path="/dashboard/video-call/:sessionId"
                element={<VideoCall />}
              />

              {/* =================================================
                  VIDEO CALL ALIAS
              ================================================= */}

              <Route
                path="/video-call/:sessionId"
                element={<VideoCall />}
              />

            </Route>

          </Routes>

        </NotificationProvider>

      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;