import { useEffect, useState } from "react";
import { useParams, Link }     from "react-router-dom";
import { orderService }        from "../api/orderService";
import StatusBadge             from "../components/StatusBadge";
import StatusStepper           from "../components/StatusStepper";
import toast                   from "react-hot-toast";

export default function OrderDetail() {
  const { id }                        = useParams();
  const [order, setOrder]             = useState(null);
  const [nextStatuses, setNextStatuses] = useState([]);
  const [updating, setUpdating]       = useState(false);

  const load = () =>
    Promise.all([
      orderService.getById(id),
      orderService.getNextStatuses(id),
    ]).then(([o, next]) => {
      setOrder(o);
      setNextStatuses(next);
    }).catch((e) => toast.error(e.message));

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success("Order status updated.");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link to="/orders" className="text-sm text-blue-600 hover:underline">← Back to Orders</Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed on {new Date(order.created_at).toLocaleString()}
            {order.updated_at && ` · Updated ${new Date(order.updated_at).toLocaleString()}`}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status Stepper */}
      <div className="rounded-xl border bg-white p-5 overflow-x-auto">
        <h2 className="mb-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Order Progress
        </h2>
        <StatusStepper currentStatus={order.status} />
      </div>

      {/* Status Advance Controls */}
      {nextStatuses.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Advance Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => {
              const isCancelAction = s.value === "cancelled";
              return (
                <button
                  key={s.value}
                  disabled={updating}
                  onClick={() => handleStatusUpdate(s.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50
                    ${isCancelAction
                      ? "border border-red-300 text-red-600 hover:bg-red-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  {updating ? "Updating…" : `→ Mark as ${s.label}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Info */}
      <div className="rounded-xl border bg-white p-5 space-y-2 text-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">Details</h2>
        <p><span className="font-medium text-gray-700">Customer ID:</span> {order.customer_id}</p>
        <p><span className="font-medium text-gray-700">Status:</span> {order.status_label}</p>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["Product ID", "Qty", "Unit Price", "Line Total"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{item.product_id}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">₹{item.price_at_purchase}</td>
                <td className="px-4 py-3 font-semibold">
                  ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t px-4 py-3 text-lg font-bold bg-gray-50">
          Total: ₹{order.total_amount}
        </div>
      </div>
    </div>
  );
}
