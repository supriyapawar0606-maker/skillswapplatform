import { useEffect, useState } from "react";
import SkillCard from "../components/SkillCard";
import UserCard from "../components/UserCard";
import API from "../api/axios";
import { iconForCategory } from "../utils/categoryIcons";

const tabs = ["Skills", "Users"];

function toCardSkill(skill) {
  return {
    id: skill._id,
    name: skill.title,
    teacher: skill.owner?.fullName || "Unknown",
    rating: skill.averageRating ?? 0,
    reviews: skill.reviewCount ?? 0,
    learners: skill.learners ?? 0,
    icon: iconForCategory(skill.category),
  };
}

export default function Bookmarks() {
  const [tab, setTab] = useState("Skills");
  const [savedSkills, setSavedSkills] = useState([]);
  const [bookmarkedUsers, setBookmarkedUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    API.get("/bookmarks/mine")
      .then((res) => {
        if (cancelled) return;
        setSavedSkills((res.data.skills || []).map(toCardSkill));
        setBookmarkedUsers(
          (res.data.users || []).map((u) => ({
            name: u.fullName,
            role: u.bio || u.location || "SkillSwap member",
            rating: u.averageRating ?? 0,
            reviews: u.reviewCount ?? 0,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSavedSkills([]);
          setBookmarkedUsers([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleToggle(id, isSaved) {
    if (!isSaved) {
      setSavedSkills((skills) => skills.filter((s) => s.id !== id));
      API.post("/bookmarks/toggle", { targetType: "Skill", skill: id }).catch(() => {});
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Bookmarks</h1>
      <p className="text-gray-500 text-sm mb-6">Skills and people you've saved for later</p>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Skills" ? (
        savedSkills.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            No bookmarked skills yet. Tap the bookmark icon on any skill card in Explore to save it here.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedSkills.map((s) => (
              <SkillCard key={s.id} skill={{ ...s, bookmarked: true }} onToggleBookmark={handleToggle} />
            ))}
          </div>
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedUsers.map((u) => (
            <UserCard key={u.name} {...u} />
          ))}
        </div>
      )}
    </div>
  );
}
