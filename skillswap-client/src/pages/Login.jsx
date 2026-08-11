import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import Button from "../components/Button";
import Logo from "../components/Logo";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const showToast = useToast();

  const { login } = useAuth();

  // ==========================================
  // Handle Login
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await login(
        form.email.trim(),
        form.password
      );

      showToast(
        "Login Successful!",
        "success"
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Login Failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* =====================================
            LOGO
        ===================================== */}

        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo />
          </Link>
        </div>


        {/* =====================================
            LOGIN CARD
        ===================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          <h1 className="font-display text-2xl font-bold text-center mb-1">
            Welcome back
          </h1>

          <p className="text-gray-500 text-sm text-center mb-8">
            Log in to continue swapping skills
          </p>


          {/* =====================================
              LOGIN FORM
          ===================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* =================================
                EMAIL
            ================================= */}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-ink mb-1.5 block"
              >
                Email Address
              </label>

              <div className="relative">

                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />

              </div>
            </div>


            {/* =================================
                PASSWORD
            ================================= */}

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink mb-1.5 block"
              >
                Password
              </label>

              <div className="relative">

                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPw
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />


                {/* Show / Hide Password */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPw(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPw
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPw ? (
                    <FiEyeOff size={16} />
                  ) : (
                    <FiEye size={16} />
                  )}
                </button>

              </div>
            </div>


            {/* =================================
                REMEMBER / FORGOT PASSWORD
            ================================= */}

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">

                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                />

                Remember me

              </label>


              <Link
                to="/forgot-password"
                className="text-brand-600 font-medium hover:text-brand-700"
              >
                Forgot password?
              </Link>

            </div>


            {/* =================================
                LOGIN BUTTON
            ================================= */}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Log In"}
            </Button>

          </form>


          {/* =====================================
              REGISTER LINK
          ===================================== */}

          <p className="text-center text-sm text-gray-500 mt-6">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-brand-600 font-semibold hover:text-brand-700"
            >
              Sign up
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

