import { useEffect, useState } from "react";
import {
  FiUsers,
  FiCalendar,
  FiPlus,
  FiClock,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

import Avatar from "../components/Avatar";
import Button from "../components/Button";
import SkillIcon from "../components/SkillIcon";
import { useToast } from "../components/Toast";
import API from "../api/axios";

// ==========================================
// Format Date
// ==========================================

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
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
// Format Duration
// ==========================================

function formatDuration(minutes) {
  const duration = Number(minutes) || 60;

  if (duration < 60) {
    return `${duration} min`;
  }

  const hours = Math.floor(duration / 60);
  const remaining = duration % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

// ==========================================
// Workshops
// ==========================================

export default function Workshops() {
  const showToast = useToast();

  // ==========================================
  // State
  // ==========================================

  const [workshops, setWorkshops] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [creating, setCreating] = useState(false);

  // ==========================================
  // Create Form
  // ==========================================

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Programming",
    scheduledAt: "",
    durationMinutes: 60,
    capacity: 10,
  });

  // ==========================================
  // Load Workshops
  // ==========================================

  const loadWorkshops = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/workshops"
      );

      if (response.data?.success) {
        setWorkshops(
          response.data.workshops || []
        );
      } else {
        setWorkshops([]);
      }
    } catch (error) {
      console.error(
        "Load workshops error:",
        error
      );

      setWorkshops([]);

      showToast(
        error.response?.data?.message ||
          "Failed to load workshops",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    loadWorkshops();
  }, []);

  // ==========================================
  // Form Change
  // ==========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // Create Workshop
  // ==========================================

  const createWorkshop = async (event) => {
    event.preventDefault();

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (!form.title.trim()) {
      showToast(
        "Please enter workshop title",
        "error"
      );
      return;
    }

    if (!form.scheduledAt) {
      showToast(
        "Please select workshop date and time",
        "error"
      );
      return;
    }

    const selectedDate = new Date(
      form.scheduledAt
    );

    if (
      Number.isNaN(selectedDate.getTime())
    ) {
      showToast(
        "Invalid workshop date",
        "error"
      );
      return;
    }

    if (selectedDate <= new Date()) {
      showToast(
        "Workshop must be scheduled for a future date",
        "error"
      );
      return;
    }

    if (Number(form.capacity) < 1) {
      showToast(
        "Capacity must be at least 1",
        "error"
      );
      return;
    }

    try {
      setCreating(true);

      const response = await API.post(
        "/workshops",
        {
          title: form.title.trim(),

          description:
            form.description.trim(),

          category:
            form.category.trim() ||
            "Other",

          scheduledAt:
            selectedDate.toISOString(),

          durationMinutes:
            Number(form.durationMinutes),

          capacity:
            Number(form.capacity),
        }
      );

      if (response.data?.success) {
        showToast(
          "Workshop created successfully",
          "success"
        );

        // Reset form
        setForm({
          title: "",
          description: "",
          category: "Programming",
          scheduledAt: "",
          durationMinutes: 60,
          capacity: 10,
        });

        setShowCreateForm(false);

        await loadWorkshops();
      }
    } catch (error) {
      console.error(
        "Create workshop error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to create workshop",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // Reserve Workshop
  // ==========================================

  const reserveWorkshop = async (
    workshopId
  ) => {
    if (!workshopId) {
      showToast(
        "Invalid workshop",
        "error"
      );
      return;
    }

    try {
      setActionLoading(workshopId);

      const response = await API.post(
        `/workshops/${workshopId}/reserve`
      );

      if (response.data?.success) {
        showToast(
          "Seat reserved successfully",
          "success"
        );

        // Update directly
        if (response.data.workshop) {
          setWorkshops((current) =>
            current.map((workshop) =>
              workshop._id === workshopId
                ? response.data.workshop
                : workshop
            )
          );
        } else {
          await loadWorkshops();
        }
      }
    } catch (error) {
      console.error(
        "Join workshop error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      showToast(
        error.response?.data?.message ||
          "Failed to reserve seat",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // Cancel Reservation
  // ==========================================

  const cancelReservation = async (
    workshopId
  ) => {
    if (!workshopId) {
      return;
    }

    try {
      setActionLoading(workshopId);

      const response =
        await API.delete(
          `/workshops/${workshopId}/reserve`
        );

      if (response.data?.success) {
        showToast(
          "Reservation cancelled",
          "success"
        );

        if (response.data.workshop) {
          setWorkshops((current) =>
            current.map((workshop) =>
              workshop._id === workshopId
                ? response.data.workshop
                : workshop
            )
          );
        } else {
          await loadWorkshops();
        }
      }
    } catch (error) {
      console.error(
        "Cancel reservation error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to cancel reservation",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // Close Form
  // ==========================================

  const closeCreateForm = () => {
    if (creating) return;

    setShowCreateForm(false);
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="w-full">

      {/* ======================================
          Header
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="font-display text-2xl font-bold">
            Group Workshops
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Teach or join a group swap — one
            mentor, several learners
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={loadWorkshops}
            disabled={loading}
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 disabled:opacity-50"
            title="Refresh"
          >
            <FiRefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          <Button
            icon={FiPlus}
            size="sm"
            onClick={() =>
              setShowCreateForm(true)
            }
          >
            Host a Workshop
          </Button>

        </div>
      </div>

      {/* ======================================
          Create Workshop Form
      ====================================== */}

      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-semibold text-lg">
                Host a Workshop
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Create a workshop for other
                SkillSwap members.
              </p>
            </div>

            <button
              type="button"
              onClick={closeCreateForm}
              disabled={creating}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-red-500 disabled:opacity-50"
            >
              <FiX size={18} />
            </button>

          </div>

          <form
            onSubmit={createWorkshop}
            className="space-y-4"
          >

            {/* Title */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workshop Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. React Fundamentals"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Description */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Describe what learners will learn..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Category */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Programming">
                  Programming
                </option>

                <option value="Design">
                  Design
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Business">
                  Business
                </option>

                <option value="Communication">
                  Communication
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Date + Time */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time
              </label>

              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleFormChange}
                min={new Date()
                  .toISOString()
                  .slice(0, 16)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Duration + Capacity */}

            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>

                <select
                  name="durationMinutes"
                  value={form.durationMinutes}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Seats
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleFormChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                />
              </div>

            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={closeCreateForm}
                disabled={creating}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <Button
                type="submit"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Workshop"}
              </Button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================
          Loading
      ====================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

          <FiClock
            size={28}
            className="mx-auto mb-3 text-gray-300 animate-pulse"
          />

          <p className="text-sm text-gray-400">
            Loading workshops...
          </p>

        </div>
      )}

      {/* ======================================
          Empty
      ====================================== */}

      {!loading &&
        workshops.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <FiUsers size={25} />
            </div>

            <h3 className="font-semibold text-gray-700">
              No upcoming workshops
            </h3>

            <p className="text-sm text-gray-400 mt-1 mb-5">
              Be the first person to host a
              workshop.
            </p>

            <Button
              icon={FiPlus}
              size="sm"
              onClick={() =>
                setShowCreateForm(true)
              }
            >
              Host a Workshop
            </Button>

          </div>
        )}

      {/* ======================================
          Workshop Grid
      ====================================== */}

      {!loading &&
        workshops.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {workshops.map((workshop) => {

              const attendeeCount =
                workshop.attendees?.length || 0;

              const capacity =
                Number(workshop.capacity) || 0;

              const full =
                attendeeCount >= capacity;

              const currentUserId =
                localStorage.getItem(
                  "userId"
                );

              const hostId =
                workshop.host?._id ||
                workshop.host;

              const isHost =
                currentUserId &&
                hostId &&
                currentUserId.toString() ===
                  hostId.toString();

              const isReserved =
                workshop.attendees?.some(
                  (attendee) => {

                    const attendeeId =
                      attendee?._id ||
                      attendee;

                    return (
                      currentUserId &&
                      attendeeId?.toString() ===
                        currentUserId.toString()
                    );
                  }
                );

              const processing =
                actionLoading ===
                workshop._id;

              return (
                <div
                  key={workshop._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                >

                  {/* Skill Icon */}

                  <SkillIcon
                    icon={
                      workshop.category ===
                      "Programming"
                        ? "code"
                        : workshop.category ===
                          "Design"
                        ? "pen"
                        : workshop.category ===
                          "Marketing"
                        ? "megaphone"
                        : "code"
                    }
                    className="mb-3"
                  />

                  {/* Category */}

                  <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 text-[11px] mb-2">
                    {workshop.category ||
                      "Other"}
                  </span>

                  {/* Title */}

                  <h3 className="font-semibold mb-1">
                    {workshop.title}
                  </h3>

                  {/* Description */}

                  {workshop.description && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {workshop.description}
                    </p>
                  )}

                  {/* Host */}

                  <div className="flex items-center gap-2 mb-3">

                    <Avatar
                      name={
                        workshop.host
                          ?.fullName ||
                        "SkillSwap User"
                      }
                      size={22}
                    />

                    <span className="text-xs text-gray-500">
                      Hosted by{" "}
                      {workshop.host
                        ?.fullName ||
                        "SkillSwap User"}
                    </span>

                  </div>

                  {/* Date */}

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <FiCalendar
                      size={13}
                    />

                    {formatDate(
                      workshop.scheduledAt
                    )}
                  </p>

                  {/* Time */}

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <FiClock
                      size={13}
                    />

                    {formatTime(
                      workshop.scheduledAt
                    )}

                    <span className="text-gray-300">
                      ·
                    </span>

                    {formatDuration(
                      workshop.durationMinutes
                    )}
                  </p>

                  {/* Seats */}

                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                    <FiUsers
                      size={13}
                    />

                    {attendeeCount}/
                    {capacity} seats filled
                  </p>

                  {/* Seat Progress */}

                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">

                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{
                        width: `${
                          capacity > 0
                            ? Math.min(
                                (attendeeCount /
                                  capacity) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />

                  </div>

                  {/* Action */}

                  {isHost ? (
                    <div className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-500 text-center text-sm">
                      You are the host
                    </div>
                  ) : isReserved ? (
                    <div className="space-y-2">

                      <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-center text-sm font-medium">
                        Seat Reserved
                      </div>

                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          cancelReservation(
                            workshop._id
                          )
                        }
                        className="w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                      >
                        {processing
                          ? "Cancelling..."
                          : "Cancel Reservation"}
                      </button>

                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={
                        full || processing
                      }
                      variant={
                        full
                          ? "outline"
                          : "primary"
                      }
                      onClick={() =>
                        reserveWorkshop(
                          workshop._id
                        )
                      }
                    >
                      {processing
                        ? "Reserving..."
                        : full
                        ? "Workshop Full"
                        : "Reserve a Seat"}
                    </Button>
                  )}

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}