
import { useState } from "react";
import {
  Outlet,
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FiSearch,
  FiBell,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export default function DashboardLayout() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { user, loading } = useAuth();
  const { unreadCount } = useNotifications();

  // ==========================================
  // Search
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      return;
    }

    navigate(
      `/dashboard/discover?q=${encodeURIComponent(value)}`
    );
  };

  // ==========================================
  // Authentication Loading
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7fc]">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // No User
  // ==========================================

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7fc]">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <Sidebar />


      {/* ======================================
          MAIN AREA
      ====================================== */}

      <div className="flex-1 min-w-0">

        {/* ====================================
            TOP HEADER
        ==================================== */}

        <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">

          {/* ==================================
              SEARCH
          ================================== */}

          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-full max-w-xs"
          >
            <FiSearch
              className="text-gray-400"
              size={16}
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search skills or people..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </form>


          {/* ==================================
              HEADER RIGHT
          ================================== */}

          <div className="flex items-center gap-4 ml-auto">

            {/* =================================
                NOTIFICATIONS
            ================================= */}

            <Link
              to="/dashboard/notifications"
              className="relative text-gray-500 hover:text-brand-600 transition-colors"
              aria-label="Notifications"
            >
              <FiBell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>


            {/* =================================
                USER PROFILE
            ================================= */}

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2"
            >

              <Avatar
                name={
                  user.fullName ||
                  user.name ||
                  "User"
                }
                size={36}
              />

              <div className="hidden sm:block">

                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {user.fullName ||
                    user.name ||
                    "User"}
                </p>

                {user.role && (
                  <p className="text-[11px] text-gray-400 capitalize">
                    {user.role}
                  </p>
                )}

              </div>

            </Link>

          </div>

        </header>


        {/* ====================================
            PAGE CONTENT
        ==================================== */}

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
