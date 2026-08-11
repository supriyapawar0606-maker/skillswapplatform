import { useEffect, useState } from "react";
import {
  FiVideo,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import { useToast } from "../components/Toast";
import API from "../api/axios";

const days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const slots = [
  "9:00 AM",
  "11:00 AM",
  "2:00 PM",
  "4:00 PM",
  "6:00 PM",
];

// ==========================================
// Convert selected day + time into Date
// ==========================================

function createScheduledDate(day, time) {
  const now = new Date();

  const dayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const targetDay = dayMap[day];
  const currentDay = now.getDay();

  let difference = targetDay - currentDay;

  if (difference < 0) {
    difference += 7;
  }

  const date = new Date(now);

  date.setDate(now.getDate() + difference);

  const [timeValue, modifier] = time.split(" ");

  let [hours, minutes] = timeValue.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);

  // If selected time already passed today,
  // schedule it for next week.
  if (date <= now) {
    date.setDate(date.getDate() + 7);
  }

  return date;
}

// ==========================================
// Format Date
// ==========================================

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// Format Time
// ==========================================

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ==========================================
// Schedule Page
// ==========================================

export default function Schedule() {
  const navigate = useNavigate();
  const showToast = useToast();

  // ========================================
  // State
  // ========================================

  const [selectedDay, setSelectedDay] = useState("Wed");

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [sessions, setSessions] = useState([]);

  const [acceptedRequests, setAcceptedRequests] = useState([]);

  const [selectedSwap, setSelectedSwap] = useState("");

  const [topic, setTopic] = useState("");

  const [duration, setDuration] = useState(60);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  // ==========================================
  // Load Sessions
  // ==========================================

  const loadSessions = async () => {
    try {
      setLoading(true);

      const response = await API.get("/schedule/mine");

      if (response.data?.success) {
        setSessions(response.data.sessions || []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Load sessions error:", error);

      showToast(
        error.response?.data?.message ||
          "Failed to load sessions",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load Accepted Swap Requests
  // ==========================================

  const loadAcceptedRequests = async () => {
    try {
      const [
        receivedResponse,
        sentResponse,
      ] = await Promise.all([
        API.get("/swaps/received"),
        API.get("/swaps/sent"),
      ]);

      const received =
        receivedResponse.data?.swapRequests || [];

      const sent =
        sentResponse.data?.swapRequests || [];

      // Combine both
      const allRequests = [
        ...received,
        ...sent,
      ];

      // Only Accepted
      const accepted = allRequests.filter(
        (request) => request.status === "Accepted"
      );

      // Remove duplicates
      const uniqueRequests = accepted.filter(
        (request, index, array) =>
          index ===
          array.findIndex(
            (item) => item._id === request._id
          )
      );

      setAcceptedRequests(uniqueRequests);

      // Select first accepted request
      if (
        uniqueRequests.length > 0 &&
        !selectedSwap
      ) {
        const firstRequest = uniqueRequests[0];

        setSelectedSwap(firstRequest._id);

        setTopic(
          firstRequest.receiverSkill?.title ||
            firstRequest.senderSkill?.title ||
            ""
        );
      }
    } catch (error) {
      console.error(
        "Load accepted requests error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load accepted swaps",
        "error"
      );
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    loadSessions();
    loadAcceptedRequests();
  }, []);

  // ==========================================
  // Select Swap
  // ==========================================

  const handleSwapChange = (event) => {
    const swapId = event.target.value;

    setSelectedSwap(swapId);

    const selectedRequest =
      acceptedRequests.find(
        (request) => request._id === swapId
      );

    if (selectedRequest) {
      setTopic(
        selectedRequest.receiverSkill?.title ||
          selectedRequest.senderSkill?.title ||
          ""
      );
    }
  };

  // ==========================================
  // Create Session
  // ==========================================

  const confirmSlot = async () => {
    if (!selectedSlot) {
      showToast(
        "Please select a time slot",
        "error"
      );
      return;
    }

    if (!selectedSwap) {
      showToast(
        "Please select an accepted swap",
        "error"
      );
      return;
    }

    try {
      setCreating(true);

      const scheduledDate =
        createScheduledDate(
          selectedDay,
          selectedSlot
        );

      const response = await API.post(
        "/schedule",
        {
          swapRequest: selectedSwap,
          scheduledAt:
            scheduledDate.toISOString(),
          topic: topic.trim(),
          durationMinutes: Number(duration),
        }
      );

      if (response.data?.success) {
        showToast(
          "Session scheduled successfully",
          "success"
        );

        setSelectedSlot(null);

        await loadSessions();
      }
    } catch (error) {
      console.error(
        "Create session error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to schedule session",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // Update Session Status
  // ==========================================

  const updateStatus = async (
    sessionId,
    status
  ) => {
    try {
      setActionLoading(sessionId);

      const response = await API.put(
        `/schedule/${sessionId}/status`,
        {
          status,
        }
      );

      if (response.data?.success) {
        setSessions((current) =>
          current.map((session) =>
            session._id === sessionId
              ? {
                  ...session,
                  status,
                }
              : session
          )
        );

        showToast(
          status === "Completed"
            ? "Session marked as completed"
            : "Session cancelled",
          status === "Completed"
            ? "success"
            : "info"
        );
      }
    } catch (error) {
      console.error(
        "Update session error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to update session",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // Join Video Call
  // ==========================================

  const joinCall = (session) => {
    if (!session?._id) {
      showToast(
        "Invalid session",
        "error"
      );
      return;
    }

    // Session must be scheduled
    if (session.status !== "Scheduled") {
      showToast(
        "This session is not available for video call",
        "error"
      );
      return;
    }

    // ==========================================
    // TEST MODE
    // Allow joining immediately.
    // No 15-minute waiting period.
    // ==========================================

    navigate(
      `/dashboard/video-call/${session._id}`
    );
  };

  // ==========================================
  // Upcoming Sessions
  // ==========================================

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "Scheduled" &&
      new Date(session.scheduledAt) >=
        new Date()
  );

  // ==========================================
  // Past Sessions
  // ==========================================

  const pastSessions = sessions.filter(
    (session) =>
      session.status !== "Scheduled" ||
      new Date(session.scheduledAt) <
        new Date()
  );

  // ==========================================
  // Get Other Participant
  // ==========================================

  const getOtherParticipant = (session) => {
    if (
      !session?.participants ||
      session.participants.length === 0
    ) {
      return "SkillSwap User";
    }

    return (
      session.participants[0]?.fullName ||
      "SkillSwap User"
    );
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="w-full">

      {/* ====================================
          Header
      ==================================== */}

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">
          Schedule a Session
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Pick a day and time for your next
          skill swap
        </p>
      </div>

      {/* ====================================
          Schedule Area
      ==================================== */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ==================================
            Booking Card
        ================================== */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">

          <div className="flex items-center gap-2 mb-5">
            <FiCalendar className="text-brand-600" />

            <h3 className="font-semibold">
              Schedule a Session
            </h3>
          </div>

          {/* Accepted Swap */}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Accepted Swap
            </label>

            {acceptedRequests.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">

                <p className="text-sm text-amber-700">
                  You don't have any accepted
                  swap requests yet.
                </p>

                <p className="text-xs text-amber-600 mt-1">
                  Accept a swap request before
                  scheduling a session.
                </p>

              </div>
            ) : (
              <select
                value={selectedSwap}
                onChange={handleSwapChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
              >
                {acceptedRequests.map(
                  (request) => {
                    const person =
                      request.sender?.fullName ||
                      request.receiver?.fullName ||
                      "User";

                    const skill =
                      request.receiverSkill?.title ||
                      request.senderSkill?.title ||
                      "Skill Swap";

                    return (
                      <option
                        key={request._id}
                        value={request._id}
                      >
                        {person} — {skill}
                      </option>
                    );
                  }
                )}
              </select>
            )}
          </div>

          {/* Topic */}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>

            <input
              type="text"
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              placeholder="What will you learn?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Days */}

          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedSlot(null);
                }}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? "bg-brand-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time */}

          <div className="flex items-center gap-2 mb-3">
            <FiClock
              className="text-gray-400"
              size={14}
            />

            <p className="text-sm text-gray-500">
              Available time slots for{" "}
              {selectedDay}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() =>
                  setSelectedSlot(slot)
                }
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  selectedSlot === slot
                    ? "bg-brand-50 border-brand-500 text-brand-600"
                    : "border-gray-200 text-gray-600 hover:border-brand-300"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Duration */}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>

            <select
              value={duration}
              onChange={(e) =>
                setDuration(
                  Number(e.target.value)
                )
              }
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            >
              <option value={30}>
                30 minutes
              </option>

              <option value={45}>
                45 minutes
              </option>

              <option value={60}>
                60 minutes
              </option>

              <option value={90}>
                90 minutes
              </option>

              <option value={120}>
                120 minutes
              </option>
            </select>
          </div>

          {/* Confirm */}

          <Button
            disabled={
              !selectedSlot ||
              !selectedSwap ||
              creating
            }
            onClick={confirmSlot}
          >
            {creating
              ? "Scheduling..."
              : "Confirm Slot"}
          </Button>
        </div>

        {/* ==================================
            Upcoming Sessions
        ================================== */}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">

          <h3 className="font-semibold mb-4">
            Upcoming Sessions
          </h3>

          {loading ? (
            <p className="text-sm text-gray-400">
              Loading sessions...
            </p>
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-8">

              <FiCalendar
                size={28}
                className="mx-auto mb-3 text-gray-300"
              />

              <p className="text-sm text-gray-500">
                No upcoming sessions
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Schedule a session after an
                accepted swap.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {upcomingSessions.map(
                (session) => {

                  const person =
                    getOtherParticipant(
                      session
                    );

                  // ==========================================
                  // TEST MODE
                  // Join button is available immediately.
                  // ==========================================

                  const canJoin = true;

                  return (
                    <div
                      key={session._id}
                      className="border border-gray-100 rounded-xl p-4"
                    >

                      {/* Person */}

                      <p className="text-sm font-medium">
                        {person}
                      </p>

                      {/* Topic */}

                      <p className="text-xs text-gray-500 mt-1">
                        {session.topic ||
                          "Skill Swap"}
                      </p>

                      {/* Date */}

                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(
                          session.scheduledAt
                        )}{" "}
                        ·{" "}
                        {formatTime(
                          session.scheduledAt
                        )}
                      </p>

                      {/* Duration */}

                      <p className="text-xs text-gray-400 mt-1">
                        {session.durationMinutes ||
                          60}{" "}
                        minutes
                      </p>

                      {/* Buttons */}

                      <div className="flex gap-2 mt-3">

                        {/* Video Call */}

                        <Button
                          size="sm"
                          icon={FiVideo}
                          className="flex-1"
                          disabled={!canJoin}
                          onClick={() =>
                            joinCall(
                              session
                            )
                          }
                        >
                          Join
                        </Button>

                        {/* Complete */}

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            session._id
                          }
                          onClick={() =>
                            updateStatus(
                              session._id,
                              "Completed"
                            )
                          }
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 text-xs disabled:opacity-50"
                          title="Mark completed"
                        >
                          <FiCheckCircle />
                        </button>

                        {/* Cancel */}

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            session._id
                          }
                          onClick={() =>
                            updateStatus(
                              session._id,
                              "Cancelled"
                            )
                          }
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 text-xs disabled:opacity-50"
                          title="Cancel session"
                        >
                          <FiXCircle />
                        </button>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          )}
        </div>
      </div>

      {/* ====================================
          Past Sessions
      ==================================== */}

      {!loading &&
        pastSessions.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">

            <h3 className="font-semibold mb-4">
              Past Sessions
            </h3>

            <div className="space-y-3">

              {pastSessions.map(
                (session) => {

                  const person =
                    getOtherParticipant(
                      session
                    );

                  return (
                    <div
                      key={session._id}
                      className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >

                      <div className="flex-1">

                        <p className="text-sm font-medium">
                          {person}
                        </p>

                        <p className="text-xs text-gray-500">
                          {session.topic ||
                            "Skill Swap"}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(
                            session.scheduledAt
                          )}{" "}
                          ·{" "}
                          {formatTime(
                            session.scheduledAt
                          )}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {session.durationMinutes ||
                            60}{" "}
                          minutes
                        </p>

                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          session.status ===
                          "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {session.status}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          </div>
        )}
    </div>
  );
}