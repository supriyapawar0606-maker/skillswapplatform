import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import Button from "../components/Button";
import Logo from "../components/Logo";
import { useToast } from "../components/Toast";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await API.post("/auth/register", form);

      if (response.data.success) {
        showToast(
          "Registration Successful! Please login.",
          "success"
        );

        navigate("/login");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Registration Failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8f7fc] px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="font-display text-2xl font-bold text-center mb-1">
          Create your account
        </h1>

        <p className="text-gray-500 text-sm text-center mb-8">
          Start teaching and learning today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-ink mb-1.5 block">
              Full Name
            </label>

            <div className="relative">
              <FiUser
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fullName: e.target.value,
                  })
                }
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-ink mb-1.5 block">
              Email Address
            </label>

            <div className="relative">
              <FiMail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-ink mb-1.5 block">
              Password
            </label>

            <div className="relative">
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Create a password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              required
              className="rounded border-gray-300 mt-0.5"
            />

            I agree to the Terms of Service and Privacy Policy
          </label>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-brand-600 font-semibold"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}