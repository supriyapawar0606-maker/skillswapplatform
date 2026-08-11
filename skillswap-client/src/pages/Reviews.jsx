import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiLoader, FiPlus } from "react-icons/fi";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import API from "../api/axios";
import { useToast } from "../components/Toast";

function Stars({ rating }) {
  return (
    <div className="flex text-amber-500">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} size={12} className={i < rating ? "fill-amber-500" : ""} />
      ))}
    </div>
  );
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export default function Reviews() {
  const showToast = useToast();

  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [receivedRes, givenRes] = await Promise.allSettled([
          API.get("/reviews/mine"),
          API.get("/reviews/given"),
        ]);

        if (cancelled) return;

        if (receivedRes.status === "fulfilled" && receivedRes.value.data?.success) {
          setReceived(receivedRes.value.data.reviews || []);
          setAverageRating(receivedRes.value.data.averageRating || 0);
        }

        if (givenRes.status === "fulfilled" && givenRes.value.data?.success) {
          setGiven(givenRes.value.data.reviews || []);
        }
      } catch (error) {
        if (!cancelled) {
          showToast("Unable to load reviews.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const list = tab === "received" ? received : given;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl font-bold">Reviews</h1>
        <Link to="/dashboard/reviews/add">
          <Button size="sm" className="inline-flex items-center gap-1.5">
            <FiPlus size={14} /> Write a Review
          </Button>
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Two-way feedback keeps the community honest — both sides rate every swap
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-6">
        <div className="text-center">
          <p className="font-display font-bold text-4xl">{averageRating || "—"}</p>
          <div className="flex text-amber-500 mt-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={14} className={i < Math.round(averageRating) ? "fill-amber-500" : ""} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{received.length} reviews received</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[["received", "Reviews Received"], ["given", "Reviews You Gave"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === key ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <FiLoader className="animate-spin" /> Loading reviews…
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          {tab === "received"
            ? "No one has reviewed you yet."
            : "You haven't written any reviews yet."}
          {tab === "given" && (
            <div className="mt-3">
              <Link to="/dashboard/reviews/add" className="text-brand-600 font-medium hover:underline">
                Write your first review
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const person = tab === "received" ? r.reviewer : r.reviewee;
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={person?.fullName || "User"} size={36} />
                  <div>
                    <p className="text-sm font-medium">{person?.fullName || "Unknown user"}</p>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
