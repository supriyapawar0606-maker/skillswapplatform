import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiPlus,
  FiPlay,
  FiPause,
} from "react-icons/fi";

import Avatar from "../components/Avatar";
import Button from "../components/Button";
import VerifiedBadge from "../components/VerifiedBadge";
import { useToast } from "../components/Toast";

import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const tabs = ["About", "Skills", "Reviews", "Swaps", "Bookmarks"];

export default function Profile() {
  const { user, loading, loadUser } = useAuth();

  const navigate = useNavigate();
  const showToast = useToast();

  const [tab, setTab] = useState("Skills");
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);

  // ==============================
  // My Skills
  // ==============================

  const [mySkills, setMySkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // ==============================
  // Profile Form
  // ==============================

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    location: "",
    skillsOffered: [],
    skillsWanted: [],
  });

  // ==============================
  // Load User Data
  // ==============================

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
      });
    }
  }, [user]);

  // ==============================
  // Fetch My Skills
  // ==============================

  const fetchMySkills = async () => {
    try {
      setSkillsLoading(true);

      const res = await API.get("/skills/my-skills");

      setMySkills(res.data.skills || []);
    } catch (error) {
      console.error("Failed to load profile skills:", error);

      setMySkills([]);

      showToast(
        error.response?.data?.message || "Failed to load skills",
        "error"
      );
    } finally {
      setSkillsLoading(false);
    }
  };

  // ==============================
  // Load Skills When Profile Opens
  // ==============================

  useEffect(() => {
    fetchMySkills();
  }, []);

  // ==============================
  // Loading Profile
  // ==============================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">
          Loading Profile...
        </p>
      </div>
    );
  }

  // ==============================
  // Share Profile
  // ==============================

  const shareProfile = () => {
    const url = `${window.location.origin}/dashboard/profile`;

    navigator.clipboard.writeText(url);

    showToast(
      "Profile link copied successfully",
      "success"
    );
  };

  // ==============================
  // Save Profile
  // ==============================

  const saveProfile = async () => {
    try {
      await API.put("/auth/profile", form);

      await loadUser();

      setEditing(false);

      showToast(
        "Profile updated successfully",
        "success"
      );
    } catch (err) {
      console.error("Update profile error:", err);

      showToast(
        err.response?.data?.message ||
          "Failed to update profile",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= Profile Header ================= */}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        <div className="h-40 bg-gradient-to-r from-brand-600 to-brand-400" />

        <div className="px-6 pb-6">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 gap-4">

            <div className="flex items-end gap-4">

              <div className="ring-4 ring-white rounded-full">

                <Avatar
                  name={user?.fullName || "User"}
                  src={user?.profileImage}
                  size={88}
                />

              </div>

              <div className="pb-1">

                <h1 className="font-display text-2xl font-bold flex items-center gap-2">

                  {user?.fullName || "Unknown User"}

                  <VerifiedBadge
                    level="Identity + Skill Verified"
                  />

                </h1>

                <p className="text-gray-500">
                  {user?.role || "Member"}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {user?.email}
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareProfile}
              >
                Share Profile
              </Button>

            </div>

          </div>

          {/* ================= User Info ================= */}

          <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-500">

            <span className="flex items-center gap-1">

              <FiMapPin size={15} />

              {user?.location || "Location not added"}

            </span>

            <span className="flex items-center gap-1">

              <FiCalendar size={15} />

              Joined{" "}

              {user?.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "Recently"}

            </span>

          </div>

          {/* ================= Stats ================= */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">

            <div>
              <p className="text-2xl font-bold">
                {mySkills.length}
              </p>

              <p className="text-sm text-gray-400">
                Skills
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                0
              </p>

              <p className="text-sm text-gray-400">
                Followers
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                0
              </p>

              <p className="text-sm text-gray-400">
                Following
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                ⭐ 5.0
              </p>

              <p className="text-sm text-gray-400">
                Rating
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================= Tabs ================= */}

      <div className="bg-white rounded-2xl border border-gray-100">

        <div className="flex gap-1 px-4 border-b border-gray-100 overflow-x-auto">

          {tabs.map((item) => (

            <button
              key={item}
              onClick={() => setTab(item)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                tab === item
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

        {/* ================= Tab Content ================= */}

        <div className="p-6">

          {/* ================= Skills ================= */}

          {tab === "Skills" && (
            <>
              <div className="flex justify-between items-center mb-6">

                <div>
                  <h3 className="text-xl font-bold">
                    My Skills
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Skills you offer to other
                    SkillSwap members.
                  </p>
                </div>

                <Button
                  size="sm"
                  icon={FiPlus}
                  onClick={() =>
                    navigate("/dashboard/skills")
                  }
                >
                  Add Skill
                </Button>

              </div>

              {/* Loading */}

              {skillsLoading ? (

                <div className="text-center py-12">

                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-4" />

                  <p className="text-gray-500">
                    Loading skills...
                  </p>

                </div>

              ) : mySkills.length > 0 ? (

                /* ================= Skill Cards ================= */

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {mySkills.map((skill) => (

                    <div
                      key={skill._id}
                      className="border rounded-xl p-5 hover:shadow-md transition bg-white"
                    >

                      <div className="flex justify-between items-start gap-3">

                        <h4 className="font-semibold text-lg">
                          {skill.title}
                        </h4>

                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full whitespace-nowrap">
                          {skill.level}
                        </span>

                      </div>

                      <p className="text-sm text-brand-600 mt-2">
                        {skill.category}
                      </p>

                      <p className="text-gray-600 text-sm mt-3 leading-6">
                        {skill.description}
                      </p>

                      <p className="text-xs text-gray-400 mt-4">
                        Availability:{" "}
                        {skill.availability}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                /* ================= Empty State ================= */

                <div className="text-center py-12">

                  <h3 className="text-lg font-semibold">
                    No Skills Added
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Start by adding your first skill.
                  </p>

                  <Button
                    className="mt-5"
                    onClick={() =>
                      navigate("/dashboard/skills")
                    }
                  >
                    Add Skill
                  </Button>

                </div>

              )}

            </>
          )}

          {/* ================= About ================= */}

          {tab === "About" && (
            <div className="space-y-8">

              <div>

                <h3 className="font-semibold mb-2">
                  Bio
                </h3>

                <p className="text-gray-600 leading-7">
                  {user?.bio ||
                    "No bio has been added yet."}
                </p>

              </div>

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <h4 className="font-semibold">
                    Full Name
                  </h4>

                  <p className="text-gray-500 mt-1">
                    {user?.fullName}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Email
                  </h4>

                  <p className="text-gray-500 mt-1">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Location
                  </h4>

                  <p className="text-gray-500 mt-1">
                    {user?.location || "Not Added"}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">
                    Role
                  </h4>

                  <p className="text-gray-500 mt-1 capitalize">
                    {user?.role || "Member"}
                  </p>
                </div>

              </div>

              <div>

                <h3 className="font-semibold mb-3">
                  Skills Wanted
                </h3>

                {user?.skillsWanted?.length > 0 ? (

                  <div className="flex flex-wrap gap-3">

                    {user.skillsWanted.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                ) : (

                  <p className="text-gray-500">
                    No skills added.
                  </p>

                )}

              </div>

              {/* ================= Video ================= */}

              <div>

                <h3 className="font-semibold mb-3">
                  Video Introduction
                </h3>

                <button
                  onClick={() =>
                    setPlaying(!playing)
                  }
                  className="relative w-full max-w-md aspect-video rounded-2xl bg-gradient-to-r from-brand-600 to-brand-400 flex items-center justify-center"
                >

                  <div className="bg-white rounded-full p-4">

                    {playing ? (
                      <FiPause
                        size={28}
                        className="text-brand-600"
                      />
                    ) : (
                      <FiPlay
                        size={28}
                        className="text-brand-600 ml-1"
                      />
                    )}

                  </div>

                </button>

              </div>

            </div>
          )}

          {/* ================= Reviews ================= */}

          {tab === "Reviews" && (
            <div>

              <h3 className="text-lg font-semibold">
                No Reviews Yet
              </h3>

              <p className="text-gray-500 mt-2">
                Reviews will appear after completing
                skill swaps.
              </p>

            </div>
          )}

          {/* ================= Swaps ================= */}

          {tab === "Swaps" && (
            <div>

              <h3 className="text-lg font-semibold">
                No Swap History
              </h3>

              <p className="text-gray-500 mt-2">
                Your completed swaps will appear here.
              </p>

            </div>
          )}

          {/* ================= Bookmarks ================= */}

          {tab === "Bookmarks" && (
            <div>

              <h3 className="text-lg font-semibold">
                No Bookmarks
              </h3>

              <p className="text-gray-500 mt-2">
                Saved skills and users will appear here.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* ================= Edit Profile Modal ================= */}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-bold mb-6">
              Edit Profile
            </h2>

            {/* Full Name */}

            <div className="mb-4">

              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={form.fullName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fullName: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            {/* Bio */}

            <div className="mb-4">

              <label className="block text-sm font-medium mb-2">
                Bio
              </label>

              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bio: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            {/* Location */}

            <div className="mb-4">

              <label className="block text-sm font-medium mb-2">
                Location
              </label>

              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            {/* Skills Offered */}

            <div className="mb-4">

              <label className="block text-sm font-medium mb-2">
                Skills Offered
              </label>

              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={form.skillsOffered.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    skillsOffered: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            {/* Skills Wanted */}

            <div className="mb-6">

              <label className="block text-sm font-medium mb-2">
                Skills Wanted
              </label>

              <input
                type="text"
                placeholder="UI Design, Python"
                value={form.skillsWanted.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    skillsWanted: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

            </div>

            <div className="flex justify-end gap-3">

              <Button
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>

              <Button onClick={saveProfile}>
                Save Changes
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}