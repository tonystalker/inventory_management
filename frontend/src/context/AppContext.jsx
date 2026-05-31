import { createContext, useContext, useState } from "react";
import { orderService } from "../api/orderService";
import { productService } from "../api/productService";
import { customerService } from "../api/customerService";
import { dashboardService } from "../api/dashboardService";
import toast from "react-hot-toast";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadOrders = (silent = false) => {
    if (!silent) setLoadingOrders(orders.length === 0);
    return orderService.getAll()
      .then((data) => {
        setOrders(data);
        return data;
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingOrders(false));
  };

  const loadProducts = (silent = false) => {
    if (!silent) setLoadingProducts(products.length === 0);
    return productService.getAll()
      .then((data) => {
        setProducts(data);
        return data;
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingProducts(false));
  };

  const loadCustomers = (silent = false) => {
    if (!silent) setLoadingCustomers(customers.length === 0);
    return customerService.getAll()
      .then((data) => {
        setCustomers(data);
        return data;
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingCustomers(false));
  };

  const loadStats = (silent = false) => {
    if (!silent) setLoadingStats(!stats);
    return dashboardService.getStats()
      .then((data) => {
        setStats(data);
        return data;
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingStats(false));
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        products,
        customers,
        stats,
        loadingOrders,
        loadingProducts,
        loadingCustomers,
        loadingStats,
        loadOrders,
        loadProducts,
        loadCustomers,
        loadStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
