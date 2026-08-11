import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiSliders, FiMapPin } from "react-icons/fi";
import SkillCard from "../components/SkillCard";
import API from "../api/axios";
import { iconForCategory } from "../utils/categoryIcons";

const tabs = ["All", "Popular", "Trending", "Newest"];
const locations = ["Anywhere", "Near me (25 km)", "Same city", "Online only"];
const levels = ["Any level", "Beginner friendly", "Intermediate", "Advanced"];

function toCardSkill(skill) {
  return {
    id: skill._id,
    name: skill.title,
    teacher: skill.owner?.fullName || "Unknown",
    rating: skill.averageRating ?? 0,
    reviews: skill.reviewCount ?? 0,
    learners: skill.learners ?? 0,
    tag: skill.level === "Expert" ? "Popular" : undefined,
    icon: iconForCategory(skill.category),
    category: skill.category,
    createdAt: skill.createdAt,
  };
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState("Anywhere");
  const [level, setLevel] = useState("Any level");
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    API.get("/skills")
      .then((res) => {
        if (cancelled) return;
        setSkills((res.data.skills || []).map(toCardSkill));
      })
      .catch(() => {
        if (!cancelled) setSkills([]);
      });

    API.get("/categories")
      .then((res) => {
        if (cancelled) return;
        setCategories((res.data.categories || []).map((c) => ({ id: c.name, name: c.name })));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...skills];
    return sorted.filter((s) => {
      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.teacher.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || s.category === category;
      const matchesTab =
        tab === "All" ||
        (tab === "Popular" && s.tag === "Popular") ||
        (tab === "Trending" && s.learners > 5) ||
        (tab === "Newest" &&
          new Date(s.createdAt).getTime() >
            Date.now() - 1000 * 60 * 60 * 24 * 14);
      return matchesQuery && matchesCategory && matchesTab;
    });
  }, [skills, query, tab, category]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Explore Skills</h1>
      <p className="text-gray-500 mb-6">Discover skills taught by people in the community</p>

      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, categories or users"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand-500"
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="relative">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-brand-500 appearance-none"
          >
            {locations.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            showFilters ? "border-brand-500 text-brand-600 bg-brand-50" : "border-gray-200 bg-white text-ink"
          }`}
        >
          <FiSliders size={16} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-2 animate-pop-in">
          <span className="text-xs font-semibold text-gray-500 mr-1">Skill level:</span>
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                level === l ? "bg-brand-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-8">
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

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No skills found. Try a different search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
