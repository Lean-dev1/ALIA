import { LayoutDashboard, Calculator, Building2, Briefcase, TrendingUp, Sun, Moon } from "lucide-react";

const nav = [
  { id: "dashboard",  label: "Dashboard",        icon: LayoutDashboard },
  { id: "calculator", label: "Simulador",         icon: Calculator },
  { id: "companies",  label: "Empresas",          icon: Building2 },
  { id: "brokers",    label: "Brokers",           icon: Briefcase },
];

export default function Sidebar({ active, setActive, theme, toggleTheme }) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0, left: 0,
      zIndex: 30,
    }}>
      {/* Wordmark */}
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
          <TrendingUp size={16} color="rgba(255,255,255,0.9)" />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17,
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.01em",
          }}>
            FintechPro
          </span>
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: 26 }}>
          Investment Platform
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "8px 12px 4px" }}>
          Módulos
        </p>
        {nav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 2,
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "all 0.15s",
                borderLeft: isActive ? "2px solid rgba(255,255,255,0.7)" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            borderRadius: 2,
            marginBottom: 12,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.6, paddingLeft: 12 }}>
          Solo fines educativos.<br />No es asesoría financiera.
        </p>
      </div>
    </aside>
  );
}