import { useEffect, useState } from "react";
import { productService } from "../api/productService";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import toast from "react-hot-toast";

const emptyForm = { name: "", sku: "", price: "", quantity: "", category: "Home & Kitchen", segment: "Economy", description: "" };

const CATEGORIES = ["Home & Kitchen", "Electronics", "Sports & Outdoors", "General"];
const SEGMENTS = ["Economy", "Mid-Range", "Premium"];

// Category to Emoji Helper for gorgeous no-photo visual badges
const CATEGORY_EMOJIS = {
  "Home & Kitchen": "🏡",
  "Electronics": "💻",
  "Sports & Outdoors": "⚽",
  "General": "📦"
};

export default function Products() {
  const { products, orders, loadingProducts, loadProducts } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);   // null = create mode
  const [form, setForm]           = useState(emptyForm);

  // Layout View (table vs grid)
  const [viewMode, setViewMode] = useState("table");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSegments, setSelectedSegments] = useState([]); // multi-select segments

  // Detail Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dropdown actions index state
  const [actionMenuId, setActionMenuId] = useState(null);

  useEffect(() => {
    loadProducts(products.length > 0);
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (p, e) => {
    if (e) e.stopPropagation();
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      quantity: p.quantity,
      category: p.category || "Home & Kitchen",
      segment: p.segment || "Economy",
      description: p.description || ""
    });
    setActionMenuId(null);
    setShowModal(true);
  };

  const handleOpenDetail = (p) => {
    setDetailProduct(p);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      description: form.description || "High-quality product."
    };
    try {
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success("Product updated.");
      } else {
        await productService.create(payload);
        toast.success("Product created.");
      }
      setShowModal(false);
      loadProducts(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this product?")) return;
    try {
      await productService.remove(id);
      toast.success("Deleted.");
      setActionMenuId(null);
      loadProducts(true); // Silent reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle Segment filters
  const toggleSegmentFilter = (seg) => {
    if (selectedSegments.includes(seg)) {
      setSelectedSegments(selectedSegments.filter((s) => s !== seg));
    } else {
      setSelectedSegments([...selectedSegments, seg]);
    }
  };

  // Filter products logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
    const matchesSegment = selectedSegments.length === 0 || selectedSegments.includes(p.segment);
    return matchesSearch && matchesCategory && matchesSegment;
  });

  // Calculate Product Sales stats
  const getProductStats = (pid) => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    let totalSales = 0;
    let totalRevenue = 0;
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.product_id === pid) {
          totalSales += item.quantity;
          totalRevenue += item.quantity * item.price_at_purchase;
        }
      });
    });
    return { totalSales, totalRevenue };
  };

  if (loadingProducts && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-500 font-medium">Loading products list…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📦</span> Products
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">Here you can find and manage all your products</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-[#1c304a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#253f5f] transition-all"
        >
          + New Product
        </button>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Search</label>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-100 bg-slate-50 px-4 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1c304a]/10"
          />
        </div>

        {/* Segment pill toggles */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Segment</label>
          <div className="flex gap-2">
            {SEGMENTS.map((seg) => {
              const active = selectedSegments.includes(seg);
              return (
                <button
                  key={seg}
                  onClick={() => toggleSegmentFilter(seg)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                    active
                      ? "bg-[#1c304a] border-[#1c304a] text-white"
                      : "bg-slate-50 border-gray-100 text-gray-500 hover:bg-slate-100"
                  }`}
                >
                  {seg} {active && "✕"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-100 bg-slate-50 px-4 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1c304a]/10"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Toggle Bar */}
      <div className="flex gap-1 border-b pb-2">
        <button
          onClick={() => setViewMode("table")}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${
            viewMode === "table" ? "bg-white border text-[#1c304a] shadow-sm" : "text-gray-400 hover:text-slate-700"
          }`}
        >
          <span>☰</span> Tableview
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-all rounded-lg ${
            viewMode === "grid" ? "bg-white border text-[#1c304a] shadow-sm" : "text-gray-400 hover:text-slate-700"
          }`}
        >
          <span>⠿</span> Gridview
        </button>
      </div>

      {/* Main List */}
      {viewMode === "table" ? (
        /* --- Table View --- */
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#1c304a] text-white">
              <tr>
                {["Icon", "Product Name", "Category", "Segment", "Price", "Qty", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-bold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className="border-t hover:bg-slate-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-2xl select-none">{CATEGORY_EMOJIS[p.category] || "📦"}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{p.name}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-500">{p.category}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-800">
                      {p.segment}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">₹{p.price}</td>
                  <td className={`px-5 py-4 text-xs font-bold ${p.quantity <= 10 ? "text-red-500 font-extrabold" : "text-gray-500"}`}>
                    {p.quantity} Unit{p.quantity !== 1 && "s"}
                  </td>
                  <td className="px-5 py-4 relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActionMenuId(actionMenuId === p.id ? null : p.id)}
                      className="text-gray-400 hover:text-slate-800 font-extrabold text-sm p-1 rounded hover:bg-slate-100"
                    >
                      ⋮
                    </button>
                    {/* Floating Context Menu */}
                    {actionMenuId === p.id && (
                      <div className="absolute right-6 top-10 z-20 w-28 rounded-xl border bg-white p-1 shadow-md text-xs font-semibold flex flex-col">
                        <button
                          onClick={(e) => openEdit(p, e)}
                          className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-50 text-blue-600 transition-colors"
                        >
                          ✎ Edit Details
                        </button>
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-slate-50 text-red-500 transition-colors"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- Grid View --- */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenDetail(p)}
              className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Category Icon representation */}
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-4xl select-none">
                  {CATEGORY_EMOJIS[p.category] || "📦"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 leading-snug">{p.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-[#1c304a] font-extrabold text-sm">₹ {p.price}</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-blue-800">
                  {p.segment}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Details Modal (Image 4 layout, clean database) */}
      {showDetailModal && detailProduct && (() => {
        const stats = getProductStats(detailProduct.id);
        return (
          <Modal title="Product Overview" onClose={() => setShowDetailModal(false)}>
            <div className="space-y-6">
              {/* Product header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{detailProduct.name}</h2>
                  <p className="text-xs text-gray-400 font-semibold">{detailProduct.category} · {detailProduct.sku}</p>
                </div>
                <button
                  onClick={(e) => {
                    setShowDetailModal(false);
                    openEdit(detailProduct, e);
                  }}
                  className="rounded-full h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold transition"
                >
                  ✎
                </button>
              </div>

              {/* Grid Layout overview */}
              <div className="flex flex-wrap md:flex-nowrap gap-5">
                {/* Visual Icon Illustration */}
                <div className="h-32 w-32 md:h-40 md:w-40 bg-slate-50 border rounded-2xl flex items-center justify-center text-6xl shadow-inner select-none shrink-0 self-center md:self-stretch">
                  {CATEGORY_EMOJIS[detailProduct.category] || "📦"}
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-2 gap-3 flex-grow">
                  <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Price</span>
                    <span className="text-base font-black text-slate-800">₹ {detailProduct.price}</span>
                  </div>
                  <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sales Quantity</span>
                    <span className="text-base font-black text-slate-800">{stats.totalSales}</span>
                  </div>
                  <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Revenue</span>
                    <span className="text-base font-black text-[#1c304a]">₹ {stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="rounded-xl border p-4 bg-white shadow-inner flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Segment</span>
                    <span className="text-base font-black text-blue-700">{detailProduct.segment}</span>
                  </div>
                </div>
              </div>

              {/* Description box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {detailProduct.description || "High-quality product engineered for exceptional reliability, durability, and daily functional performance."}
                </p>
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

      {/* Product Add/Edit Modal (Category/Segment Dropdowns) */}
      {showModal && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Product Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">SKU</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Segment</label>
                <select
                  required
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
                >
                  {SEGMENTS.map((seg) => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1c304a]"
              />
            </div>

            <button type="submit" className="w-full rounded-xl bg-[#1c304a] py-2.5 font-bold text-white hover:bg-[#253f5f] transition-all">
              {editing ? "Update Product" : "Create Product"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
