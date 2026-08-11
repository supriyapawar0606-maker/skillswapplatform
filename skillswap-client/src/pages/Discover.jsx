import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiSearch,
  FiX,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";

import API from "../api/axios";
import Button from "../components/Button";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";

export default function Discover() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(
    searchParams.get("q") || ""
  );

  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMySkills, setLoadingMySkills] =
    useState(true);

  const [selectedSkill, setSelectedSkill] =
    useState(null);

  const [form, setForm] = useState({
    senderSkill: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const showToast = useToast();

  // ==========================================
  // Load Discover Skills + My Skills
  // ==========================================

  useEffect(() => {
    loadDiscoverSkills();
    loadMySkills();
  }, []);

  // ==========================================
  // Get Discover Skills
  // ==========================================

  const loadDiscoverSkills = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/skills/discover"
      );

      if (response.data?.success) {
        setSkills(response.data.skills || []);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error(
        "Discover skills error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load skills",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Get My Skills
  // ==========================================

  const loadMySkills = async () => {
    try {
      setLoadingMySkills(true);

      const response = await API.get(
        "/skills/my-skills"
      );

      if (response.data?.success) {
        setMySkills(
          (response.data.skills || []).filter(
            (skill) => !skill.isArchived
          )
        );
      } else {
        setMySkills([]);
      }
    } catch (error) {
      console.error(
        "My skills error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load your skills",
        "error"
      );
    } finally {
      setLoadingMySkills(false);
    }
  };

  // ==========================================
  // Search
  // ==========================================

  const filtered = useMemo(() => {
    const search = query
      .toLowerCase()
      .trim();

    if (!search) {
      return skills;
    }

    return skills.filter((skill) => {
      const title =
        skill.title?.toLowerCase() || "";

      const category =
        skill.category?.toLowerCase() || "";

      const description =
        skill.description?.toLowerCase() || "";

      const ownerName =
        skill.owner?.fullName?.toLowerCase() ||
        "";

      return (
        title.includes(search) ||
        category.includes(search) ||
        description.includes(search) ||
        ownerName.includes(search)
      );
    });
  }, [query, skills]);

  // ==========================================
  // Open Chat
  // ==========================================

  const openChat = (skill) => {
    const chatUser = skill.owner;

    // Make sure the skill has a real owner
    if (!chatUser?._id) {
      showToast(
        "User information is not available",
        "error"
      );

      return;
    }

    /*
     * Pass both:
     * 1. User ID in URL
     * 2. Complete owner object in router state
     *
     * This allows Chat.jsx to open a NEW
     * conversation even when there are no
     * previous messages.
     */

    navigate(
      `/dashboard/chat?user=${chatUser._id}`,
      {
        state: {
          chatUser: chatUser,
        },
      }
    );
  };

  // ==========================================
  // Open Swap Modal
  // ==========================================

  const openSwapModal = (skill) => {
    setSelectedSkill(skill);

    setForm({
      senderSkill: "",
      message: "",
    });
  };

  // ==========================================
  // Close Swap Modal
  // ==========================================

  const closeSwapModal = () => {
    if (sending) return;

    setSelectedSkill(null);

    setForm({
      senderSkill: "",
      message: "",
    });
  };

  // ==========================================
  // Send Swap Request
  // ==========================================

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!selectedSkill) {
      return;
    }

    // Validate sender skill
    if (!form.senderSkill) {
      showToast(
        "Please select a skill you can teach",
        "error"
      );

      return;
    }

    // Get real MongoDB user ID
    const receiverId =
      selectedSkill.owner?._id;

    if (!receiverId) {
      showToast(
        "Unable to identify skill owner",
        "error"
      );

      return;
    }

    try {
      setSending(true);

      const response = await API.post(
        "/swaps",
        {
          receiver: receiverId,

          senderSkill:
            form.senderSkill,

          receiverSkill:
            selectedSkill._id,

          message:
            form.message.trim(),
        }
      );

      if (response.data?.success) {
        showToast(
          "Swap request sent successfully!",
          "success"
        );

        closeSwapModal();
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to send request"
        );
      }
    } catch (error) {
      console.error(
        "Send swap request error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to send request",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      {/* ======================================
          Discover Page
      ====================================== */}

      <div>
        {/* ==================================
            Page Header
        ================================== */}

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">
            Discover Skills
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Find people to swap skills with
          </p>
        </div>

        {/* ==================================
            Search
        ================================== */}

        <div className="relative max-w-md mb-6">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by name or skill"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* ==================================
            Loading
        ================================== */}

        {loading && (
          <div className="text-center py-20 text-gray-400">
            Loading skills...
          </div>
        )}

        {/* ==================================
            Empty
        ================================== */}

        {!loading &&
          filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <FiSearch
                size={32}
                className="mx-auto mb-3 opacity-40"
              />

              <p>No skills found.</p>

              <p className="text-xs mt-1">
                Try a different search.
              </p>
            </div>
          )}

        {/* ==================================
            Skills
        ================================== */}

        {!loading &&
          filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((skill) => {
                const ownerId =
                  skill.owner?._id;

                return (
                  <div
                    key={skill._id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand-300 hover:-translate-y-0.5 transition-all"
                  >
                    {/* ==================================
                        Owner
                    ================================== */}

                    <div className="flex items-center gap-3 mb-4">
                      <Avatar
                        name={
                          skill.owner?.fullName ||
                          "Unknown User"
                        }
                        size={44}
                      />

                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {skill.owner?.fullName ||
                            "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {skill.category}
                        </p>
                      </div>
                    </div>

                    {/* ==================================
                        Skill
                    ================================== */}

                    <h3 className="font-display font-semibold text-lg">
                      {skill.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {skill.description}
                    </p>

                    {/* ==================================
                        Skill Details
                    ================================== */}

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600">
                        {skill.level}
                      </span>

                      <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                        {skill.availability}
                      </span>
                    </div>

                    {/* ==================================
                        Actions
                    ================================== */}

                    <div className="flex gap-2 mt-5">
                      {/* Chat */}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={!ownerId}
                        onClick={() =>
                          openChat(skill)
                        }
                      >
                        <FiMessageCircle
                          size={14}
                        />

                        Chat
                      </Button>

                      {/* Request Swap */}

                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        disabled={!ownerId}
                        onClick={() =>
                          openSwapModal(skill)
                        }
                      >
                        <FiSend size={14} />

                        Request Swap
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* ======================================
          Swap Request Modal
      ====================================== */}

      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">
            {/* ==================================
                Modal Header
            ================================== */}

            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Request Skill Swap
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Send a swap request to{" "}
                  {selectedSkill.owner
                    ?.fullName ||
                    "this user"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSwapModal}
                disabled={sending}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* ==================================
                Modal Body
            ================================== */}

            <form
              onSubmit={handleSendRequest}
              className="p-5 space-y-5"
            >
              {/* ==================================
                  Receiver Skill
              ================================== */}

              <div>
                <label className="text-sm font-medium text-ink mb-2 block">
                  They will teach you
                </label>

                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={
                        selectedSkill.owner
                          ?.fullName ||
                        "User"
                      }
                      size={38}
                    />

                    <div>
                      <p className="font-medium text-sm">
                        {selectedSkill.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        {
                          selectedSkill.category
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================
                  Sender Skill
              ================================== */}

              <div>
                <label className="text-sm font-medium text-ink mb-2 block">
                  You will teach
                </label>

                {loadingMySkills ? (
                  <p className="text-sm text-gray-400">
                    Loading your skills...
                  </p>
                ) : mySkills.length === 0 ? (
                  <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
                    <p className="text-sm text-orange-700">
                      You don't have any
                      active skills.
                    </p>

                    <p className="text-xs text-orange-600 mt-1">
                      Add a skill before
                      sending a swap request.
                    </p>
                  </div>
                ) : (
                  <select
                    value={
                      form.senderSkill
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        senderSkill:
                          e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">
                      Select your skill
                    </option>

                    {mySkills.map(
                      (skill) => (
                        <option
                          key={skill._id}
                          value={skill._id}
                        >
                          {skill.title} —{" "}
                          {skill.category}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              {/* ==================================
                  Message
              ================================== */}

              <div>
                <label className="text-sm font-medium text-ink mb-2 block">
                  Message{" "}
                  <span className="text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message:
                        e.target.value,
                    })
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Tell them why you'd like to swap skills..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />

                <p className="text-xs text-gray-400 text-right mt-1">
                  {form.message.length}/500
                </p>
              </div>

              {/* ==================================
                  Actions
              ================================== */}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeSwapModal}
                  disabled={sending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    sending ||
                    mySkills.length === 0
                  }
                >
                  <FiSend size={14} />

                  {sending
                    ? "Sending..."
                    : "Send Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}