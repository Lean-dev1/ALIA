import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { usePriceHistory } from "../../hooks/useData";

const PERIODS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1A", days: 365 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface" style={{ padding: "8px 14px", minWidth: 140 }}>
      <p style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>{label}</p>
      <p className="num" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-1)" }}>
        ${parseFloat(payload[0].value).toFixed(2)}
      </p>
    </div>
  );
};

export default function PriceChart({ ticker, name }) {
  const [days, setDays] = useState(90);
  const { data, loading } = usePriceHistory(ticker, days);

  const chartData = data?.map((row) => ({
    date: new Date(row.price_date).toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
    price: parseFloat(row.close_price),
  })) ?? [];

  const isPositive = chartData.length >= 2
    ? chartData[chartData.length - 1].price >= chartData[0].price
    : true;

  const strokeColor = isPositive ? "var(--gain)" : "var(--loss)";
  const gradId = `g-${ticker}`;

  return (
    <div className="surface" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p className="label-xs" style={{ marginBottom: 4 }}>Precio de cierre histórico</p>
          <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, color: "var(--ink-1)" }}>
            {name ?? ticker}
          </h2>
        </div>
        {/* Period tabs */}
        <div style={{ display: "flex", gap: 2, background: "var(--bg-sunken)", padding: 2, borderRadius: 2 }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`btn-ghost ${days === p.days ? "active" : ""}`}
              style={{ padding: "4px 10px", fontSize: 11 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, width: "100%" }} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#0d6b3a" : "#8b1a1a"} stopOpacity={0.12} />
                <stop offset="100%" stopColor={isPositive ? "#0d6b3a" : "#8b1a1a"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--ink-4)", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "var(--ink-4)", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#0d6b3a" : "#8b1a1a"}
              strokeWidth={1.5}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 3, fill: isPositive ? "#0d6b3a" : "#8b1a1a", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}