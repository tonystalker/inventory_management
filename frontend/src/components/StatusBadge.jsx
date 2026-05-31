const STATUS_CONFIG = {
  placed:        { label: "Placed",          bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-500"   },
  processing:    { label: "Processing",      bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
  picked_packed: { label: "Picked & Packed", bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
  shipped:       { label: "Shipped",         bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
  delivered:     { label: "Delivered",       bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500"  },
  returned:      { label: "Returned",        bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  cancelled:     { label: "Cancelled",       bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["placed"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
