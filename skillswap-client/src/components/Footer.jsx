import { FiInstagram, FiTwitter, FiLinkedin, FiGithub } from "react-icons/fi";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-ink text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="[&_span]:text-white mb-3">
            <Logo light />
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            Teach what you know, learn what you don't, and grow together in a trusted community.
          </p>
          <div className="flex gap-3 mt-5">
            {[FiInstagram, FiTwitter, FiLinkedin, FiGithub].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-600 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/explore" className="hover:text-white">Explore Skills</a></li>
            <li><a href="/categories" className="hover:text-white">Categories</a></li>
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SkillSwap. All rights reserved.
      </div>
    </footer>
  );
}
