import { useEffect, useState } from "react";
import {
  FiAward,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import API from "../api/axios";
import { useToast } from "../components/Toast";


// ==========================================
// Categories
// ==========================================

const categories = [
  "All",
  "Development",
  "Design",
  "Business",
  "Music",
];


// ==========================================
// Medal Colors
// ==========================================

const medalColor = {
  1: "text-amber-500",
  2: "text-gray-400",
  3: "text-orange-700",
};


// ==========================================
// Leaderboard Page
// ==========================================

export default function Leaderboard() {
  const [cat, setCat] = useState("All");

  const [leaders, setLeaders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const showToast = useToast();


  // ==========================================
  // Load Leaderboard
  // ==========================================

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/leaderboard");

      if (response.data?.success) {
        setLeaders(
          response.data.leaderboard || []
        );
      } else {
        setLeaders([]);
      }
    } catch (error) {
      console.error(
        "Load leaderboard error:",
        error
      );

      setLeaders([]);

      setError(
        error.response?.data?.message ||
          "Failed to load leaderboard"
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load leaderboard",
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
    loadLeaderboard();
  }, []);


  // ==========================================
  // Filter Leaderboard
  // ==========================================

  const filtered =
    cat === "All"
      ? leaders
      : leaders.filter((leader) => {
          if (
            leader.categories &&
            Array.isArray(leader.categories)
          ) {
            return leader.categories.includes(
              cat
            );
          }

          return leader.category === cat;
        });


  return (
    <div className="w-full">

      {/* ======================================
          Header
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="font-display text-2xl font-bold">
            Leaderboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Top mentors ranked by skill points
          </p>
        </div>


        {/* Refresh */}

        <button
          type="button"
          onClick={loadLeaderboard}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw
            size={15}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>


      {/* ======================================
          Category Filters
      ====================================== */}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() =>
              setCat(category)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              cat === category
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {category}
          </button>
        ))}

      </div>


      {/* ======================================
          Loading
      ====================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

          <FiClock
            size={26}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="text-sm text-gray-400">
            Loading leaderboard...
          </p>

        </div>
      )}


      {/* ======================================
          Error
      ====================================== */}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">

          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadLeaderboard}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>

        </div>
      )}


      {/* ======================================
          Empty
      ====================================== */}

      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <FiAward size={25} />
            </div>

            <h3 className="font-semibold text-gray-700">
              No leaderboard data
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              There are no users in this
              category yet.
            </p>

          </div>
        )}


      {/* ======================================
          Leaderboard
      ====================================== */}

      {!loading &&
        !error &&
        filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">

            {filtered.map((leader) => (

              <div
                key={leader.user?._id}
                className="flex items-center gap-4 p-4"
              >

                {/* ==================================
                    Rank
                ================================== */}

                <div
                  className={`w-8 flex-shrink-0 text-center font-display font-bold ${
                    medalColor[
                      leader.rank
                    ] || "text-gray-300"
                  }`}
                >

                  {leader.rank <= 3 ? (
                    <FiAward
                      size={20}
                      className="mx-auto"
                    />
                  ) : (
                    leader.rank
                  )}

                </div>


                {/* ==================================
                    Avatar
                ================================== */}

                <Avatar
                  name={
                    leader.user?.fullName ||
                    "User"
                  }
                  size={40}
                />


                {/* ==================================
                    User Information
                ================================== */}

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-medium truncate">
                    {leader.user?.fullName ||
                      "Unknown User"}
                  </p>

                  <p className="text-xs text-gray-400">
                    {leader.category ||
                      "General"}{" "}
                    ·{" "}
                    {leader.completedSwaps || 0}{" "}
                    swaps completed
                  </p>

                  {leader.averageRating >
                    0 && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      ⭐{" "}
                      {leader.averageRating}{" "}
                      rating ·{" "}
                      {leader.reviewCount || 0}{" "}
                      reviews
                    </p>
                  )}

                </div>


                {/* ==================================
                    Points
                ================================== */}

                <Badge status="Popular">
                  {leader.points || 0} pts
                </Badge>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}