import { useEffect, useState } from "react";
import { customerService } from "../api/customerService";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

const emptyForm = { name: "", email: "", phone: "", country: "🇺🇸 USA", gender: "Male" };

const GENDERS = ["Male", "Female", "Other"];

// Gender to Emoji Helper
const GENDER_EMOJIS = {
  "Male": "🧔",
  "Female": "👩",
  "Other": "👤"
};

export default function Customers() {
  const { customers, orders, loadingCustomers, loadCustomers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);

  // Detail Modal State
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCustomers(customers.length > 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await customerService.create(form);
      toast.success("Customer added.");
      setShowModal(false);
      setForm(emptyForm);
      loadCustomers(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customerService.remove(id);
      toast.success("Deleted.");
      loadCustomers(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenDetail = (c) => {
    setDetailCustomer(c);
    setShowDetailModal(true);
  };

  // Calculate distinct customer bought items quantity from orders
  const getCustomerStats = (cid) => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled" && o.customer_id === cid);
    let totalBought = 0;
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        totalBought += item.quantity;
      });
    });
    return { totalBought };
  };

  if (loadingCustomers && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-sm text-gray-500 font-medium">Loading customers list…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👥</span> Customers
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Here you can find and manage all your customers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-[#1c304a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#253f5f] transition-all"
        >
          + Add Customer
        </button>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#1c304a] text-white">
            <tr>
              {["Icon", "Name", "Email", "Phone", "Country", "Gender", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-bold text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => handleOpenDetail(c)}
                className="border-t hover:bg-slate-50/60 cursor-pointer transition-colors"
              >
                <td className="px-5 py-4 text-2xl select-none">{GENDER_EMOJIS[c.gender] || "👤"}</td>
                <td className="px-5 py-4 font-bold text-slate-800">{c.name}</td>
                <td className="px-5 py-4 text-xs font-semibold text-gray-500">{c.email}</td>
                <td className="px-5 py-4 text-xs font-semibold text-gray-500">{c.phone || "—"}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{c.country}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                    {c.gender}
                  </span>
                </td>
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => handleDelete(c.id, e)} className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal (Image 3 inspired, no birth date or local uploader photo) */}
      {showDetailModal && detailCustomer && (() => {
        const stats = getCustomerStats(detailCustomer.id);
        const isLoyal = stats.totalBought > 20;
        return (
          <Modal title="Customer Profile" onClose={() => setShowDetailModal(false)}>
            <div className="space-y-6">
              {/* Profile header */}
              <div className="flex items-center gap-5 border-b pb-4">
                {/* Profile Icon avatar representation */}
                <div className="h-16 w-16 md:h-20 md:w-20 bg-slate-50 border rounded-2xl flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
                  {GENDER_EMOJIS[detailCustomer.gender] || "👤"}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{detailCustomer.name}</h2>
                  <p className="text-xs text-gray-400 font-semibold">{detailCustomer.email}</p>
                  <p className="text-xs text-gray-400 font-semibold">{detailCustomer.phone || "No phone added"}</p>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Quantity of Bought Products</span>
                  <span className="text-base font-black text-slate-800">{stats.totalBought} Units</span>
                </div>
                <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Country</span>
                  <span className="text-base font-black text-[#1c304a]">{detailCustomer.country}</span>
                </div>
                <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gender</span>
                  <span className="text-base font-black text-slate-800">{detailCustomer.gender}</span>
                </div>
                <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</span>
                  <span className={`text-base font-black ${isLoyal ? "text-green-600" : "text-gray-400"}`}>
                    {isLoyal ? "👑 VIP Loyal" : "🤝 Standard Member"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-xl border border-gray-200 hover:bg-slate-50 px-5 py-2 text-xs font-bold text-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Customer Add Modal */}
      {showModal && (
        <Modal title="Add Customer" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Country</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Gender</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
              />
            </div>

            <button type="submit" className="w-full rounded-xl bg-[#1c304a] py-2.5 font-bold text-white hover:bg-[#253f5f] transition-all">
              Create Customer
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
