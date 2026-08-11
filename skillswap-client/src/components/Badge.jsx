const styles = {
  Pending: "bg-amber-50 text-amber-600",
  Accepted: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-600",
  Completed: "bg-blue-50 text-blue-600",
  Popular: "bg-brand-50 text-brand-600",
};

export default function Badge({ status, children }) {
  const style = styles[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {children || status}
    </span>
  );
}
