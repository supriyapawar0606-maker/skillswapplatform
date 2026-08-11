import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SkillIcon from "../components/SkillIcon";
import API from "../api/axios";
import { iconForCategory } from "../utils/categoryIcons";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    API.get("/categories")
      .then((res) => {
        if (cancelled) return;
        setCategories(
          (res.data.categories || []).map((c) => ({
            id: c.name,
            name: c.name,
            count: c.count,
            icon: iconForCategory(c.name),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold mb-2">Browse Categories</h1>
      <p className="text-gray-500 mb-8">Find the right category to start learning or teaching</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/explore?category=${c.name}`}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-brand-300 hover:-translate-y-0.5 transition-all"
          >
            <SkillIcon icon={c.icon} className="mx-auto mb-3" />
            <p className="font-semibold text-sm">{c.name}</p>
            <p className="text-xs text-gray-400">{c.count} Skills</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
