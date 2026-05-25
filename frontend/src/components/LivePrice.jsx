import { useLiveQuote } from "../hooks/useData";

/**
 * LivePrice — muestra precio en tiempo real desde Alpha Vantage.
 * Si la API falla (rate limit), muestra el fallbackPrice de la DB.
 */
export default function LivePrice({ ticker, fallbackPrice = null, size = "md" }) {
  const { data, loading } = useLiveQuote(ticker);

  if (loading) {
    return <span className="skeleton inline-block" style={{ width: 80, height: size === "lg" ? 28 : 18 }} />;
  }

  // Sin datos de AV → usar precio de la DB
  if (!data) {
    return fallbackPrice != null ? (
      <span className="num" style={{ fontSize: size === "lg" ? 22 : 14, color: "var(--ink-2)" }}>
        ${parseFloat(fallbackPrice).toFixed(2)}
      </span>
    ) : null;
  }

  const up = data.changePct >= 0;
  const sizes = {
    sm: { price: 13, chip: 11 },
    md: { price: 16, chip: 11 },
    lg: { price: 24, chip: 12 },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span className="num" style={{ fontSize: s.price, fontWeight: 500, color: "var(--ink-1)" }}>
        ${data.price.toFixed(2)}
      </span>
      <span className={up ? "gain-chip" : "loss-chip"} style={{ fontSize: s.chip }}>
        {up ? "+" : ""}{data.changePct.toFixed(2)}%
      </span>
    </div>
  );
}