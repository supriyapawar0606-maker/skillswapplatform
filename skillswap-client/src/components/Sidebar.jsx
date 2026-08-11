import socket from "../socket/socket";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FiGrid,
  FiUsers,
  FiUser,
  FiTool,
  FiRepeat,
  FiMessageCircle,
  FiBell,
  FiStar,
  FiBookmark,
  FiSettings,
  FiLogOut,
  FiCalendar,
  FiAward,
  FiShield,
} from "react-icons/fi";

import Logo from "./Logo";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useNotifications,
} from "../context/NotificationContext";

import API from "../api/axios";


// ======================================================
// SIDEBAR ITEMS
// ======================================================

const items = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: FiGrid,
    end: true,
  },

  {
    to: "/dashboard/discover",
    label: "Discover Users",
    icon: FiUsers,
  },

  {
    to: "/dashboard/profile",
    label: "My Profile",
    icon: FiUser,
  },

  {
    to: "/dashboard/skills",
    label: "My Skills",
    icon: FiTool,
  },

  {
    to: "/dashboard/requests",
    label: "Swap Requests",
    icon: FiRepeat,
    badgeType: "swapRequests",
  },

  {
    to: "/dashboard/schedule",
    label: "Schedule",
    icon: FiCalendar,
  },

  {
    to: "/dashboard/workshops",
    label: "Workshops",
    icon: FiUsers,
  },

  {
    to: "/dashboard/chat",
    label: "Messages",
    icon: FiMessageCircle,
    badgeType: "messages",
  },

  {
    to: "/dashboard/notifications",
    label: "Notifications",
    icon: FiBell,
    badgeType: "notifications",
  },

  {
    to: "/dashboard/leaderboard",
    label: "Leaderboard",
    icon: FiAward,
  },

  {
    to: "/dashboard/bookmarks",
    label: "Bookmarks",
    icon: FiBookmark,
  },

  {
    to: "/dashboard/reviews",
    label: "Reviews",
    icon: FiStar,
  },

  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: FiSettings,
  },

  {
    to: "/dashboard/admin",
    label: "Admin",
    icon: FiShield,
    adminOnly: true,
  },
];


// ======================================================
// SIDEBAR
// ======================================================

export default function Sidebar() {

  const {
    logout,
    user,
  } = useAuth();


  const {
    unreadCount,
    loadUnreadCount,
  } = useNotifications();


  const navigate =
    useNavigate();


  // ====================================================
  // REAL COUNTS
  // ====================================================

  const [
    swapRequestCount,
    setSwapRequestCount,
  ] = useState(0);


  const [
    messageCount,
    setMessageCount,
  ] = useState(0);


  // ====================================================
  // LOAD SWAP REQUEST COUNT
  // ====================================================

  const loadSwapRequestCount =
    useCallback(async () => {

      if (!user) {
        setSwapRequestCount(0);
        return;
      }

      try {

        const response =
          await API.get(
            "/swaps/pending-count"
          );


        if (
          response.data?.success
        ) {

          setSwapRequestCount(
            Number(
              response.data.count
            ) || 0
          );

        } else {

          setSwapRequestCount(0);

        }

      } catch (error) {

        console.error(
          "Load swap request count error:",
          error.response?.data
            ?.message ||
            error.message
        );

        setSwapRequestCount(0);
      }

    }, [user]);


  // ====================================================
  // LOAD MESSAGE COUNT
  // ====================================================

  const loadMessageCount =
    useCallback(async () => {

      if (!user) {
        setMessageCount(0);
        return;
      }

      try {

        const response =
          await API.get(
            "/messages/unread-count"
          );


        if (
          response.data?.success
        ) {

          setMessageCount(
            Number(
              response.data.count
            ) || 0
          );

        } else {

          setMessageCount(0);

        }

      } catch (error) {

        console.error(
          "Load message count error:",
          error.response?.data
            ?.message ||
            error.message
        );

        setMessageCount(0);
      }

    }, [user]);


  // ====================================================
  // LOAD ALL COUNTS
  // ====================================================

  const loadAllCounts =
    useCallback(async () => {

      if (!user) {

        setSwapRequestCount(0);
        setMessageCount(0);

        return;
      }


      await Promise.all([
        loadSwapRequestCount(),
        loadMessageCount(),
        loadUnreadCount(),
      ]);

    }, [
      user,
      loadSwapRequestCount,
      loadMessageCount,
      loadUnreadCount,
    ]);


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {

    loadAllCounts();

  }, [loadAllCounts]);


  // ====================================================
  // AUTO REFRESH
  // ====================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    const interval =
      setInterval(() => {

        loadAllCounts();

      }, 30000);


    return () => {

      clearInterval(interval);

    };

  }, [
    user,
    loadAllCounts,
  ]);


  // ====================================================
  // REFRESH WHEN TAB GETS FOCUS
  // ====================================================

  useEffect(() => {

    const handleFocus = () => {

      loadAllCounts();

    };


    window.addEventListener(
      "focus",
      handleFocus
    );


    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, [loadAllCounts]);


  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  // ====================================================
  // GET BADGE COUNT
  // ====================================================

  const getBadgeCount =
    (badgeType) => {

      switch (badgeType) {

        case "swapRequests":
          return swapRequestCount;

        case "messages":
          return messageCount;

        case "notifications":
          return unreadCount;

        default:
          return 0;

      }

    };


  // ====================================================
  // UI
  // ====================================================

  return (

    <aside
      className="
        w-[267px]
        h-screen
        flex
        flex-col
        flex-shrink-0
        bg-[#5B21B6]
        text-white
        overflow-hidden
      "
    >

      {/* ==================================================
          LOGO
      ================================================== */}

      <div
        className="
          h-[76px]
          px-5
          flex
          items-center
          flex-shrink-0
          border-b
          border-white/10
        "
      >

        <div
          className="[&_span]:text-white"
        >

          <Logo light />

        </div>

      </div>


      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="
          flex-1
          px-2
          py-3
          overflow-y-auto
        "
      >

        <div
          className="space-y-1"
        >

          {items.map(
            ({
              to,
              label,
              icon: Icon,
              badgeType,
              end,
              adminOnly,
            }) => {

              // ------------------------------------------
              // Hide Admin
              // ------------------------------------------

              if (
                adminOnly &&
                user?.role !== "admin"
              ) {

                return null;

              }


              // ------------------------------------------
              // Real Badge
              // ------------------------------------------

              const currentBadge =
                getBadgeCount(
                  badgeType
                );


              return (

                <NavLink
                  key={to}
                  to={to}
                  end={end}

                  className={({
                    isActive,
                  }) => `

                    group

                    flex
                    items-center
                    justify-between

                    w-full

                    px-4
                    py-2.5

                    rounded-xl

                    text-[15px]
                    font-medium

                    transition-all
                    duration-200

                    ${
                      isActive

                        ? `
                          bg-white
                          text-[#5B21B6]
                        `

                        : `
                          text-white
                          hover:bg-white/10
                        `
                    }

                  `}
                >

                  {({
                    isActive,
                  }) => (

                    <>

                      {/* ==================================
                          ICON + LABEL
                      ================================== */}

                      <span
                        className="
                          flex
                          items-center
                          gap-3
                          min-w-0
                        "
                      >

                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          className="flex-shrink-0"
                        />

                        <span
                          className="truncate"
                        >
                          {label}
                        </span>

                      </span>


                      {/* ==================================
                          REAL BADGE
                      ================================== */}

                      {currentBadge > 0 && (

                        <span
                          className={`

                            min-w-[21px]
                            h-[21px]

                            px-1.5

                            rounded-full

                            flex
                            items-center
                            justify-center

                            text-[11px]
                            font-bold

                            flex-shrink-0

                            ${
                              isActive

                                ? "bg-emerald-500 text-white"

                                : "bg-emerald-400 text-white"
                            }

                          `}
                        >

                          {currentBadge > 99
                            ? "99+"
                            : currentBadge}

                        </span>

                      )}

                    </>

                  )}

                </NavLink>

              );

            }
          )}

        </div>

      </nav>


      {/* ==================================================
          LOGOUT
      ================================================== */}

      <div
        className="
          px-2
          py-3
          flex-shrink-0
        "
      >

        <button
          type="button"
          onClick={handleLogout}

          className="
            w-full
            flex
            items-center
            gap-3

            px-4
            py-2.5

            rounded-xl

            text-[15px]
            font-medium

            text-white

            hover:bg-white/10

            transition-all
            duration-200
          "
        >

          <FiLogOut
            size={19}
            strokeWidth={1.8}
          />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>

  );

}