import { Activity, RefreshCw } from "lucide-react";
import { useMarketSummary } from "../../hooks/useData";

function TickerPill({ company }) {
  const up = parseFloat(company.price_change_pct) >= 0;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "2px 12px",
      borderRight: "1px solid var(--border)",
      fontSize: 12,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontWeight: 600, color: "var(--ink-1)", fontFamily: "'IBM Plex Mono', monospace" }}>
        {company.ticker}
      </span>
      <span className={up ? "gain-chip" : "loss-chip"}>
        {up ? "▲" : "▼"} {Math.abs(parseFloat(company.price_change_pct)).toFixed(2)}%
      </span>
    </span>
  );
}

export default function MarketBar() {
  const { data, loading, refetch } = useMarketSummary();

  return (
    <div style={{
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      height: 36,
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 16px",
        borderRight: "1px solid var(--border)",
        height: "100%",
        flexShrink: 0,
        background: "var(--navy)",
      }}>
        <Activity size={11} color="rgba(255,255,255,0.6)" />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          Mercado
        </span>
      </div>

      {/* Tickers */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", overflowX: "auto", height: "100%" }}
        className="no-scrollbar">
        {loading ? (
          <div style={{ display: "flex", gap: 12, padding: "0 16px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ width: 80, height: 16 }} />
            ))}
          </div>
        ) : (
          <>
            {data?.gainers?.slice(0, 4).map(c => <TickerPill key={c.ticker} company={c} />)}
            {data?.losers?.slice(0, 3).map(c => <TickerPill key={c.ticker} company={c} />)}
          </>
        )}
      </div>

      {/* Refresh */}
      <button
        onClick={refetch}
        style={{
          padding: "0 14px",
          height: "100%",
          border: "none",
          borderLeft: "1px solid var(--border)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--ink-4)",
          display: "flex",
          alignItems: "center",
          transition: "color 0.15s",
          flexShrink: 0,
        }}
        title="Actualizar"
        onMouseEnter={e => e.currentTarget.style.color = "var(--ink-2)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--ink-4)"}
      >
        <RefreshCw size={12} />
      </button>
    </div>
  );
}