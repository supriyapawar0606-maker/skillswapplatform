import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiCheck } from "react-icons/fi";
import Avatar from "./Avatar";
import Button from "./Button";
import VerifiedBadge from "./VerifiedBadge";
import { useToast } from "./Toast";

export default function UserCard({ name, role, rating, reviews, verified = true }) {
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  function handleConnect(e) {
    e.stopPropagation();
    setConnected(true);
    showToast(`Connection request sent to ${name}`, "success");
  }

  return (
    <div
      onClick={() => navigate("/dashboard/profile")}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:border-brand-300 hover:-translate-y-0.5 transition-all"
    >
      <Avatar name={name} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink truncate flex items-center gap-1">
          {name} {verified && <VerifiedBadge size={12} />}
        </p>
        <p className="text-xs text-gray-500 truncate">{role}</p>
        <span className="flex items-center gap-1 text-amber-500 text-xs font-medium mt-0.5">
          <FiStar size={12} className="fill-amber-500" /> {rating}
          <span className="text-gray-400 font-normal">({reviews})</span>
        </span>
      </div>
      {connected ? (
        <Button variant="outline" size="sm" disabled icon={FiCheck}>Requested</Button>
      ) : (
        <Button variant="outline" size="sm" onClick={handleConnect}>Connect</Button>
      )}
    </div>
  );
}
