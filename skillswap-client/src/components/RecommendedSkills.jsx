import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiLoader } from "react-icons/fi";
import SkillIcon from "./SkillIcon";
import Button from "./Button";
import API from "../api/axios";
import { iconForCategory } from "../utils/categoryIcons";

export default function RecommendedSkills() {
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    API.get("/skills/recommended")
      .then((res) => {
        if (!cancelled && res.data?.success) {
          setRecommended(res.data.recommended || []);
        }
      })
      .catch(() => {
        if (!cancelled) setRecommended([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiZap className="text-brand-600" /> Recommended For You
        </h3>
        <div className="flex items-center justify-center py-6 text-gray-400 text-sm gap-2">
          <FiLoader className="animate-spin" size={14} /> Loading…
        </div>
      </div>
    );
  }

  if (recommended.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FiZap className="text-brand-600" /> Recommended For You
      </h3>
      <div className="space-y-3">
        {recommended.map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <SkillIcon icon={iconForCategory(r.category)} size={16} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.title}</p>
              <p className="text-xs text-gray-400 truncate">{r.reason}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/dashboard/discover?q=${encodeURIComponent(r.title)}`)}
            >
              Explore
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
