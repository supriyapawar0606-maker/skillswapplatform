import React from "react";
import logo from "../assets/skill-swaplogo.png";

export default function Logo({ light = false }) {
  return (
    <div className="flex items-center">
      <img
        src={logo}
        alt="SkillSwap"
        className="w-[145px] h-auto object-contain"
      />
    </div>
  );
}