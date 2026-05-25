import { useState } from "react";
import Sidebar from "./components/dashboard/Sidebar";
import MarketBar from "./components/dashboard/MarketBar";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import InvestmentCalculator from "./components/calculator/InvestmentCalculator";
import CompaniesDirectory from "./components/companies/CompaniesDirectory";
import BrokersDirectory from "./components/brokers/BrokersDirectory";
import PriceChart from "./components/dashboard/PriceChart";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [chartOverlay, setChartOverlay] = useState(null); // {ticker, name}

  const handleSelectChart = (ticker, name) => {
    setChartOverlay({ ticker, name });
    setPage("dashboard");
  };

  const pages = {
    dashboard:  <DashboardOverview onSelectChart={handleSelectChart} />,
    calculator: <InvestmentCalculator />,
    companies:  <CompaniesDirectory onSelectChart={handleSelectChart} />,
    brokers:    <BrokersDirectory />,
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar active={page} setActive={(p) => { setPage(p); setChartOverlay(null); }} />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <MarketBar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Chart overlay (when clicking a company from directory) */}
          {chartOverlay && page === "dashboard" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Gráfico seleccionado desde Directorio
                </p>
                <button
                  onClick={() => setChartOverlay(null)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                >
                  ✕ Cerrar gráfico
                </button>
              </div>
              <PriceChart ticker={chartOverlay.ticker} name={chartOverlay.name} />
            </div>
          )}

          {pages[page] ?? pages.dashboard}
        </main>
      </div>
    </div>
  );
}
