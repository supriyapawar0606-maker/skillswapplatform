import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../api/axios";
import socket from "../socket/socket";

import { useAuth } from "./AuthContext";

// ======================================================
// CREATE CONTEXT
// ======================================================

const NotificationContext =
  createContext(null);


// ======================================================
// PROVIDER
// ======================================================

export const NotificationProvider = ({
  children,
}) => {

  // ====================================================
  // AUTH
  // ====================================================

  const { user } = useAuth();


  // ====================================================
  // STATE
  // ====================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications =
    useCallback(async () => {

      if (!user) {
        setNotifications([]);
        return;
      }

      try {

        setLoading(true);
        setError(null);


        const response =
          await API.get(
            "/notifications"
          );


        if (
          response.data?.success
        ) {

          setNotifications(
            response.data.notifications || []
          );

        } else {

          setNotifications([]);

        }

      } catch (err) {

        console.error(
          "❌ Load notifications error:",
          err.response?.data?.message ||
            err.message
        );

        setError(
          err.response?.data?.message ||
          "Failed to load notifications"
        );

        setNotifications([]);

      } finally {

        setLoading(false);

      }

    }, [user]);


  // ====================================================
  // LOAD UNREAD COUNT
  // ====================================================

  const loadUnreadCount =
    useCallback(async () => {

      if (!user) {

        setUnreadCount(0);

        return;

      }

      try {

        const response =
          await API.get(
            "/notifications/unread-count"
          );


        if (
          response.data?.success
        ) {

          setUnreadCount(
            Number(
              response.data.count
            ) || 0
          );

        } else {

          setUnreadCount(0);

        }

      } catch (err) {

        console.error(
          "❌ Load unread notification count error:",
          err.response?.data?.message ||
            err.message
        );

        /*
          Don't destroy the existing count if a
          temporary network error occurs.
        */

      }

    }, [user]);


  // ====================================================
  // MARK ONE NOTIFICATION AS READ
  // ====================================================

  const markAsRead =
    useCallback(async (notificationId) => {

      if (!notificationId) {
        return;
      }

      try {

        const response =
          await API.patch(
            `/notifications/${notificationId}/read`
          );


        if (
          response.data?.success
        ) {

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) =>
                  notification._id ===
                  notificationId
                    ? {
                        ...notification,
                        isRead: true,
                      }
                    : notification
              )
          );


          /*
            Recalculate from backend.

            This is safer than blindly doing:
            setUnreadCount(count - 1)

            because the backend is the source
            of truth.
          */

          await loadUnreadCount();

        }

      } catch (err) {

        console.error(
          "❌ Mark notification as read error:",
          err.response?.data?.message ||
            err.message
        );

      }

    }, [loadUnreadCount]);


  // ====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ====================================================

  const markAllAsRead =
    useCallback(async () => {

      if (!user) {
        return;
      }

      try {

        const response =
          await API.patch(
            "/notifications/read-all"
          );


        if (
          response.data?.success
        ) {

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) => ({
                  ...notification,
                  isRead: true,
                })
              )
          );


          setUnreadCount(0);

        }

      } catch (err) {

        console.error(
          "❌ Mark all notifications as read error:",
          err.response?.data?.message ||
            err.message
        );

      }

    }, [user]);


  // ====================================================
  // DELETE NOTIFICATION
  // ====================================================

  const deleteNotification =
    useCallback(async (notificationId) => {

      if (!notificationId) {
        return;
      }

      try {

        const response =
          await API.delete(
            `/notifications/${notificationId}`
          );


        if (
          response.data?.success
        ) {

          setNotifications(
            (currentNotifications) =>
              currentNotifications.filter(
                (notification) =>
                  notification._id !==
                  notificationId
              )
          );


          await loadUnreadCount();

        }

      } catch (err) {

        console.error(
          "❌ Delete notification error:",
          err.response?.data?.message ||
            err.message
        );

      }

    }, [loadUnreadCount]);


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {

    if (!user) {

      setNotifications([]);
      setUnreadCount(0);

      return;

    }


    loadNotifications();
    loadUnreadCount();

  }, [
    user,
    loadNotifications,
    loadUnreadCount,
  ]);


  // ====================================================
  // REAL-TIME SOCKET.IO
  // ====================================================

  useEffect(() => {

    if (!user?._id) {
      return;
    }


    // ==================================================
    // CONNECT SOCKET
    // ==================================================

    if (!socket.connected) {
      socket.connect();
    }


    // ==================================================
    // JOIN USER ROOM
    // ==================================================

    const joinUser = () => {

      socket.emit(
        "join",
        String(user._id)
      );

    };


    if (socket.connected) {
      joinUser();
    }


    socket.on(
      "connect",
      joinUser
    );


    // ==================================================
    // NEW NOTIFICATION
    // ==================================================

    const handleNotificationCreated =
      (data) => {

        console.log(
          "🔔 New notification received:",
          data
        );


        /*
          Add the notification immediately
          if the server sent the complete object.
        */

        if (
          data?.notification
        ) {

          setNotifications(
            (currentNotifications) => {

              /*
                Prevent duplicate notifications.
              */

              const alreadyExists =
                currentNotifications.some(
                  (notification) =>
                    notification._id ===
                    data.notification._id
                );


              if (alreadyExists) {
                return currentNotifications;
              }


              return [
                data.notification,
                ...currentNotifications,
              ];

            }
          );

        }


        /*
          Increase count immediately.

          The backend event is only sent to
          the notification owner, so this is
          safe for the current user.
        */

        setUnreadCount(
          (currentCount) =>
            currentCount + 1
        );

      };


    socket.on(
      "notificationCreated",
      handleNotificationCreated
    );


    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {

      socket.off(
        "connect",
        joinUser
      );


      socket.off(
        "notificationCreated",
        handleNotificationCreated
      );

    };

  }, [user?._id]);


  // ====================================================
  // REFRESH WHEN WINDOW GETS FOCUS
  // ====================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    const handleFocus = () => {

      loadUnreadCount();

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

  }, [
    user,
    loadUnreadCount,
  ]);


  // ====================================================
  // AUTO REFRESH
  // ====================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    const interval =
      setInterval(() => {

        loadUnreadCount();

      }, 30000);


    return () => {

      clearInterval(interval);

    };

  }, [
    user,
    loadUnreadCount,
  ]);


  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value = {

    // Notifications
    notifications,

    // Number of unread notifications
    unreadCount,

    // Loading state
    loading,

    // Error
    error,

    // Functions
    loadNotifications,

    loadUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification,

  };


  // ====================================================
  // PROVIDER
  // ====================================================

  return (

    <NotificationContext.Provider
      value={value}
    >

      {children}

    </NotificationContext.Provider>

  );

};


// ======================================================
// CUSTOM HOOK
// ======================================================

export const useNotifications = () => {

  const context =
    useContext(
      NotificationContext
    );


  if (!context) {

    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );

  }


  return context;

};


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default NotificationContext;