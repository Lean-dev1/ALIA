import { useState } from "react";
import { useCompanies } from "../../hooks/useData";
import { Building2, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import LivePrice from "../LivePrice"; // <-- 1. Importamos el componente

const RISK_CONFIG = {
  low:    { badge: "badge-low",    icon: "🛡", label: "Riesgo Bajo",   blurb: "Largo plazo · Rendimiento estable" },
  medium: { badge: "badge-medium", icon: "⚖",  label: "Riesgo Medio",  blurb: "Mediano plazo · Balance rentabilidad/seguridad" },
  high:   { badge: "badge-high",   icon: "🔥", label: "Riesgo Alto",   blurb: "Corto plazo · Alta volatilidad" },
};

function CompanyCard({ company, onSelectChart }) {
  const cfg = RISK_CONFIG[company.risk_slug] ?? RISK_CONFIG.medium;

  return (
    <div
      className="card p-5 cursor-pointer hover:scale-[1.01] transition-transform duration-200"
      onClick={() => onSelectChart(company.ticker, company.name)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-white text-base">{company.ticker}</span>
            <span className={cfg.badge}>{cfg.icon} {cfg.label}</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }} className="font-medium">
            {company.name}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "12px", lineHeight: 1.5 }} className="mb-4 line-clamp-2">
        {company.description}
      </p>

      <div className="flex items-center justify-between">
        {/* 2. Reemplazamos el bloque estático por el componente en tiempo real */}
        <div>
          <LivePrice ticker={company.ticker} fallbackPrice={company.current_price} />
          <p style={{ fontSize: "11px", color: "var(--text-muted)" }} className="mt-1">{company.sector}</p>
        </div>
      </div>

      <div
        className="mt-3 pt-3 flex items-center justify-between border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Retorno esperado/año</span>
        <span style={{ color: "#60a5fa", fontSize: "12px", fontWeight: 600 }}>
          {company.annual_return_min}% – {company.annual_return_max}%
        </span>
      </div>
    </div>
  );
}

export default function CompaniesDirectory({ onSelectChart }) {
  const [risk, setRisk] = useState("");
  const { data: companies, loading } = useCompanies(risk);

  const filters = [
    { value: "",       label: "Todas" },
    { value: "low",    label: "🛡 Bajo" },
    { value: "medium", label: "⚖ Medio" },
    { value: "high",   label: "🔥 Alto" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Building2 size={18} style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Directorio de Empresas</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Filtradas por perfil de riesgo
            </p>
          </div>
        </div>

        <div className="flex gap-2 bg-black/20 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRisk(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: risk === f.value ? "var(--accent)" : "transparent",
                color: risk === f.value ? "#fff" : "var(--text-muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
          <div key={key} className="card p-4 flex items-start gap-3">
            <span className="text-2xl">{cfg.icon}</span>
            <div>
              <p className="font-semibold text-white text-sm mb-0.5">{cfg.label}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{cfg.blurb}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies?.map((c) => (
            <CompanyCard key={c.ticker} company={c} onSelectChart={onSelectChart} />
          ))}
        </div>
      )}
    </div>
  );
}