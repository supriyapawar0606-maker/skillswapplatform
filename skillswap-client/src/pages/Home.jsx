import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiUsers, FiRefreshCw, FiStar, FiArrowRight, FiUserPlus, FiSearch, FiRepeat } from "react-icons/fi";
import { HiOutlineAcademicCap, HiOutlineUserGroup } from "react-icons/hi2";
import Button from "../components/Button";
import SkillIcon from "../components/SkillIcon";
import API from "../api/axios";
import { iconForCategory } from "../utils/categoryIcons";

const defaultStats = [
  { icon: FiUsers, value: "0", label: "Active Users" },
  { icon: HiOutlineAcademicCap, value: "0", label: "Skills Listed" },
  { icon: FiRefreshCw, value: "0", label: "Skills Swapped" },
  { icon: FiStar, value: "0", label: "User Rating" },
];

const perks = [
  {
    icon: HiOutlineAcademicCap,
    title: "Learn New Skills",
    desc: "Discover and learn from amazing people.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Teach & Earn",
    desc: "Share your skills and help others grow.",
  },
  {
    icon: FiUsers,
    title: "Build Connections",
    desc: "Connect with people who share your interests.",
  },
];

const steps = [
  { icon: FiUserPlus, title: "Create your profile", desc: "List the skills you can teach and what you'd like to learn." },
  { icon: FiSearch, title: "Find a match", desc: "Search the community for someone who teaches what you want." },
  { icon: FiRepeat, title: "Swap & grow", desc: "Schedule a session, exchange skills, and rate each other." },
];

export default function Home() {
  const [stats, setStats] = useState(defaultStats);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    API.get("/categories/site-stats")
      .then((res) => {
        if (cancelled) return;
        const s = res.data.stats || {};
        setStats([
          { icon: FiUsers, value: `${s.userCount ?? 0}+`, label: "Active Users" },
          { icon: HiOutlineAcademicCap, value: `${s.skillCount ?? 0}+`, label: "Skills Listed" },
          { icon: FiRefreshCw, value: `${s.completedSwaps ?? 0}+`, label: "Skills Swapped" },
          { icon: FiStar, value: `${s.averageRating ?? 0}`, label: "User Rating" },
        ]);
      })
      .catch(() => {});

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
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
            Exchange <span className="text-brand-600">Skills.</span>
            <br />
            Build <span className="text-emerald-500">Connections.</span>
            <br />
            Grow <span className="text-amber-500">Together.</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md">
            Teach what you know, learn what you don't, and grow together in a trusted community.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" icon={FiPlay}>How It Works</Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {perks.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <p.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-transparent rounded-full blur-3xl opacity-60" />
          <svg viewBox="0 0 400 300" className="relative w-full max-w-md">
            <circle cx="200" cy="150" r="90" fill="none" stroke="#DDD6FE" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="90" cy="180" r="46" fill="#EDE9FE" />
            <circle cx="310" cy="120" r="46" fill="#D1FAE5" />
            <circle cx="200" cy="60" r="26" fill="#8B5CF6" />
            <text x="200" y="68" textAnchor="middle" fill="white" fontSize="20">{"</>"}</text>
            <circle cx="90" cy="180" r="8" fill="#8B5CF6" />
            <circle cx="310" cy="120" r="8" fill="#10B981" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <s.icon size={20} />
              </div>
              <div>
                <p className="font-display font-bold text-xl leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Explore Popular Categories</h2>
          <Link to="/categories" className="text-brand-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/explore?category=${encodeURIComponent(c.name)}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-brand-300 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <SkillIcon icon={c.icon} className="mx-auto mb-3" />
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.count} Skills</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-14 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-6 relative">
              <span className="absolute top-5 right-5 font-display text-3xl font-bold text-brand-50">0{i + 1}</span>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <s.icon size={22} />
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl px-8 py-14 text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-3">Ready to start swapping skills?</h2>
          <p className="text-brand-100 mb-8 max-w-lg mx-auto">
            Join thousands of learners and mentors already growing together on SkillSwap.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">Join SkillSwap Free</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
