import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiUpload } from "react-icons/fi";
import Button from "../components/Button";
import { useToast } from "../components/Toast";
import API from "../api/axios";

const sections = ["Profile", "Password", "Privacy", "Verification", "Danger Zone"];

export default function Settings() {
  const [active, setActive] = useState("Profile");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [idFile, setIdFile] = useState(null);
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    API.get("/auth/profile")
      .then((res) => {
        if (cancelled) return;
        setName(res.data.user.fullName || "");
        setBio(res.data.user.bio || "");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  function saveProfile(e) {
    e.preventDefault();
    API.put("/auth/profile", { fullName: name, bio })
      .then(() => showToast("Profile changes saved", "success"))
      .catch((err) => showToast(err.response?.data?.message || "Could not save changes", "error"));
  }

  function updatePassword(e) {
    e.preventDefault();
    if (!currentPw || !newPw) {
      showToast("Fill in both password fields", "error");
      return;
    }
    API.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw })
      .then(() => {
        setCurrentPw("");
        setNewPw("");
        showToast("Password updated successfully", "success");
      })
      .catch((err) => showToast(err.response?.data?.message || "Could not update password", "error"));
  }

  function togglePrivacy(label, checked) {
    showToast(`${label}: ${checked ? "on" : "off"}`, "info");
  }

  function submitVerification(e) {
    e.preventDefault();
    if (!idFile) {
      showToast("Upload an ID document first", "error");
      return;
    }
    showToast("ID submitted for verification — we'll email you within 48 hours", "success");
  }

  function deleteAccount() {
    if (window.confirm("This permanently deletes your account, skills, swaps, and messages. Continue?")) {
      API.delete("/auth/account")
        .then(() => {
          localStorage.removeItem("token");
          showToast("Account deletion requested", "info");
          navigate("/");
        })
        .catch((err) => showToast(err.response?.data?.message || "Could not delete account", "error"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your account preferences</p>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <div className="flex md:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left whitespace-nowrap ${
                active === s ? "bg-brand-50 text-brand-600" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {active === "Profile" && (
            <form onSubmit={saveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                  placeholder="Tell people about yourself"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          )}

          {active === "Password" && (
            <form onSubmit={updatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          )}

          {active === "Privacy" && (
            <div className="space-y-4 max-w-md">
              {["Show my profile to other users", "Allow direct messages", "Show online status"].map((label) => (
                <label key={label} className="flex items-center justify-between py-2">
                  <span className="text-sm">{label}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    onChange={(e) => togglePrivacy(label, e.target.checked)}
                    className="w-4 h-4 rounded accent-[#6d28d9]"
                  />
                </label>
              ))}
            </div>
          )}

          {active === "Verification" && (
            <form onSubmit={submitVerification} className="max-w-md space-y-5">
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 rounded-xl p-4">
                <FiCheckCircle size={20} />
                <div>
                  <p className="text-sm font-semibold">Skill Verified</p>
                  <p className="text-xs">You've completed a skill quiz for Node.js and React.js.</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Identity Verification (optional)</p>
                <p className="text-xs text-gray-500 mb-3">
                  Verify your identity with a government ID to earn the blue "Identity Verified" badge
                  and unlock higher swap request limits.
                </p>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-brand-400">
                  <FiUpload className="text-gray-400" size={22} />
                  <span className="text-sm text-gray-500">
                    {idFile ? idFile : "Upload ID document"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setIdFile(e.target.files?.[0]?.name || null)}
                  />
                </label>
              </div>

              <Button type="submit">Submit for Verification</Button>
            </form>
          )}

          {active === "Danger Zone" && (
            <div className="max-w-md">
              <p className="text-sm text-gray-500 mb-4">
                Deleting your account is permanent and removes all your skills, swaps, and messages.
              </p>
              <Button variant="danger" onClick={deleteAccount}>Delete Account</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
