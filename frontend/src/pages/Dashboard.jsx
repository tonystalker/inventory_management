import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const {
    orders,
    products,
    customers,
    loadingOrders,
    loadingProducts,
    loadingCustomers,
    loadOrders,
    loadProducts,
    loadCustomers,
  } = useApp();

  useEffect(() => {
    // Refresh all data silently in the background
    loadOrders(orders.length > 0);
    loadProducts(products.length > 0);
    loadCustomers(customers.length > 0);
  }, []);

  const isLoading = loadingOrders || loadingProducts || loadingCustomers;

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard insights…</p>
      </div>
    );
  }

  // --- Dynamic Dashboard Metrics ---
  const activeOrders = orders.filter((o) => o.status !== "cancelled");

  // 1. Total Revenue
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // 2. Sales Amount (total quantities sold)
  const salesAmount = activeOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  // 3. Customers count
  const customerCount = customers.length;

  // 4. Best Seller Calculation
  const salesMap = {}; // product_id -> quantity
  activeOrders.forEach((o) => {
    o.items.forEach((item) => {
      salesMap[item.product_id] = (salesMap[item.product_id] || 0) + item.quantity;
    });
  });

  let bestSellerId = null;
  let bestSellerQty = 0;
  Object.entries(salesMap).forEach(([id, qty]) => {
    if (qty > bestSellerQty) {
      bestSellerQty = qty;
      bestSellerId = parseInt(id);
    }
  });

  const bestSellerProduct = products.find((p) => p.id === bestSellerId);

  // 5. Segment Calculations (Economy, Mid-Range, Premium)
  // Categories count by user choice on segment
  let revEcon = 0, revMid = 0, revPrem = 0;
  let qtyEcon = 0, qtyMid = 0, qtyPrem = 0;

  activeOrders.forEach((o) => {
    o.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.product_id);
      const segment = p ? p.segment : "Economy";
      const itemRev = item.quantity * item.price_at_purchase;

      if (segment === "Premium") {
        revPrem += itemRev;
        qtyPrem += item.quantity;
      } else if (segment === "Mid-Range") {
        revMid += itemRev;
        qtyMid += item.quantity;
      } else {
        revEcon += itemRev;
        qtyEcon += item.quantity;
      }
    });
  });

  // --- SVG Donut Helper Component ---
  const DonutChart = ({ premium, midRange, economy, title }) => {
    const total = premium + midRange + economy;
    const premPct = total > 0 ? (premium / total) * 100 : 0;
    const midPct = total > 0 ? (midRange / total) * 100 : 0;
    const econPct = total > 0 ? (economy / total) * 100 : 0;

    const r = 40;
    const C = 2 * Math.PI * r; // 251.32

    // Offsets
    const strokePrem = (premPct / 100) * C;
    const strokeMid = (midPct / 100) * C;
    const strokeEcon = (econPct / 100) * C;

    const offsetPrem = 0;
    const offsetMid = -strokePrem;
    const offsetEcon = -(strokePrem + strokeMid);

    return (
      <div className="flex flex-col items-center rounded-2xl border bg-white p-6 shadow-sm flex-1 min-w-[280px]">
        <h3 className="text-sm font-semibold text-gray-700 self-start mb-4">{title}</h3>
        <div className="relative h-44 w-44">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Base circle background */}
            <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
            
            {/* Economy Slice */}
            {econPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#70a1d4"
                strokeWidth="12"
                strokeDasharray={`${strokeEcon} ${C}`}
                strokeDashoffset={offsetEcon}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Mid-Range Slice */}
            {midPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#3b6ea3"
                strokeWidth="12"
                strokeDasharray={`${strokeMid} ${C}`}
                strokeDashoffset={offsetMid}
                className="transition-all duration-300"
              />
            )}

            {/* Premium Slice */}
            {premPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#1c304a"
                strokeWidth="12"
                strokeDasharray={`${strokePrem} ${C}`}
                strokeDashoffset={offsetPrem}
                className="transition-all duration-300"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{total > 0 ? total.toLocaleString() : 0}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-5 flex gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#1c304a]" />
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#3b6ea3]" />
            <span>Mid-Range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#70a1d4]" />
            <span>Economy</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl space-y-6 bg-slate-50/50 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>📊</span> Dashboard
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">Here you can get insights about your products</p>
      </div>

      {/* Top Numeric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Revenue Card */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Revenue</span>
          <p className="text-xl font-black text-[#1c304a]">₹ {totalRevenue.toFixed(2)}</p>
        </div>

        {/* Sales Amount Card */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sales Amount</span>
          <p className="text-xl font-black text-slate-800">{salesAmount} Unit{salesAmount !== 1 && "s"}</p>
        </div>

        {/* Customers Card */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customers</span>
          <p className="text-xl font-black text-slate-800">{customerCount}</p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="flex flex-wrap gap-4 items-stretch">
        {/* Best Seller Card */}
        <div className="rounded-2xl bg-[#34628d] p-6 text-white shadow-sm flex flex-col justify-between flex-1 min-w-[280px] max-w-[400px]">
          <div>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Best Seller</span>
            <div className="mt-4 rounded-xl bg-white p-4 text-slate-800 flex items-center gap-4 shadow-inner">
              {/* Product icon placeholder */}
              <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl select-none">
                📦
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800 leading-tight">
                  {bestSellerProduct ? bestSellerProduct.name : "No sales yet"}
                </h4>
                <p className="text-xs text-gray-400 font-semibold">{bestSellerProduct ? bestSellerProduct.category : "N/A"}</p>
                <p className="text-xs font-bold text-blue-600 mt-1">
                  {bestSellerProduct ? `₹ ${bestSellerProduct.price}` : "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-2xl font-black">{bestSellerQty > 0 ? `${bestSellerQty} Sales` : "0 Sales"}</p>
          </div>
        </div>

        {/* Donut Charts */}
        <DonutChart premium={revPrem} midRange={revMid} economy={revEcon} title="Revenue by Segment (₹)" />
        <DonutChart premium={qtyPrem} midRange={qtyMid} economy={qtyEcon} title="Quantity of Sales by Segment" />
      </div>
    </div>
  );
}
