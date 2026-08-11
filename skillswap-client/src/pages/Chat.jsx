import { useCallback, useEffect, useRef, useState } from "react";
import {
  useLocation,
  useSearchParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";

import API from "../api/axios";
import socket from "../socket/socket";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Chat() {
  const { user } = useAuth();
  const showToast = useToast();

  const [searchParams] = useSearchParams();
  const location = useLocation();

  // ==========================================
  // User coming from Discover
  // ==========================================

  const initialUserId = searchParams.get("user");

  const initialChatUser =
    location.state?.chatUser || null;

  // ==========================================
  // State
  // ==========================================

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [chats, setChats] = useState([]);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loadingChats, setLoadingChats] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [typing, setTyping] = useState(false);

  // ==========================================
  // Refs
  // ==========================================

  const messagesEndRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  /*
   * Keep selected user available to socket
   * event handlers without reconnecting socket
   * every time selectedUser changes.
   */
  const selectedUserRef = useRef(null);

  // ==========================================
  // Current User ID
  // ==========================================

  const currentUserId =
    user?._id || user?.id;

  // ==========================================
  // Keep selectedUserRef updated
  // ==========================================

  useEffect(() => {
    selectedUserRef.current =
      selectedUser;
  }, [selectedUser]);

  // ==========================================
  // Load Recent Chats
  // ==========================================

  const loadChats = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      setLoadingChats(true);

      const response =
        await API.get("/messages/chats");

      if (!response.data?.success) {
        setChats([]);
        return;
      }

      const allMessages =
        response.data.chats || [];

      /*
       * Backend returns messages.
       *
       * Convert them into one chat per
       * unique user.
       */

      const uniqueChats = [];

      const seen = new Set();

      for (const msg of allMessages) {
        if (!msg) {
          continue;
        }

        const senderId =
          msg.sender?._id ||
          msg.sender;

        const receiverId =
          msg.receiver?._id ||
          msg.receiver;

        const normalizedSender =
          String(senderId);

        const normalizedReceiver =
          String(receiverId);

        const normalizedCurrent =
          String(currentUserId);

        let otherUser = null;

        if (
          normalizedSender ===
          normalizedCurrent
        ) {
          if (
            typeof msg.receiver ===
            "object"
          ) {
            otherUser =
              msg.receiver;
          }
        } else if (
          normalizedReceiver ===
          normalizedCurrent
        ) {
          if (
            typeof msg.sender ===
            "object"
          ) {
            otherUser =
              msg.sender;
          }
        }

        if (!otherUser?._id) {
          continue;
        }

        const otherUserId =
          String(otherUser._id);

        if (seen.has(otherUserId)) {
          continue;
        }

        seen.add(otherUserId);

        uniqueChats.push({
          user: otherUser,
          lastMessage:
            msg.message || "",
          updatedAt:
            msg.updatedAt ||
            msg.createdAt,
        });
      }

      setChats(uniqueChats);

      // ======================================
      // Open user coming from Discover
      // ======================================

      if (initialUserId) {
        const existing =
          uniqueChats.find(
            (chat) =>
              String(
                chat.user._id
              ) ===
              String(initialUserId)
          );

        if (existing) {
          setSelectedUser(
            existing.user
          );
        } else if (
          initialChatUser
        ) {
          setSelectedUser(
            initialChatUser
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Load chats error:",
        error
      );

      /*
       * Do not prevent Discover → Chat
       * from opening.
       */

      if (
        initialUserId &&
        initialChatUser
      ) {
        setSelectedUser(
          initialChatUser
        );
      }

      /*
       * Avoid showing an error repeatedly
       * during initial development reloads.
       */
      if (
        error.response?.status !== 401
      ) {
        showToast(
          error.response?.data?.message ||
            "Failed to load chats",
          "error"
        );
      }
    } finally {
      setLoadingChats(false);
    }
  }, [
    currentUserId,
    initialUserId,
    initialChatUser,
    showToast,
  ]);

  // ==========================================
  // Load Conversation
  // ==========================================

  const loadConversation = useCallback(
    async (userId) => {
      if (!userId) {
        return;
      }

      try {
        setLoadingMessages(true);

        const response =
          await API.get(
            `/messages/conversation/${userId}`
          );

        if (
          response.data?.success
        ) {
          const loadedMessages =
            response.data.messages ||
            [];

          setMessages(
            loadedMessages
          );

          // ==================================
          // Mark unread messages as read
          // ==================================

          const unreadMessages =
            loadedMessages.filter(
              (msg) => {
                const receiverId =
                  msg.receiver?._id ||
                  msg.receiver;

                return (
                  String(
                    receiverId
                  ) ===
                    String(
                      currentUserId
                    ) &&
                  !msg.isRead
                );
              }
            );

          /*
           * Mark messages independently.
           * Don't make the whole conversation
           * wait for every request.
           */

          await Promise.all(
            unreadMessages.map(
              async (msg) => {
                try {
                  await API.put(
                    `/messages/read/${msg._id}`
                  );
                } catch (error) {
                  console.error(
                    "❌ Mark read error:",
                    error
                  );
                }
              }
            )
          );
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error(
          "❌ Load conversation error:",
          error
        );

        /*
         * New conversation = no messages.
         */

        if (
          error.response?.status ===
          404
        ) {
          setMessages([]);
        } else {
          setMessages([]);

          if (
            error.response?.status !==
            401
          ) {
            showToast(
              error.response?.data
                ?.message ||
                "Failed to load conversation",
              "error"
            );
          }
        }
      } finally {
        setLoadingMessages(false);
      }
    },
    [
      currentUserId,
      showToast,
    ]
  );

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    loadChats();
  }, [
    currentUserId,
    loadChats,
  ]);

  // ==========================================
  // Open Discover User
  // ==========================================

  useEffect(() => {
    if (
      initialUserId &&
      initialChatUser
    ) {
      setSelectedUser(
        initialChatUser
      );
    }
  }, [
    initialUserId,
    initialChatUser,
  ]);

  // ==========================================
  // Load Selected Conversation
  // ==========================================

  useEffect(() => {
    if (!selectedUser?._id) {
      return;
    }

    setTyping(false);

    setMessages([]);

    loadConversation(
      selectedUser._id
    );
  }, [
    selectedUser?._id,
    loadConversation,
  ]);

  // ==========================================
  // SOCKET.IO
  //
  // IMPORTANT:
  // This effect only depends on currentUserId.
  //
  // Changing selected chat DOES NOT recreate
  // the Socket.IO connection.
  // ==========================================

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const userId =
      String(currentUserId);

    // ======================================
    // CONNECT
    // ======================================

    const handleConnect = () => {
      console.log(
        "🟢 Chat Socket connected:",
        socket.id
      );

      /*
       * Register the current user once.
       */

      socket.emit(
        "join",
        userId
      );
    };

    // ======================================
    // ONLINE USERS
    // ======================================

    const handleOnlineUsers = (
      users
    ) => {
      if (
        Array.isArray(users)
      ) {
        setOnlineUsers(
          users.map(String)
        );
      } else {
        setOnlineUsers([]);
      }
    };

    // ======================================
    // NEW MESSAGE
    // ======================================

    const handleNewMessage = (
      newMessage
    ) => {
      if (!newMessage) {
        return;
      }

      console.log(
        "📨 New message received:",
        newMessage
      );

      const senderId =
        newMessage.sender?._id ||
        newMessage.sender;

      const receiverId =
        newMessage.receiver?._id ||
        newMessage.receiver;

      const currentSelectedUser =
        selectedUserRef.current;

      const belongsToCurrentChat =
        currentSelectedUser &&
        (
          String(senderId) ===
            String(
              currentSelectedUser._id
            ) ||
          String(receiverId) ===
            String(
              currentSelectedUser._id
            )
        );

      // ====================================
      // Add to open conversation
      // ====================================

      if (
        belongsToCurrentChat
      ) {
        setMessages(
          (currentMessages) => {
            /*
             * Prevent duplicate message.
             */

            const alreadyExists =
              currentMessages.some(
                (msg) =>
                  String(
                    msg._id
                  ) ===
                  String(
                    newMessage._id
                  )
              );

            if (
              alreadyExists
            ) {
              return currentMessages;
            }

            return [
              ...currentMessages,
              newMessage,
            ];
          }
        );

        // ==================================
        // Mark received message as read
        // ==================================

        if (
          String(receiverId) ===
            userId &&
          !newMessage.isRead
        ) {
          API.put(
            `/messages/read/${newMessage._id}`
          ).catch((error) => {
            console.error(
              "❌ Socket mark-read error:",
              error
            );
          });
        }
      }

      // ====================================
      // Refresh chat list
      // ====================================

      loadChats();
    };

    // ======================================
    // TYPING
    // ======================================

    const handleTyping = (
      data = {}
    ) => {
      const sender =
        data.sender;

      const currentSelectedUser =
        selectedUserRef.current;

      if (
        currentSelectedUser &&
        String(sender) ===
          String(
            currentSelectedUser._id
          )
      ) {
        setTyping(true);
      }
    };

    // ======================================
    // STOP TYPING
    // ======================================

    const handleStopTyping = (
      data = {}
    ) => {
      const sender =
        data.sender;

      const currentSelectedUser =
        selectedUserRef.current;

      if (
        currentSelectedUser &&
        String(sender) ===
          String(
            currentSelectedUser._id
          )
      ) {
        setTyping(false);
      }
    };

    // ======================================
    // Register listeners
    // ======================================

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    // ======================================
    // Connect if necessary
    // ======================================

    if (!socket.connected) {
      socket.connect();
    } else {
      /*
       * Socket is already connected.
       * Register this user immediately.
       */

      handleConnect();
    }

    // ======================================
    // Cleanup
    // ======================================

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );

      /*
       * IMPORTANT:
       *
       * We DO NOT call socket.disconnect()
       * here.
       *
       * Other pages/components may be using
       * the global Socket.IO connection.
       */
    };
  }, [
    currentUserId,
    loadChats,
  ]);

  // ==========================================
  // Auto Scroll
  // ==========================================

  useEffect(() => {
    const element =
      messagesEndRef.current;

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    typing,
  ]);

  // ==========================================
  // Cleanup Typing Timeout
  // ==========================================

  useEffect(() => {
    return () => {
      clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, []);

  // ==========================================
  // Typing Input
  // ==========================================

  const handleTypingInput = (
    value
  ) => {
    setMessage(value);

    if (
      !selectedUser ||
      !currentUserId
    ) {
      return;
    }

    /*
     * Make sure socket is connected.
     */

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "typing",
      {
        sender:
          String(currentUserId),

        receiver:
          String(
            selectedUser._id
          ),
      }
    );

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "stopTyping",
          {
            sender:
              String(
                currentUserId
              ),

            receiver:
              String(
                selectedUser._id
              ),
          }
        );
      }, 800);
  };

  // ==========================================
  // Send Message
  // ==========================================

  const sendMessage = async (
    e
  ) => {
    e?.preventDefault();

    const text =
      message.trim();

    if (
      !text ||
      !selectedUser ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const receiverId =
        String(
          selectedUser._id
        );

      const response =
        await API.post(
          "/messages/send",
          {
            receiver:
              receiverId,

            message: text,
          }
        );

      if (
        response.data?.success
      ) {
        const newMessage =
          response.data.data;

        // ==================================
        // Add immediately
        // ==================================

        if (newMessage) {
          setMessages(
            (currentMessages) => {
              const exists =
                currentMessages.some(
                  (msg) =>
                    String(
                      msg._id
                    ) ===
                    String(
                      newMessage._id
                    )
                );

              if (exists) {
                return currentMessages;
              }

              return [
                ...currentMessages,
                newMessage,
              ];
            }
          );
        }

        // ==================================
        // Clear input
        // ==================================

        setMessage("");

        setTyping(false);

        clearTimeout(
          typingTimeoutRef.current
        );

        // ==================================
        // Stop typing
        // ==================================

        if (
          socket.connected
        ) {
          socket.emit(
            "stopTyping",
            {
              sender:
                String(
                  currentUserId
                ),

              receiver:
                receiverId,
            }
          );
        }

        // ==================================
        // Refresh chat list
        // ==================================

        loadChats();
      } else {
        showToast(
          response.data?.message ||
            "Failed to send message",
          "error"
        );
      }
    } catch (error) {
      console.error(
        "❌ Send message error:",
        error
      );

      showToast(
        error.response?.data
          ?.message ||
          "Failed to send message",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // Select Chat
  // ==========================================

  const openChat = (
    chatUser
  ) => {
    if (!chatUser?._id) {
      return;
    }

    setSelectedUser(
      chatUser
    );

    setMessages([]);

    setTyping(false);

    setMessage("");

    clearTimeout(
      typingTimeoutRef.current
    );
  };

  // ==========================================
  // Close Mobile Chat
  // ==========================================

  const closeMobileChat = () => {
    setSelectedUser(null);

    setMessages([]);

    setTyping(false);

    setMessage("");

    clearTimeout(
      typingTimeoutRef.current
    );
  };

  // ==========================================
  // Helpers
  // ==========================================

  const isOnline = (
    id
  ) => {
    return onlineUsers.some(
      (onlineId) =>
        String(onlineId) ===
        String(id)
    );
  };

  const formatTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full h-full flex bg-white overflow-hidden">

      {/* ======================================
          CHAT LIST
      ====================================== */}

      <div
        className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${
          selectedUser
            ? "hidden md:flex"
            : "flex"
        }`}
      >

        {/* Header */}

        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">

            <FiMessageCircle
              className="text-brand-600"
              size={21}
            />

            <h2 className="font-display font-bold text-lg">
              Messages
            </h2>

          </div>

          <p className="text-xs text-gray-400 mt-1">
            Your conversations
          </p>
        </div>

        {/* Chats */}

        <div className="flex-1 overflow-y-auto">

          {loadingChats && (
            <div className="p-6 text-center text-sm text-gray-400">
              Loading chats...
            </div>
          )}

          {!loadingChats &&
            chats.length === 0 && (
              <div className="p-8 text-center">

                <FiMessageCircle
                  size={28}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="text-sm text-gray-500">
                  No conversations yet.
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Start a conversation
                  from Discover.
                </p>

              </div>
            )}

          {chats.map(
            (chat) => {
              const chatUser =
                chat.user;

              if (
                !chatUser?._id
              ) {
                return null;
              }

              const active =
                String(
                  selectedUser?._id
                ) ===
                String(
                  chatUser._id
                );

              return (
                <button
                  key={
                    chatUser._id
                  }
                  type="button"
                  onClick={() =>
                    openChat(
                      chatUser
                    )
                  }
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    active
                      ? "bg-brand-50"
                      : "hover:bg-gray-50"
                  }`}
                >

                  {/* Avatar */}

                  <div className="relative flex-shrink-0">

                    <Avatar
                      name={
                        chatUser.fullName ||
                        "User"
                      }
                      size={42}
                    />

                    {isOnline(
                      chatUser._id
                    ) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    )}

                  </div>

                  {/* User Info */}

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold truncate">
                      {chatUser.fullName ||
                        "User"}
                    </p>

                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {
                        chat.lastMessage
                      }
                    </p>

                  </div>

                </button>
              );
            }
          )}

        </div>
      </div>

      {/* ======================================
          CHAT WINDOW
      ====================================== */}

      <div
        className={`flex-1 flex flex-col min-w-0 ${
          selectedUser
            ? "flex"
            : "hidden md:flex"
        }`}
      >

        {/* No Selected User */}

        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-center">

            <div>

              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">

                <FiMessageCircle
                  size={28}
                />

              </div>

              <h3 className="font-semibold text-gray-700">
                Select a conversation
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                Choose someone from
                your messages.
              </p>

            </div>

          </div>
        ) : (
          <>

            {/* ==================================
                CHAT HEADER
            ================================== */}

            <div className="h-16 px-4 sm:px-5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">

              {/* Mobile Back */}

              <button
                type="button"
                onClick={
                  closeMobileChat
                }
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <FiArrowLeft
                  size={18}
                />
              </button>

              {/* Avatar */}

              <div className="relative flex-shrink-0">

                <Avatar
                  name={
                    selectedUser.fullName ||
                    "User"
                  }
                  size={40}
                />

                {isOnline(
                  selectedUser._id
                ) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}

              </div>

              {/* Name */}

              <div className="min-w-0">

                <p className="text-sm font-semibold truncate">
                  {selectedUser.fullName ||
                    "User"}
                </p>

                <p className="text-xs text-gray-400">

                  {typing ? (
                    <span className="text-brand-600">
                      Typing...
                    </span>
                  ) : isOnline(
                      selectedUser._id
                    ) ? (
                    "Online"
                  ) : (
                    "Offline"
                  )}

                </p>

              </div>

            </div>

            {/* ==================================
                MESSAGES
            ================================== */}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50/50">

              {/* Loading */}

              {loadingMessages && (
                <div className="text-center text-xs text-gray-400 py-5">
                  Loading messages...
                </div>
              )}

              {/* Empty */}

              {!loadingMessages &&
                messages.length === 0 && (
                  <div className="flex items-center justify-center min-h-full">

                    <div className="text-center">

                      <FiMessageCircle
                        size={25}
                        className="mx-auto text-gray-300 mb-3"
                      />

                      <p className="text-sm text-gray-400">
                        No messages yet.
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Say hello 👋
                      </p>

                    </div>

                  </div>
                )}

              {/* Messages */}

              {messages.map(
                (msg) => {
                  const senderId =
                    msg.sender?._id ||
                    msg.sender;

                  const mine =
                    String(
                      senderId
                    ) ===
                    String(
                      currentUserId
                    );

                  return (
                    <div
                      key={
                        msg._id
                      }
                      className={`flex ${
                        mine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm ${
                          mine
                            ? "bg-brand-600 text-white rounded-br-md"
                            : "bg-white border border-gray-100 text-gray-700 rounded-bl-md"
                        }`}
                      >

                        <p className="break-words whitespace-pre-wrap">
                          {
                            msg.message
                          }
                        </p>

                        <p
                          className={`text-[10px] mt-1 ${
                            mine
                              ? "text-white/70"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTime(
                            msg.createdAt
                          )}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

              {/* Typing */}

              {typing && (
                <div className="flex justify-start">

                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-xs text-gray-400">
                    Typing...
                  </div>

                </div>
              )}

              <div
                ref={
                  messagesEndRef
                }
              />

            </div>

            {/* ==================================
                MESSAGE INPUT
            ================================== */}

            <form
              onSubmit={
                sendMessage
              }
              className="p-3 sm:p-4 border-t border-gray-100 bg-white flex gap-2 flex-shrink-0"
            >

              <input
                type="text"
                value={message}
                onChange={(e) =>
                  handleTypingInput(
                    e.target.value
                  )
                }
                placeholder="Type a message..."
                disabled={
                  sending
                }
                autoComplete="off"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50"
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !message.trim()
                }
                className="w-11 h-11 flex-shrink-0 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <FiSend
                  size={17}
                />

              </button>

            </form>

          </>
        )}

      </div>

    </div>
  );
}