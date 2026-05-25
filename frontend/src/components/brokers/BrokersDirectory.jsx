import { useBrokers } from "../../hooks/useData";
import { Briefcase, Star, ExternalLink, CheckCircle } from "lucide-react";
import { useLiveQuote } from "../../hooks/useData";
const ASSET_LABELS = {
  stocks: "Acciones", etfs: "ETFs", crypto: "Criptos",
  options: "Opciones", futures: "Futuros", forex: "Forex",
  cfd: "CFDs", "mutual funds": "Fondos", bonds: "Bonos",
  staking: "Staking", nft: "NFTs",
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? "#f59e0b" : "transparent"}
          color={s <= Math.round(rating) ? "#f59e0b" : "#7a93b8"}
        />
      ))}
      <span className="font-mono text-xs font-semibold text-amber-400 ml-1">{rating}</span>
    </div>
  );
}

function BrokerCard({ broker }) {
  return (
    <div className="card p-6 flex flex-col gap-4 hover:scale-[1.01] transition-transform duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-base">{broker.name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }} className="mt-0.5">
            📍 {broker.country}
          </p>
        </div>
        <StarRating rating={broker.rating} />
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
        {broker.description}
      </p>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "10px" }} className="uppercase tracking-wider mb-1">
            Depósito mínimo
          </p>
          <p className="font-mono font-semibold text-white text-sm">
            {broker.min_deposit_usd === 0 ? "Sin mínimo" : `$${parseFloat(broker.min_deposit_usd).toFixed(0)}`}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "10px" }} className="uppercase tracking-wider mb-1">
            Comisión / op.
          </p>
          <p className="font-mono font-semibold text-white text-sm">
            {parseFloat(broker.commission_per_trade) === 0
              ? "Sin comisión"
              : `${(parseFloat(broker.commission_per_trade) * 100).toFixed(2)}%`}
          </p>
        </div>
      </div>

      {/* Demo + assets */}
      <div className="flex flex-wrap gap-2">
        {broker.has_demo_account && (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle size={10} /> Cuenta demo
          </span>
        )}
        {broker.supported_assets?.map((asset) => (
          <span key={asset}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.15)" }}>
            {ASSET_LABELS[asset] ?? asset}
          </span>
        ))}
      </div>

      {/* Regulation */}
      <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
        🏛 Regulado por: <span className="text-white/70">{broker.regulation}</span>
      </p>

      {/* CTA */}
      <a
        href={broker.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex items-center justify-center gap-2 mt-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={14} /> Visitar sitio oficial
      </a>
    </div>
  );
}

export default function BrokersDirectory() {
  const { data: brokers, loading } = useBrokers();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Briefcase size={18} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Directorio de Brokers</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Plataformas reguladas para operar en los mercados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-80 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {brokers?.map((b) => <BrokerCard key={b.id} broker={b} />)}
        </div>
      )}
    </div>
  );
}
