import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiTool,
  FiRepeat,
  FiCheckCircle,
  FiBookmark,
  FiTrendingUp,
} from "react-icons/fi";

import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SkillIcon from "../components/SkillIcon";
import GamificationCard from "../components/GamificationCard";
import RecommendedSkills from "../components/RecommendedSkills";
import { useToast } from "../components/Toast";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { iconForCategory } from "../utils/categoryIcons";

// ==========================================
// Convert Swap Request → Dashboard Row
// ==========================================

function toRow(request) {
  return {
    id: request._id,
    name:
      request.sender?.fullName ||
      "Unknown User",

    wantsToLearn:
      request.receiverSkill?.title ||
      "—",

    youTeach:
      request.senderSkill?.title ||
      "—",

    status: request.status,
  };
}

// ==========================================
// Dashboard
// ==========================================

export default function Dashboard() {
  const navigate = useNavigate();
  const showToast = useToast();

  const { user, loading: authLoading } = useAuth();

  // ========================================
  // State
  // ========================================

  const [requests, setRequests] = useState([]);

  const [trendingSkills, setTrendingSkills] =
    useState([]);

  const [suggestedUsers, setSuggestedUsers] =
    useState([]);

  const [stats, setStats] = useState({
    requestCount: 0,
    completedCount: 0,
    bookmarkCount: 0,
  });

  const [gamification, setGamification] = useState({
    points: 0,
    completedSwaps: 0,
    reviewCount: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [respondingId, setRespondingId] =
    useState(null);

  // ========================================
  // Load Dashboard Data
  // ========================================

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        // ==================================
        // Fetch all dashboard data
        // ==================================

        const [
          swapResponse,
          bookmarkResponse,
          trendingResponse,
          discoverResponse,
          leaderboardResponse,
        ] = await Promise.allSettled([
          API.get("/swaps/received"),
          API.get("/bookmarks/mine"),
          API.get("/categories/trending"),
          API.get("/skills/discover"),
          API.get("/leaderboard"),
        ]);

        if (cancelled) {
          return;
        }

        // ==================================
        // Swap Requests
        // ==================================

        if (
          swapResponse.status ===
          "fulfilled"
        ) {
          const allRequests =
            swapResponse.value.data
              ?.swapRequests || [];

          setRequests(
            allRequests
              .slice(0, 5)
              .map(toRow)
          );

          setStats((previous) => ({
            ...previous,

            requestCount:
              allRequests.filter(
                (request) =>
                  request.status ===
                  "Pending"
              ).length,

            completedCount:
              allRequests.filter(
                (request) =>
                  request.status ===
                  "Accepted"
              ).length,
          }));
        }

        // ==================================
        // Bookmarks
        // ==================================

        if (
          bookmarkResponse.status ===
          "fulfilled"
        ) {
          const data =
            bookmarkResponse.value.data;

          const skillBookmarks =
            data?.skills?.length || 0;

          const userBookmarks =
            data?.users?.length || 0;

          setStats((previous) => ({
            ...previous,

            bookmarkCount:
              skillBookmarks +
              userBookmarks,
          }));
        }

        // ==================================
        // Trending Skills
        // ==================================

        if (
          trendingResponse.status ===
          "fulfilled"
        ) {
          const data =
            trendingResponse.value.data;

          const trending =
            data?.trendingSkills || [];

          setTrendingSkills(
            trending.map((skill) => ({
              id: skill.id,
              name: skill.name,
              learners:
                skill.learners || 0,

              icon: iconForCategory(
                skill.category
              ),
            }))
          );
        }

        // ==================================
        // Suggested Skills / Users
        // ==================================

        if (
          discoverResponse.status ===
          "fulfilled"
        ) {
          const data =
            discoverResponse.value.data;

          const skills =
            data?.skills || [];

          setSuggestedUsers(
            skills
              .slice(0, 4)
              .map((skill) => ({
                id: skill._id,

                name:
                  skill.owner?.fullName ||
                  "Unknown User",

                skill:
                  skill.title ||
                  "Unknown Skill",
              }))
          );
        }
        // ==================================
        // Gamification (my own leaderboard entry)
        // ==================================

        if (
          leaderboardResponse.status ===
          "fulfilled"
        ) {
          const entries =
            leaderboardResponse.value.data
              ?.leaderboard || [];

          const mine = entries.find(
            (entry) =>
              entry.user?._id === user._id
          );

          if (mine) {
            setGamification({
              points: mine.points || 0,
              completedSwaps:
                mine.completedSwaps || 0,
              reviewCount:
                mine.reviewCount || 0,
            });
          }
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        if (!cancelled) {
          showToast(
            "Unable to load dashboard data.",
            "error"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    showToast,
  ]);

  // ========================================
  // Accept / Reject Swap Request
  // ========================================

  const respond = async (
    id,
    status
  ) => {
    const request = requests.find(
      (item) => item.id === id
    );

    if (!request) {
      return;
    }

    if (respondingId) {
      return;
    }

    const endpoint =
      status === "Accepted"
        ? "accept"
        : "reject";

    setRespondingId(id);

    try {
      await API.put(
        `/swaps/${id}/${endpoint}`
      );

      // Update request locally
      setRequests((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      // Update statistics
      if (status === "Accepted") {
        setStats((previous) => ({
          ...previous,

          requestCount:
            Math.max(
              0,
              previous.requestCount - 1
            ),

          completedCount:
            previous.completedCount + 1,
        }));
      } else {
        setStats((previous) => ({
          ...previous,

          requestCount:
            Math.max(
              0,
              previous.requestCount - 1
            ),
        }));
      }

      showToast(
        status === "Accepted"
          ? `You accepted ${request.name}'s swap request`
          : `You declined ${request.name}'s swap request`,
        status === "Accepted"
          ? "success"
          : "info"
      );
    } catch (error) {
      console.error(
        "Swap response error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Something went wrong.",
        "error"
      );
    } finally {
      setRespondingId(null);
    }
  };

  // ========================================
  // Authentication Loading
  // ========================================

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // No User
  // ========================================

  if (!user) {
    return null;
  }

  // ========================================
  // Dashboard Cards
  // ========================================

  const cards = [
    {
      label: "My Skills",
      value:
        user.skillsOffered?.length || 0,
      icon: FiTool,
      to: "/dashboard/skills",
    },

    {
      label: "Swap Requests",
      value: stats.requestCount,
      icon: FiRepeat,
      to: "/dashboard/requests",
    },

    {
      label: "Completed Swaps",
      value: stats.completedCount,
      icon: FiCheckCircle,
      to: "/dashboard/requests",
    },

    {
      label: "Bookmarks",
      value: stats.bookmarkCount,
      icon: FiBookmark,
      to: "/dashboard/bookmarks",
    },
  ];

  // ========================================
  // Main UI
  // ========================================

  return (
    <div className="space-y-6">

      {/* ====================================
          WELCOME
      ==================================== */}

      <div>
        <h1 className="font-display text-2xl font-bold">
          Hello,{" "}
          {
            (
              user.fullName ||
              "there"
            ).split(" ")[0]
          }! 👋
        </h1>

        <p className="text-gray-500 mt-1">
          What do you want to learn today?
        </p>
      </div>


      {/* ====================================
          STAT CARDS
      ==================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.label}
              to={card.to}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand-300 hover:-translate-y-0.5 transition-all block"
            >

              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>

              <p className="text-2xl font-bold font-display">
                {loading ? "—" : card.value}
              </p>

              <div className="flex items-center justify-between mt-1">

                <p className="text-xs text-gray-500">
                  {card.label}
                </p>

                <span className="text-xs text-brand-600 font-medium">
                  View all
                </span>

              </div>

            </Link>
          );
        })}

      </div>


      {/* ====================================
          MAIN DASHBOARD GRID
      ==================================== */}

      <div className="grid lg:grid-cols-3 gap-6">


        {/* ==================================
            RECENT SWAP REQUESTS
        ================================== */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold">
              Recent Swap Requests
            </h3>

            <Link
              to="/dashboard/requests"
              className="text-xs text-brand-600 font-medium"
            >
              View All
            </Link>

          </div>


          {loading ? (
            <div className="space-y-3">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-16 rounded-xl bg-gray-50 animate-pulse"
                  />
                )
              )}

            </div>
          ) : (
            <div className="space-y-3">

              {requests.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No swap requests yet.
                </p>
              )}

              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50"
                >

                  <Avatar
                    name={request.name}
                    size={40}
                  />


                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium">
                      {request.name}
                    </p>

                    <p className="text-xs text-gray-500">

                      wants to learn{" "}

                      <span className="font-medium text-ink">
                        {request.wantsToLearn}
                      </span>

                    </p>

                  </div>


                  <div className="text-xs text-gray-400 text-right hidden sm:block">

                    You teach
                    <br />

                    <span className="font-medium text-ink">
                      {request.youTeach}
                    </span>

                  </div>


                  {request.status ===
                  "Pending" ? (
                    <div className="flex gap-2">

                      <Button
                        size="sm"
                        disabled={
                          respondingId ===
                          request.id
                        }
                        onClick={() =>
                          respond(
                            request.id,
                            "Accepted"
                          )
                        }
                      >
                        {respondingId ===
                        request.id
                          ? "..."
                          : "Accept"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          respondingId ===
                          request.id
                        }
                        onClick={() =>
                          respond(
                            request.id,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </Button>

                    </div>
                  ) : (
                    <Badge
                      status={
                        request.status
                      }
                    />
                  )}

                </div>
              ))}

            </div>
          )}

        </div>


        {/* ==================================
            RIGHT SIDEBAR
        ================================== */}

        <div className="space-y-6">

          {/* Gamification */}

          <GamificationCard
            points={gamification.points}
            completedSwaps={gamification.completedSwaps}
            reviewCount={gamification.reviewCount}
          />


          {/* Recommended Skills */}

          <RecommendedSkills />


          {/* =================================
              TRENDING SKILLS
          ================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 p-5">

            <h3 className="font-semibold mb-4 flex items-center gap-2">

              <FiTrendingUp className="text-orange-500" />

              Top Skills Trending

            </h3>


            <div className="space-y-3">

              {trendingSkills.length ===
                0 && (
                <p className="text-xs text-gray-400">
                  No trending data yet.
                </p>
              )}


              {trendingSkills.map(
                (skill) => (
                  <button
                    key={skill.id}
                    onClick={() =>
                      navigate(
                        `/explore?q=${encodeURIComponent(
                          skill.name
                        )}`
                      )
                    }
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-xl p-1.5 -m-1.5 transition-colors"
                  >

                    <SkillIcon
                      icon={skill.icon}
                      size={16}
                    />

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-medium truncate">
                        {skill.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {skill.learners}{" "}
                        learners
                      </p>

                    </div>

                  </button>
                )
              )}

            </div>

          </div>


          {/* =================================
              SUGGESTED USERS
          ================================= */}

          <div className="bg-white rounded-2xl border border-gray-100 p-5">

            <h3 className="font-semibold mb-4">
              Suggested For You
            </h3>

            <div className="space-y-3">

              {suggestedUsers.length ===
                0 && (
                <p className="text-xs text-gray-400">
                  No suggestions yet.
                </p>
              )}


              {suggestedUsers.map(
                (suggestedUser) => (
                  <div
                    key={suggestedUser.id}
                    className="flex items-center gap-3"
                  >

                    <Avatar
                      name={
                        suggestedUser.name
                      }
                      size={36}
                    />

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-medium truncate">
                        {
                          suggestedUser.name
                        }
                      </p>

                      <p className="text-xs text-gray-400 truncate">
                        {
                          suggestedUser.skill
                        }
                      </p>

                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(
                          "/dashboard/discover"
                        )
                      }
                    >
                      View
                    </Button>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

