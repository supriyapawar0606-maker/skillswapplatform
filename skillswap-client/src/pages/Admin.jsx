import { useEffect, useState } from "react";
import { FiUsers, FiRepeat, FiFlag, FiTrendingUp, FiTrash2, FiLoader } from "react-icons/fi";
import { useToast } from "../components/Toast";
import API from "../api/axios";

export default function Admin() {
  const showToast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [statsRes, usersRes, skillsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/skills"),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setSkills(skillsRes.data.skills);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load admin data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
      showToast(`${name} was deleted`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  }

  async function handleDeleteSkill(id, title) {
    if (!window.confirm(`Remove skill "${title}"?`)) return;
    try {
      await API.delete(`/admin/skills/${id}`);
      setSkills((s) => s.filter((x) => x._id !== id));
      showToast(`"${title}" was removed`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete skill", "error");
    }
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.userCount, icon: FiUsers },
        { label: "Total Swaps", value: stats.swapCount, icon: FiRepeat },
        { label: "Pending Swaps", value: stats.pendingSwaps, icon: FiFlag },
        { label: "Listed Skills", value: stats.skillCount, icon: FiTrendingUp },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
        <FiLoader className="animate-spin" /> Loading admin dashboard…
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Platform-wide analytics and moderation</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <s.icon size={18} />
            </div>
            <p className="text-xl font-bold font-display">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100">
          <button
            onClick={() => setTab("users")}
            className={`px-3 pb-3 text-sm font-medium border-b-2 -mb-px transition ${
              tab === "users"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab("skills")}
            className={`px-3 pb-3 text-sm font-medium border-b-2 -mb-px transition ${
              tab === "skills"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Skills ({skills.length})
          </button>
        </div>

        {tab === "users" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Joined</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-3">{u.fullName || u.name}</td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-brand-50 text-brand-600"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.fullName || u.name)}
                          className="text-red-500 hover:text-red-600 inline-flex items-center gap-1"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Skill</th>
                  <th className="pb-2 font-medium">Owner</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {skills.map((s) => (
                  <tr key={s._id}>
                    <td className="py-3">{s.title}</td>
                    <td className="py-3 text-gray-500">
                      {s.owner?.fullName || s.owner?.email || "—"}
                    </td>
                    <td className="py-3 text-gray-400">{s.category || "—"}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteSkill(s._id, s.title)}
                        className="text-red-500 hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <FiTrash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No skills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
