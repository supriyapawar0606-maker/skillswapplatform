import { FiZap, FiTrendingUp, FiAward } from "react-icons/fi";

// Points-to-level thresholds. Points themselves come from the real
// leaderboard calculation on the backend (completed swaps + reviews).
const LEVELS = [
  { min: 0, label: "Newcomer" },
  { min: 100, label: "Rising Swapper" },
  { min: 500, label: "Skilled Swapper" },
  { min: 1000, label: "Gold Mentor" },
  { min: 2000, label: "Platinum Mentor" },
];

export function levelForPoints(points) {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }

  return {
    label: current.label,
    nextLevelAt: next ? next.min : null,
  };
}

export default function GamificationCard({
  points = 0,
  completedSwaps = 0,
  reviewCount = 0,
}) {
  const { label, nextLevelAt } = levelForPoints(points);
  const pct = nextLevelAt
    ? Math.min(100, Math.round((points / nextLevelAt) * 100))
    : 100;

  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiAward size={18} />
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <span className="flex items-center gap-1 text-xs bg-white/15 px-2.5 py-1 rounded-full">
          <FiZap size={12} /> {completedSwaps} swaps
        </span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <p className="font-display font-bold text-2xl">{points} pts</p>
        <p className="text-xs text-brand-100">
          {nextLevelAt ? `${nextLevelAt - points} to next level` : "Top level"}
        </p>
      </div>
      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-brand-100 mt-3 flex items-center gap-1">
        <FiTrendingUp size={12} /> {reviewCount} reviews · 20 pts per swap, 5 pts per review
      </p>
    </div>
  );
}
