import { useEffect, useState } from "react";
import { orderService }   from "../api/orderService";
import { addressService } from "../api/addressService";
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

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address_line: "", city: "", state: "", pincode: "" });

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const loadModalData = () => {
    setLoadingModal(true);
    setCustomerId("");
    setShippingAddressId("");
    setAddresses([]);
    Promise.all([
      loadProducts(products.length > 0),
      loadCustomers(customers.length > 0),
    ]).finally(() => setLoadingModal(false));
  };

  useEffect(() => { loadOrders(orders.length > 0); }, []);

  const handleCustomerChange = async (cid) => {
    setCustomerId(cid);
    setShippingAddressId("");
    if (!cid) {
      setAddresses([]);
      return;
    }
    try {
      const data = await addressService.getByCustomer(cid);
      setAddresses(data);
      if (data.length > 0) setShippingAddressId(data[0].id);
    } catch (err) {
      toast.error("Failed to load addresses");
    }
  };

  const handleAddAddress = async () => {
    try {
      const added = await addressService.create(customerId, newAddress);
      setAddresses([...addresses, added]);
      setShippingAddressId(added.id);
      setShowAddAddress(false);
      setNewAddress({ address_line: "", city: "", state: "", pincode: "" });
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message);
    }
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    try {
      await orderService.create({
        customer_id: parseInt(customerId),
        shipping_address_id: parseInt(shippingAddressId),
        items: items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity:   parseInt(item.quantity),
        })),
      });
      toast.success("Order placed.");
      setShowModal(false);
      setItems([{ product_id: "", quantity: 1 }]);
      setCustomerId("");
      setShippingAddressId("");
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
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">— Select customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Address Selection */}
              {customerId && (
                <div className="space-y-2 rounded-lg bg-gray-50 p-3 border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Shipping Address</label>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="text-xs font-semibold text-purple-600 hover:underline"
                    >
                      {showAddAddress ? "Cancel" : "+ Add New"}
                    </button>
                  </div>

                  {showAddAddress ? (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <input
                        type="text" placeholder="Address Line (e.g. 123 Main St)" required
                        value={newAddress.address_line} onChange={(e) => setNewAddress({...newAddress, address_line: e.target.value})}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text" placeholder="City" required
                          value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="rounded border px-2 py-1 text-sm"
                        />
                        <input
                          type="text" placeholder="State" required
                          value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="rounded border px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text" placeholder="Pincode (Numbers Only)" required pattern="[0-9]+"
                          value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="flex-1 rounded border px-2 py-1 text-sm"
                        />
                        <button type="button" onClick={handleAddAddress} className="rounded bg-gray-800 text-white px-3 py-1 text-xs font-bold">
                          Save
                        </button>
                      </div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <select
                      required
                      value={shippingAddressId}
                      onChange={(e) => setShippingAddressId(e.target.value)}
                      className="w-full rounded border px-2 py-1 text-sm bg-white"
                    >
                      <option value="">— Select an address —</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.address_line}, {a.city}, {a.state} - {a.pincode}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-red-500 font-medium">No addresses found. Please add one.</p>
                  )}
                </div>
              )}

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
