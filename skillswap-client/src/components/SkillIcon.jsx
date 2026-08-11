import {
  FiCode,
  FiEdit3,
  FiBriefcase,
  FiUser,
  FiMusic,
  FiGlobe,
  FiCamera,
  FiVideo,
} from "react-icons/fi";
import { HiOutlineMegaphone } from "react-icons/hi2";

const map = {
  code: FiCode,
  pen: FiEdit3,
  briefcase: FiBriefcase,
  person: FiUser,
  music: FiMusic,
  globe: FiGlobe,
  camera: FiCamera,
  video: FiVideo,
  megaphone: HiOutlineMegaphone,
};

const bgMap = {
  code: "bg-indigo-100 text-indigo-600",
  pen: "bg-emerald-100 text-emerald-600",
  briefcase: "bg-blue-100 text-blue-600",
  person: "bg-amber-100 text-amber-600",
  music: "bg-pink-100 text-pink-600",
  globe: "bg-teal-100 text-teal-600",
  camera: "bg-orange-100 text-orange-600",
  video: "bg-violet-100 text-violet-600",
  megaphone: "bg-rose-100 text-rose-600",
};

export default function SkillIcon({ icon = "code", size = 20, className = "" }) {
  const Icon = map[icon] || FiCode;
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgMap[icon]} ${className}`}
    >
      <Icon size={size} />
    </div>
  );
}
