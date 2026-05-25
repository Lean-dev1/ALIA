# FintechPro — Plataforma de Inversión y Simulación

Stack: React + Vite + Tailwind CSS · Node.js + Express · PostgreSQL · Docker

---

## Estructura del Proyecto

```
fintech-platform/
├── docker-compose.yml          # Orquestación de todos los servicios
├── database/
│   └── init.sql                # Schema + seed data (ejecutado automáticamente)
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # Entry point Express
│       ├── db/pool.js          # Conexión PostgreSQL (pg Pool)
│       ├── routes/index.js     # Definición de rutas
│       └── controllers/
│           ├── companiesController.js
│           ├── simulationController.js
│           └── brokersController.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             # Layout principal + router de páginas
        ├── index.css           # Design tokens + componentes base
        ├── utils/api.js        # Fetch wrapper
        ├── hooks/useData.js    # Custom hooks de datos
        └── components/
            ├── dashboard/
            │   ├── Sidebar.jsx
            │   ├── MarketBar.jsx
            │   ├── DashboardOverview.jsx
            │   └── PriceChart.jsx       # Recharts AreaChart
            ├── calculator/
            │   └── InvestmentCalculator.jsx  # Interés compuesto + proyección
            ├── companies/
            │   └── CompaniesDirectory.jsx
            └── brokers/
                └── BrokersDirectory.jsx
```

---

## Cómo Levantar el Proyecto

### Requisitos
- Docker Desktop instalado y corriendo
- Puerto 5432, 4000 y 5173 disponibles

### 1. Clonar y arrancar

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto levantará automáticamente:
- **PostgreSQL** en `localhost:5432` (con schema y datos de prueba)
- **Backend API** en `http://localhost:4000`
- **Frontend** en `http://localhost:5173`

### 2. Desarrollo local (sin Docker)

**Backend:**
```bash
cd backend
cp .env.example .env   # Ajustar DATABASE_URL
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/market/summary` | Top movers, estadísticas generales |
| GET | `/api/companies` | Todas las empresas (`?risk=low\|medium\|high`) |
| GET | `/api/companies/:ticker` | Detalle de una empresa |
| GET | `/api/companies/:ticker/history` | Historial precios (`?days=90`) |
| POST | `/api/simulate` | Simular inversión con interés compuesto |
| GET | `/api/brokers` | Listado de brokers |
| GET | `/health` | Health check de la API + DB |

### Ejemplo: POST /api/simulate

```json
{
  "ticker": "AAPL",
  "initialAmount": 10000,
  "periodMonths": 24,
  "compoundFrequency": "monthly"
}
```

**Respuesta:** Escenarios conservador/esperado/optimista + proyección mensual para graficar.

---

## Paleta de Colores

| Variable | Uso | Color |
|----------|-----|-------|
| `--bg-primary` | Fondo principal | `#040d1f` |
| `--bg-card` | Tarjetas y panels | `#0d1f3c` |
| `--accent` | Azul primario | `#3b82f6` |
| `--gain` | Subidas / ganancia | `#22c55e` |
| `--loss` | Bajas / pérdida | `#ef4444` |
| Riesgo bajo | Badge verde | `#22c55e` |
| Riesgo medio | Badge ámbar | `#f59e0b` |
| Riesgo alto | Badge rojo | `#ef4444` |

---

## Próximos Pasos Sugeridos

- [ ] Autenticación JWT (registro/login de usuarios)
- [ ] Portafolio personal por usuario
- [ ] Integración con API real de cotizaciones (Alpha Vantage, Polygon.io)
- [ ] WebSockets para cotizaciones en tiempo real
- [ ] Exportación de simulaciones a PDF
- [ ] Alertas de precio por email

---

> ⚠ **Aviso legal:** Los datos, tasas y proyecciones incluidos son ficticios y tienen fines exclusivamente educativos. No constituyen asesoramiento financiero.
