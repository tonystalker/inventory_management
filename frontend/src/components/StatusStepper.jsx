const PIPELINE = [
  { value: "placed",        label: "Placed"          },
  { value: "processing",    label: "Processing"      },
  { value: "picked_packed", label: "Picked & Packed" },
  { value: "shipped",       label: "Shipped"         },
  { value: "delivered",     label: "Delivered"       },
];

const OFF_PIPELINE = ["returned", "cancelled"];

export default function StatusStepper({ currentStatus }) {
  if (OFF_PIPELINE.includes(currentStatus)) {
    const isReturned  = currentStatus === "returned";
    const colorClass  = isReturned ? "text-red-600 bg-red-50 border-red-200" : "text-gray-500 bg-gray-50 border-gray-200";
    return (
      <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${colorClass}`}>
        {isReturned ? "↩ Returned" : "✕ Cancelled"}
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.value === currentStatus);

  return (
    <div className="flex items-center gap-0">
      {PIPELINE.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive    = idx === currentIdx;
        const isPending   = idx > currentIdx;

        return (
          <div key={step.value} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all
                  ${isCompleted ? "border-green-500 bg-green-500 text-white"  : ""}
                  ${isActive    ? "border-blue-500 bg-blue-500 text-white scale-110 shadow-md" : ""}
                  ${isPending   ? "border-gray-300 bg-white text-gray-400"    : ""}
                `}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1 text-center text-xs leading-tight w-16
                  ${isCompleted ? "text-green-600 font-medium" : ""}
                  ${isActive    ? "text-blue-600 font-semibold" : ""}
                  ${isPending   ? "text-gray-400" : ""}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {idx < PIPELINE.length - 1 && (
              <div
                className={`mb-5 h-0.5 w-8 transition-all
                  ${idx < currentIdx ? "bg-green-400" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
