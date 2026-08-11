const palette = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-teal-500",
];

function hashName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export default function Avatar({ name = "?", size = 40, online = false, className = "" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = palette[hashName(name) % palette.length];

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold ${color}`}
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
      )}
    </div>
  );
}
