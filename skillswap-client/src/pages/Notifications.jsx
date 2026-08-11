import { useEffect, useState } from "react";

import {
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiRepeat,
  FiVideo,
  FiClock,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";

import API from "../api/axios";


// ======================================================
// NOTIFICATIONS PAGE
// ======================================================

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications = async () => {
    try {
      setRefreshing(true);

      const response = await API.get("/notifications");

      if (response.data?.success) {
        setNotifications(
          response.data.notifications || []
        );
      }
    } catch (error) {
      console.error(
        "Load notifications error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadNotifications();
  }, []);


  // ====================================================
  // GET NOTIFICATION ICON
  // ====================================================

  const getNotificationIcon = (type) => {
    switch (type) {

      // -----------------------------------------------
      // Swap Request
      // -----------------------------------------------

      case "swap_request":
        return (
          <FiRepeat
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Swap Accepted
      // -----------------------------------------------

      case "swap_accepted":
        return (
          <FiCheckCircle
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Swap Rejected
      // -----------------------------------------------

      case "swap_rejected":
        return (
          <FiXCircle
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Session Scheduled
      // -----------------------------------------------

      case "session_scheduled":
        return (
          <FiVideo
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Session Completed
      // -----------------------------------------------

      case "session_completed":
        return (
          <FiCheckCircle
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Session Cancelled
      // -----------------------------------------------

      case "session_cancelled":
        return (
          <FiXCircle
            size={21}
            strokeWidth={1.8}
          />
        );


      // -----------------------------------------------
      // Default
      // -----------------------------------------------

      default:
        return (
          <FiBell
            size={21}
            strokeWidth={1.8}
          />
        );
    }
  };


  // ====================================================
  // GET NOTIFICATION TITLE
  // ====================================================

  const getNotificationTitle = (notification) => {
    const type = notification?.type;
    const text = notification?.text || "";

    switch (type) {

      case "session_scheduled":
        return text || "A new session has been scheduled with you";

      case "session_completed":
        return text || "Your skill swap session has been completed";

      case "session_cancelled":
        return text || "Your skill swap session has been cancelled";

      default:
        return text || "New notification";
    }
  };


  // ====================================================
  // GET NOTIFICATION ICON COLOR
  // ====================================================

  const getIconClass = (type) => {
    switch (type) {

      case "session_scheduled":
        return "text-purple-500";

      case "session_completed":
        return "text-emerald-500";

      case "session_cancelled":
        return "text-red-500";

      case "swap_accepted":
        return "text-emerald-500";

      case "swap_rejected":
        return "text-red-500";

      case "swap_request":
        return "text-purple-500";

      default:
        return "text-slate-500";
    }
  };


  // ====================================================
  // FORMAT TIME
  // ====================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );


    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ====================================================
  // GET RELATED USER NAME
  // ====================================================

  const getRelatedUserName = (notification) => {
    if (
      notification?.relatedUser &&
      typeof notification.relatedUser === "object"
    ) {
      return (
        notification.relatedUser.fullName ||
        notification.relatedUser.name ||
        ""
      );
    }

    return "";
  };


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="w-full">

        {/* ==============================================
            PAGE HEADER
        ============================================== */}

        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-[14px] text-slate-500">
            Stay updated with your SkillSwap activity
          </p>
        </div>


        {/* ==============================================
            LOADING CARD
        ============================================== */}

        <div className="bg-white rounded-2xl border border-slate-100 min-h-[200px] flex items-center justify-center">

          <div className="flex items-center gap-2 text-slate-400">

            <FiRefreshCw
              size={18}
              className="animate-spin"
            />

            <span className="text-sm">
              Loading notifications...
            </span>

          </div>

        </div>

      </div>
    );
  }


  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="w-full">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-[28px] font-bold text-slate-900">
          Notifications
        </h1>

        <p className="mt-1 text-[14px] text-slate-500">
          Stay updated with your SkillSwap activity
        </p>

      </div>


      {/* =================================================
          NOTIFICATION CARD
      ================================================= */}

      {notifications.length === 0 ? (

        // ================================================
        // EMPTY STATE
        // ================================================

        <div className="bg-white rounded-2xl border border-slate-100 min-h-[200px] flex flex-col items-center justify-center">

          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">

            <FiBell
              size={26}
              className="text-purple-500"
              strokeWidth={1.7}
            />

          </div>

          <h3 className="text-[16px] font-semibold text-slate-800">
            No notifications yet
          </h3>

          <p className="mt-1 text-[14px] text-slate-400">
            Your SkillSwap activity will appear here.
          </p>

        </div>

      ) : (

        // ================================================
        // NOTIFICATION LIST
        // ================================================

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {notifications.map(
            (notification, index) => {

              const relatedUserName =
                getRelatedUserName(
                  notification
                );

              return (
                <div
                  key={
                    notification._id ||
                    notification.id ||
                    index
                  }

                  className={`
                    relative
                    px-5
                    py-5
                    flex
                    items-start
                    gap-4
                    transition-colors
                    duration-200
                    hover:bg-slate-50

                    ${
                      index !==
                      notifications.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }

                    ${
                      notification.isRead === false
                        ? "bg-purple-50/20"
                        : "bg-white"
                    }
                  `}
                >

                  {/* ====================================
                      ICON
                  ==================================== */}

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-slate-100
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >

                    <span
                      className={
                        getIconClass(
                          notification.type
                        )
                      }
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </span>

                  </div>


                  {/* ====================================
                      CONTENT
                  ==================================== */}

                  <div className="min-w-0 flex-1">

                    {/* --------------------------------
                        Notification Text
                    -------------------------------- */}

                    <p className="text-[15px] font-medium text-slate-800 leading-6">
                      {getNotificationTitle(
                        notification
                      )}
                    </p>


                    {/* --------------------------------
                        Related User
                    -------------------------------- */}

                    {relatedUserName && (
                      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-400">

                        <FiUser
                          size={13}
                          strokeWidth={1.7}
                        />

                        <span>
                          {relatedUserName}
                        </span>

                      </div>
                    )}


                    {/* --------------------------------
                        Session Notification Label
                    -------------------------------- */}

                    {notification.type ===
                      "session_scheduled" && (
                      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-purple-500">

                        <FiVideo
                          size={13}
                          strokeWidth={1.8}
                        />

                        <span>
                          Session notification
                        </span>

                      </div>
                    )}


                    {/* --------------------------------
                        Time
                    -------------------------------- */}

                    <div className="mt-2 flex items-center gap-1.5 text-[12px] text-slate-400">

                      <FiClock
                        size={13}
                        strokeWidth={1.7}
                      />

                      <span>
                        {formatTime(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                  </div>


                  {/* ====================================
                      UNREAD DOT
                  ==================================== */}

                  {notification.isRead === false && (
                    <span
                      className="
                        absolute
                        right-5
                        top-6
                        w-2
                        h-2
                        rounded-full
                        bg-purple-500
                      "
                    />
                  )}

                </div>
              );
            }
          )}

        </div>

      )}


      {/* =================================================
          REFRESH
      ================================================= */}

      <div className="mt-5 flex justify-center">

        <button
          type="button"
          onClick={loadNotifications}
          disabled={refreshing}
          className="
            flex
            items-center
            gap-2
            text-[14px]
            text-slate-500
            hover:text-purple-600
            transition-colors
            duration-200
            disabled:opacity-50
          "
        >

          <FiRefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh notifications"}
          </span>

        </button>

      </div>

    </div>
  );
}