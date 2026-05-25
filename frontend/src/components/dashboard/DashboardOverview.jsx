import { useState } from "react";
import { useMarketSummary, useCompanies } from "../../hooks/useData";
import PriceChart from "./PriceChart";
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from "lucide-react";
import LivePrice from "../LivePrice"; // <-- Importamos el componente

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 500 }} className="uppercase tracking-wider">
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-mono mt-1">{value}</p>
      {sub && <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{sub}</p>}
    </div>
  );
}

function MoverRow({ company, type }) {
  const up = type === "gainer";
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
          style={{ background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: up ? "#22c55e" : "#ef4444" }}
        >
          {company.ticker.slice(0, 2)}
        </div>
        <span className="text-sm font-medium text-white">{company.ticker}</span>
      </div>
      <span
        className="text-sm font-semibold font-mono"
        style={{ color: up ? "var(--gain)" : "var(--loss)" }}
      >
        {up ? "+" : ""}{parseFloat(company.price_change_pct).toFixed(2)}%
      </span>
    </div>
  );
}

export default function DashboardOverview({ onSelectChart }) {
  const { data: market, loading: mktLoading } = useMarketSummary();
  const { data: companies } = useCompanies();
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [selectedName, setSelectedName]     = useState("Apple Inc.");

  const stats = market?.stats;
  const currentCompany = companies?.find((x) => x.ticker === selectedTicker);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Resumen de mercado en tiempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="En alza"
          value={mktLoading ? "—" : stats?.gainers_count ?? "—"}
          sub="empresas subiendo"
          color="#22c55e"
          Icon={TrendingUp}
        />
        <StatCard
          label="En baja"
          value={mktLoading ? "—" : stats?.losers_count ?? "—"}
          sub="empresas bajando"
          color="#ef4444"
          Icon={TrendingDown}
        />
        <StatCard
          label="Cambio promedio"
          value={mktLoading ? "—" : `${stats?.avg_change ?? 0}%`}
          sub="variación 24h"
          color="#3b82f6"
          Icon={BarChart2}
        />
        <StatCard
          label="Empresas activas"
          value={companies?.length ?? "—"}
          sub="en seguimiento"
          color="#a78bfa"
          Icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3 bg-black/10 p-3 rounded-xl border border-white/[0.02]">
            <div className="flex gap-2 flex-wrap">
              {["AAPL", "MSFT", "NVDA"].map((t) => {
                const c = companies?.find((x) => x.ticker === t);
                return (
                  <button
                    key={t}
                    onClick={() => { setSelectedTicker(t); setSelectedName(c?.name ?? t); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
                    style={{
                      background: selectedTicker === t ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                      color: selectedTicker === t ? "#60a5fa" : "var(--text-muted)",
                      border: `1px solid ${selectedTicker === t ? "rgba(59,130,246,0.3)" : "transparent"}`,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            
            {/* 2. Mostramos el precio en tiempo real arriba del gráfico principal */}
            <LivePrice ticker={selectedTicker} fallbackPrice={currentCompany?.current_price ?? 0} />
          </div>
          
          <PriceChart ticker={selectedTicker} name={selectedName} />
        </div>

        <div className="card p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-white text-sm">Top Movers del Día</h3>

          {mktLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#22c55e" }}>
                🟢 Mayores alzas
              </p>
              {market?.gainers?.slice(0, 3).map((c) => (
                <MoverRow key={c.ticker} company={c} type="gainer" />
              ))}
              <p className="text-xs uppercase tracking-wider mt-4 mb-2" style={{ color: "#ef4444" }}>
                🔴 Mayores bajas
              </p>
              {market?.losers?.slice(0, 3).map((c) => (
                <MoverRow key={c.ticker} company={c} type="loser" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}