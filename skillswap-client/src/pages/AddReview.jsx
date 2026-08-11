import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiLoader, FiArrowLeft } from "react-icons/fi";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

// ==========================================
// Build the list of swap partners the user is
// eligible to review: accepted swaps (sent or
// received) that don't already have a review
// from this user.
// ==========================================

function buildEligibleSwaps(receivedSwaps, sentSwaps, myId, reviewedSwapIds) {
  const all = [...receivedSwaps, ...sentSwaps];

  return all
    .filter((swap) => swap.status === "Accepted")
    .filter((swap) => !reviewedSwapIds.has(swap._id))
    .map((swap) => {
      const iAmSender = swap.sender?._id === myId;
      const partner = iAmSender ? swap.receiver : swap.sender;
      const skillLearned = iAmSender ? swap.receiverSkill : swap.senderSkill;

      return {
        swapId: swap._id,
        partner,
        skillLearned: skillLearned?.title || "",
      };
    })
    .filter((entry) => entry.partner);
}

export default function AddReview() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useAuth();

  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwapId, setSelectedSwapId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [receivedRes, sentRes, givenRes] = await Promise.allSettled([
          API.get("/swaps/received"),
          API.get("/swaps/sent"),
          API.get("/reviews/given"),
        ]);

        if (cancelled) return;

        const receivedSwaps =
          receivedRes.status === "fulfilled"
            ? receivedRes.value.data?.swapRequests || []
            : [];

        const sentSwaps =
          sentRes.status === "fulfilled"
            ? sentRes.value.data?.swapRequests || []
            : [];

        const reviewedSwapIds = new Set(
          givenRes.status === "fulfilled"
            ? (givenRes.value.data?.reviews || []).map((r) => r.swap?._id).filter(Boolean)
            : []
        );

        const list = buildEligibleSwaps(receivedSwaps, sentSwaps, user._id, reviewedSwapIds);
        setEligible(list);
        if (list.length > 0) setSelectedSwapId(list[0].swapId);
      } catch (error) {
        if (!cancelled) showToast("Unable to load your swaps.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, showToast]);

  const selected = eligible.find((e) => e.swapId === selectedSwapId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;

    setSubmitting(true);
    try {
      await API.post("/reviews", {
        swap: selected.swapId,
        reviewee: selected.partner._id,
        rating,
        comment: comment.trim(),
        skillTaught: selected.skillLearned,
      });

      showToast("Review submitted", "success");
      navigate("/dashboard/reviews");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <button
        onClick={() => navigate("/dashboard/reviews")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-4"
      >
        <FiArrowLeft size={14} /> Back to Reviews
      </button>

      <h1 className="font-display text-2xl font-bold mb-1">Write a Review</h1>
      <p className="text-gray-500 text-sm mb-6">
        Rate someone you completed a skill swap with
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <FiLoader className="animate-spin" /> Loading your swaps…
        </div>
      ) : eligible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          You don't have any completed swaps left to review yet. Once a swap request
          is accepted, you'll be able to leave a review here.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Who are you reviewing?</label>
            <div className="space-y-2">
              {eligible.map((entry) => (
                <label
                  key={entry.swapId}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedSwapId === entry.swapId
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="swap"
                    className="accent-brand-600"
                    checked={selectedSwapId === entry.swapId}
                    onChange={() => setSelectedSwapId(entry.swapId)}
                  />
                  <Avatar name={entry.partner.fullName || "User"} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{entry.partner.fullName}</p>
                    {entry.skillLearned && (
                      <p className="text-xs text-gray-400 truncate">Taught you {entry.skillLearned}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-amber-500"
                >
                  <FiStar size={24} className={n <= (hoverRating || rating) ? "fill-amber-500" : ""} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="How was your swap experience?"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <Button type="submit" disabled={submitting || !selected} className="w-full">
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      )}
    </div>
  );
}
