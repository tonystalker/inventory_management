export default function StatCard({ title, value, icon, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    green:  "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red:    "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
