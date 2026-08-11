import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function VerifiedBadge({ level = "Skill Verified", size = 14 }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <FiCheckCircle className="text-brand-600" size={size} />
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-ink text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg z-10">
          {level}
        </span>
      )}
    </span>
  );
}
