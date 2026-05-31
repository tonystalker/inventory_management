export default function LowStockAlert({ products }) {
  if (!products?.length) return null;
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <h3 className="mb-2 font-semibold text-orange-700">⚠ Low Stock Alert</h3>
      <ul className="space-y-1 text-sm text-orange-600">
        {products.map((p) => (
          <li key={p.id}>
            <span className="font-medium">{p.name}</span> — {p.quantity} left (SKU: {p.sku})
          </li>
        ))}
      </ul>
    </div>
  );
}
