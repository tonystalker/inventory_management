import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Dashboard   from "./pages/Dashboard";
import Products    from "./pages/Products";
import Customers   from "./pages/Customers";
import Orders      from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

const navItems = [
  { to: "/",          label: "📊 Dashboard" },
  { to: "/products",  label: "📦 Products"  },
  { to: "/customers", label: "👥 Customers" },
  { to: "/orders",    label: "🛒 Orders"    },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

      <div className="flex min-h-screen bg-gray-50">

        {/* ── Mobile overlay backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ──
            Mobile : fixed, slides in/out from left via translate
            Desktop: relative, always visible (lg:translate-x-0)
        */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-[#111c2a] border-slate-900 p-4 text-slate-300
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:relative lg:w-56 lg:translate-x-0
          `}
        >
          {/* Sidebar header */}
          <div className="mb-8 flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider select-none leading-tight">
              Inventory Management
            </h2>
            {/* Close button – mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-slate-400 hover:text-white lg:hidden font-bold"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setSidebarOpen(false)}   // close on navigate (mobile)
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#3368a5]/30 text-white shadow-inner font-semibold border-l-4 border-[#4a8cd7]"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer to push content up */}
          <div className="mt-auto" />
        </aside>

        {/* ── Right-side column: top bar + main content ── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Mobile top bar – hidden on lg+ */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-2xl leading-none text-gray-600 hover:text-gray-900"
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="text-base font-bold text-gray-800">Inventory Management</span>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/"           element={<Dashboard />}   />
              <Route path="/products"   element={<Products />}    />
              <Route path="/customers"  element={<Customers />}   />
              <Route path="/orders"     element={<Orders />}      />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Routes>
          </main>

        </div>
      </div>
      </BrowserRouter>
    </AppProvider>
  );
}
