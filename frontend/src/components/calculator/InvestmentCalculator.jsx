import { useState } from "react";
import { api } from "../../utils/api";
import { useCompanies } from "../../hooks/useData";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useLiveQuote } from "../../hooks/useData";
function ResultCard({ label, rate, finalAmount, gain, gainPct, color }) {
  const isGain = gain >= 0;
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-3"
      style={{
        background: `${color}0d`,
        borderColor: `${color}30`,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
        {label}
      </p>
      <p className="text-2xl font-bold text-white font-mono">
        ${finalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </p>
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          Ganancia: <span style={{ color: isGain ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
            +${gain.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {rate}% anual
        </span>
      </div>
      <div
        className="text-xs rounded-lg px-3 py-2"
        style={{ background: "rgba(0,0,0,0.2)", color: "var(--text-muted)" }}
      >
        Rendimiento total: <strong style={{ color: isGain ? "#22c55e" : "#ef4444" }}>
          +{gainPct.toFixed(2)}%
        </strong>
      </div>
    </div>
  );
}

export default function InvestmentCalculator() {
  const { data: companies } = useCompanies();
  const [form, setForm] = useState({ ticker: "", amount: "", months: "12" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.ticker || !form.amount || !form.months) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/simulate", {
        ticker: form.ticker,
        initialAmount: parseFloat(form.amount),
        periodMonths: parseInt(form.months),
      });
      if (res.success) setResult(res.data);
      else setError(res.error);
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Calculator size={18} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Simulador de Inversión</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Proyecta tus ganancias con interés compuesto
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Empresa */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Empresa
          </label>
          <select
            className="input-field"
            value={form.ticker}
            onChange={(e) => set("ticker", e.target.value)}
          >
            <option value="">Seleccionar empresa...</option>
            {companies?.map((c) => (
              <option key={c.ticker} value={c.ticker}>
                {c.ticker} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><DollarSign size={11} /> Monto Inicial (USD)</span>
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="Ej: 10000"
            min="1"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </div>

        {/* Plazo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><Clock size={11} /> Plazo (meses)</span>
          </label>
          <select
            className="input-field"
            value={form.months}
            onChange={(e) => set("months", e.target.value)}
          >
            {[3, 6, 12, 24, 36, 60, 120].map((m) => (
              <option key={m} value={m}>
                {m} meses{m >= 12 ? ` (${m / 12} año${m / 12 > 1 ? "s" : ""})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="md:col-span-3 flex items-center gap-4">
          <button className="btn-primary flex items-center gap-2" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <TrendingUp size={15} />
            )}
            {loading ? "Calculando..." : "Calcular Proyección"}
          </button>
          {error && (
            <p className="text-sm" style={{ color: "var(--loss)" }}>
              ⚠ {error}
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5 fade-in">
          {/* Company badge */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">{result.company.name}</span>
            <span className={`badge-${result.company.risk_slug}`}>{result.company.risk_label}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Capital inicial: <strong className="text-white font-mono">
                ${result.input.initialAmount.toLocaleString("es-AR")}
              </strong>
            </span>
          </div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              label="Escenario Conservador"
              rate={result.scenarios.conservative.annualRate}
              finalAmount={result.scenarios.conservative.finalAmount}
              gain={result.scenarios.conservative.totalGain}
              gainPct={result.scenarios.conservative.gainPct}
              color="#22c55e"
            />
            <ResultCard
              label="Escenario Esperado"
              rate={result.scenarios.expected.annualRate}
              finalAmount={result.scenarios.expected.finalAmount}
              gain={result.scenarios.expected.totalGain}
              gainPct={result.scenarios.expected.gainPct}
              color="#3b82f6"
            />
            <ResultCard
              label="Escenario Optimista"
              rate={result.scenarios.optimistic.annualRate}
              finalAmount={result.scenarios.optimistic.finalAmount}
              gain={result.scenarios.optimistic.totalGain}
              gainPct={result.scenarios.optimistic.gainPct}
              color={riskColors[result.company.risk_slug] ?? "#f59e0b"}
            />
          </div>

          {/* Projection chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">Proyección Mensual</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={result.monthlyProjection}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v) => `M${v}`}
                  tick={{ fill: "#7a93b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#7a93b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: "#0d1f3c", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12 }}
                  labelStyle={{ color: "#7a93b8", fontSize: 11 }}
                  labelFormatter={(v) => `Mes ${v}`}
                  formatter={(v, name) => [`$${v.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#7a93b8", paddingTop: 12 }}
                />
                <Line type="monotone" dataKey="conservative" name="Conservador" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expected"     name="Esperado"    stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="optimistic"   name="Optimista"   stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs px-4" style={{ color: "var(--text-muted)" }}>
            ⚠ Los rendimientos proyectados están basados en retornos históricos y tasas predefinidas por categoría de riesgo.
            No garantizan resultados futuros. Esta herramienta es únicamente educativa.
          </p>
        </div>
      )}
    </div>
  );
  function LivePrice({ ticker }) {
  const { data, loading } = useLiveQuote(ticker);

  if (loading) return <span className="skeleton h-5 w-20 inline-block" />;
  if (!data)   return null;

  const up = data.changePct >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-bold text-white text-xl">
        ${data.price.toFixed(2)}
      </span>
      <span style={{ color: up ? "var(--gain)" : "var(--loss)", fontSize: 13 }}>
        {up ? "▲" : "▼"} {Math.abs(data.changePct).toFixed(2)}%
      </span>
    </div>
  );
}
}
