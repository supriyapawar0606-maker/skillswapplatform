import { useState } from "react";
import { FiStar, FiBookmark } from "react-icons/fi";
import SkillIcon from "./SkillIcon";
import Badge from "./Badge";
import { useToast } from "./Toast";

export default function SkillCard({ skill, onToggleBookmark }) {
  const [saved, setSaved] = useState(!!skill.bookmarked);
  const showToast = useToast();

  function toggleBookmark(e) {
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    showToast(next ? `Saved "${skill.name}" to your bookmarks` : `Removed "${skill.name}" from bookmarks`, "success");
    onToggleBookmark?.(skill.id, next);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-brand-600/5 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <SkillIcon icon={skill.icon} />
        <button
          onClick={toggleBookmark}
          className={`transition-colors active:scale-90 duration-150 ${saved ? "text-brand-600" : "text-gray-300 hover:text-brand-600"}`}
          aria-label={saved ? "Remove bookmark" : "Bookmark"}
          aria-pressed={saved}
        >
          <FiBookmark size={18} className={saved ? "fill-brand-600" : ""} />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-semibold text-ink">{skill.name}</h4>
        {skill.tag && <Badge status={skill.tag} />}
      </div>
      <p className="text-sm text-gray-500 mb-3">by {skill.teacher}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-amber-500 font-medium">
          <FiStar size={14} className="fill-amber-500" />
          {skill.rating} <span className="text-gray-400 font-normal">({skill.reviews})</span>
        </span>
        <span className="text-gray-400">{skill.learners} learners</span>
      </div>
    </div>
  );
}
