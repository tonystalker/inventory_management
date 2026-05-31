import { useEffect, useState } from "react";
import { orderService }   from "../api/orderService";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Orders() {
  const {
    orders,
    products,
    customers,
    loadingOrders,
    loadOrders,
    loadProducts,
    loadCustomers,
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems]           = useState([{ product_id: "", quantity: 1 }]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingModal, setLoadingModal] = useState(false);

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const loadModalData = () => {
    setLoadingModal(true);
    Promise.all([
      loadProducts(products.length > 0),
      loadCustomers(customers.length > 0),
    ]).finally(() => setLoadingModal(false));
  };

  useEffect(() => { loadOrders(orders.length > 0); }, []);

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderService.create({
        customer_id: parseInt(customerId),
        items: items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity:   parseInt(item.quantity),
        })),
      });
      toast.success("Order placed.");
      setShowModal(false);
      setItems([{ product_id: "", quantity: 1 }]);
      setCustomerId("");
      loadOrders(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await orderService.remove(id);
      toast.success("Order cancelled.");
      loadOrders(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-sm text-gray-500 font-medium">Loading orders list…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
        <button
          onClick={() => {
            loadModalData();
            setShowModal(true);
          }}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 sm:px-4"
        >
          + New Order
        </button>
      </div>

      {/* Status Filter Bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "all",          label: "All"            },
          { value: "placed",       label: "Placed"         },
          { value: "processing",   label: "Processing"     },
          { value: "picked_packed",label: "Picked & Packed"},
          { value: "shipped",      label: "Shipped"        },
          { value: "delivered",    label: "Delivered"      },
          { value: "returned",     label: "Returned"       },
          { value: "cancelled",    label: "Cancelled"      },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition
              ${filterStatus === f.value
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["Order ID", "Customer", "Total", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">#{o.id}</td>
                <td className="px-4 py-3">{o.customer_id}</td>
                <td className="px-4 py-3 font-semibold">₹{o.total_amount}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 space-x-2">
                  <Link to={`/orders/${o.id}`} className="text-blue-600 hover:underline">View</Link>
                  <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Create Order" onClose={() => setShowModal(false)}>
          {loadingModal ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="text-sm text-gray-500 font-medium">Loading products and customers…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Customer</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">— Select customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Products</label>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      required
                      value={item.product_id}
                      onChange={(e) => updateItem(i, "product_id", e.target.value)}
                      className="flex-1 rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="">— Product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (qty: {p.quantity})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      className="w-20 rounded-lg border px-2 py-1 text-sm"
                    />
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm text-purple-600 hover:underline">
                  + Add another product
                </button>
              </div>

              <button type="submit" className="w-full rounded-lg bg-purple-600 py-2 text-white hover:bg-purple-700">
                Place Order
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
