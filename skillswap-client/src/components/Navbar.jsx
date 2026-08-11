import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "./Button";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-brand-600" : "text-gray-600 hover:text-brand-600"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Sign Up</Button>
          </Link>
        </div>

        <button
          className="lg:hidden text-ink"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700"
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">Login</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
