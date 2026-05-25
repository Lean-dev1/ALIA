-- ============================================================
-- FINTECH PLATFORM — Schema SQL + Seed Data
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLA: risk_categories
-- ─────────────────────────────────────────────
CREATE TABLE risk_categories (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(20)  UNIQUE NOT NULL,  -- 'low' | 'medium' | 'high'
    label       VARCHAR(50)  NOT NULL,
    description TEXT         NOT NULL,
    color_hex   VARCHAR(7)   NOT NULL,          -- para UI
    annual_return_min NUMERIC(5,2) NOT NULL,    -- % mínimo histórico
    annual_return_max NUMERIC(5,2) NOT NULL     -- % máximo histórico
);

-- ─────────────────────────────────────────────
-- TABLA: companies
-- ─────────────────────────────────────────────
CREATE TABLE companies (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker          VARCHAR(10)  UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    sector          VARCHAR(80)  NOT NULL,
    description     TEXT,
    logo_url        VARCHAR(255),
    risk_id         INTEGER      REFERENCES risk_categories(id) ON DELETE SET NULL,
    current_price   NUMERIC(12,4),
    price_change_pct NUMERIC(6,2) DEFAULT 0,  -- % cambio 24h
    market_cap_usd  BIGINT,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: price_history
-- ─────────────────────────────────────────────
CREATE TABLE price_history (
    id          BIGSERIAL    PRIMARY KEY,
    company_id  UUID         REFERENCES companies(id) ON DELETE CASCADE,
    price_date  DATE         NOT NULL,
    open_price  NUMERIC(12,4),
    high_price  NUMERIC(12,4),
    low_price   NUMERIC(12,4),
    close_price NUMERIC(12,4) NOT NULL,
    volume      BIGINT,
    UNIQUE (company_id, price_date)
);

CREATE INDEX idx_price_history_company_date ON price_history(company_id, price_date DESC);

-- ─────────────────────────────────────────────
-- TABLA: brokers
-- ─────────────────────────────────────────────
CREATE TABLE brokers (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100) NOT NULL,
    logo_url            VARCHAR(255),
    country             VARCHAR(60),
    description         TEXT,
    website_url         VARCHAR(255),
    min_deposit_usd     NUMERIC(10,2),
    commission_per_trade NUMERIC(6,4) DEFAULT 0,  -- % por operación
    has_demo_account    BOOLEAN      DEFAULT FALSE,
    regulation          VARCHAR(200), -- "SEC, FINRA, FCA"
    rating              NUMERIC(3,1) CHECK (rating BETWEEN 0 AND 5),
    supported_assets    TEXT[],      -- ["stocks","etfs","crypto"]
    is_active           BOOLEAN      DEFAULT TRUE,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: investment_simulations (histórico)
-- ─────────────────────────────────────────────
CREATE TABLE investment_simulations (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID        REFERENCES companies(id) ON DELETE SET NULL,
    initial_amount  NUMERIC(14,2) NOT NULL,
    period_months   INTEGER     NOT NULL,
    annual_rate     NUMERIC(6,4) NOT NULL,
    final_amount    NUMERIC(14,2) NOT NULL,
    total_gain      NUMERIC(14,2) NOT NULL,
    gain_pct        NUMERIC(8,4) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TRIGGER: updated_at automático para companies
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categorías de riesgo
INSERT INTO risk_categories (slug, label, description, color_hex, annual_return_min, annual_return_max) VALUES
('low',    'Riesgo Bajo',   'Empresas ideales para el largo plazo. Rendimiento estable con mínima exposición a pérdidas.', '#22c55e', 4.00,  10.00),
('medium', 'Riesgo Medio',  'Equilibrio entre seguridad y rentabilidad. Horizonte de inversión de mediano plazo.',           '#f59e0b', 10.00, 25.00),
('high',   'Riesgo Alto',   'Alta volatilidad, alto potencial de ganancia en corto plazo. Riesgo significativo de pérdida.', '#ef4444', 25.00, 80.00);

-- Empresas — Riesgo Bajo (id=1)
INSERT INTO companies (ticker, name, sector, description, risk_id, current_price, price_change_pct, market_cap_usd) VALUES
('AAPL',  'Apple Inc.',                'Tecnología',        'Gigante tecnológico con ecosistema de hardware y software global.', 1, 189.50,  0.42,  2950000000000),
('MSFT',  'Microsoft Corporation',     'Tecnología',        'Líder en software empresarial, nube Azure y productividad.', 1, 415.20,  0.87,  3090000000000),
('JNJ',   'Johnson & Johnson',         'Salud',             'Multinacional farmacéutica y de cuidado personal con más de 130 años.', 1, 158.90, -0.21,  382000000000),
('PG',    'Procter & Gamble',          'Consumo Básico',    'Portafolio de marcas de consumo masivo a nivel mundial.', 1, 163.40,  0.14,  387000000000),
('BRK',   'Berkshire Hathaway',        'Conglomerado',      'Holding de Warren Buffett con diversificación en múltiples sectores.', 1, 548.70,  0.33,  780000000000);

-- Empresas — Riesgo Medio (id=2)
INSERT INTO companies (ticker, name, sector, description, risk_id, current_price, price_change_pct, market_cap_usd) VALUES
('AMZN',  'Amazon.com Inc.',           'E-Commerce / Nube', 'Domina el e-commerce y la nube con AWS como principal motor.', 2, 198.30,  1.23,  2070000000000),
('GOOGL', 'Alphabet Inc.',             'Tecnología',        'Empresa matriz de Google, líder en publicidad digital e IA.', 2, 175.60,  0.95,  2190000000000),
('NVDA',  'NVIDIA Corporation',        'Semiconductores',   'Líder en GPUs para gaming, IA y centros de datos.', 2, 875.40,  2.18,  2160000000000),
('TSLA',  'Tesla Inc.',                'Automotriz / Energía','Pionero en vehículos eléctricos y energía sostenible.', 2, 248.70, -1.45,  793000000000),
('V',     'Visa Inc.',                 'Servicios Financieros','Red global de pagos digitales con presencia en 200+ países.', 2, 278.90,  0.61,  568000000000);

-- Empresas — Riesgo Alto (id=3)
INSERT INTO companies (ticker, name, sector, description, risk_id, current_price, price_change_pct, market_cap_usd) VALUES
('COIN',  'Coinbase Global',           'Crypto / Fintech',  'Principal exchange de criptomonedas en EE.UU., altamente correlacionado con BTC.', 3, 224.50,  4.82,  54000000000),
('RBLX',  'Roblox Corporation',        'Gaming / Metaverso','Plataforma de juegos en línea con economía virtual propia.', 3,  42.30, -2.34,  26000000000),
('RIVN',  'Rivian Automotive',         'Vehículos Eléctricos','Startup de EVs respaldada por Amazon, aún en etapa de escalamiento.', 3,  14.70, -3.12,  14000000000),
('PLTR',  'Palantir Technologies',     'Software / IA',     'Software de análisis de datos para gobiernos y empresas. Alta volatilidad.', 3,  22.80,  5.67,  49000000000),
('MSTR',  'MicroStrategy',             'Software / Bitcoin', 'Empresa de software cuya estrategia financiera está ligada a la tenencia de Bitcoin.', 3, 187.40,  8.94,  26000000000);

-- Historial de precios (últimos 12 días por empresa — Apple como ejemplo completo)
INSERT INTO price_history (company_id, price_date, open_price, high_price, low_price, close_price, volume)
SELECT c.id,
       (NOW() - (n || ' days')::INTERVAL)::DATE,
       189.50 + (RANDOM() * 8 - 4),
       191.00 + (RANDOM() * 5),
       187.00 + (RANDOM() * 3 - 1),
       189.50 + (RANDOM() * 8 - 4),
       (55000000 + RANDOM() * 20000000)::BIGINT
FROM companies c, generate_series(1, 365) AS n
WHERE c.ticker = 'AAPL'
ON CONFLICT DO NOTHING;

INSERT INTO price_history (company_id, price_date, open_price, high_price, low_price, close_price, volume)
SELECT c.id,
       (NOW() - (n || ' days')::INTERVAL)::DATE,
       415.20 + (RANDOM() * 15 - 7),
       420.00 + (RANDOM() * 8),
       410.00 + (RANDOM() * 5 - 2),
       415.20 + (RANDOM() * 15 - 7),
       (22000000 + RANDOM() * 8000000)::BIGINT
FROM companies c, generate_series(1, 365) AS n
WHERE c.ticker = 'MSFT'
ON CONFLICT DO NOTHING;

INSERT INTO price_history (company_id, price_date, open_price, high_price, low_price, close_price, volume)
SELECT c.id,
       (NOW() - (n || ' days')::INTERVAL)::DATE,
       875.40 + (RANDOM() * 60 - 30),
       900.00 + (RANDOM() * 30),
       850.00 + (RANDOM() * 20 - 10),
       875.40 + (RANDOM() * 60 - 30),
       (45000000 + RANDOM() * 20000000)::BIGINT
FROM companies c, generate_series(1, 365) AS n
WHERE c.ticker = 'NVDA'
ON CONFLICT DO NOTHING;

-- Brokers
INSERT INTO brokers (name, country, description, website_url, min_deposit_usd, commission_per_trade, has_demo_account, regulation, rating, supported_assets) VALUES
('Interactive Brokers', 'EE.UU.',    'Broker institucional con acceso a más de 150 mercados globales. Ideal para traders avanzados.', 'https://www.interactivebrokers.com', 0.00,    0.0005, TRUE,  'SEC, FINRA, FCA, MiFID II', 4.8, ARRAY['stocks','etfs','options','futures','forex','crypto']),
('TD Ameritrade',       'EE.UU.',    'Plataforma robusta con herramientas de análisis avanzadas. Fusionado con Charles Schwab.', 'https://www.tdameritrade.com',       0.00,    0.0000, TRUE,  'SEC, FINRA, SIPC', 4.6, ARRAY['stocks','etfs','options','mutual funds']),
('eToro',               'Reino Unido','Plataforma de social trading. Permite copiar operaciones de traders exitosos.', 'https://www.etoro.com',              50.00,   0.0000, TRUE,  'FCA, CySEC, ASIC', 4.3, ARRAY['stocks','etfs','crypto','forex','cfd']),
('Binance',             'Global',    'Mayor exchange de criptomonedas del mundo por volumen. Ofrece spot, futuros y staking.', 'https://www.binance.com',            10.00,   0.0010, TRUE,  'MAS, FCA (limitado)', 4.2, ARRAY['crypto','futures','staking','nft']),
('Revolut',             'Reino Unido','Neobank europeo con funcionalidades de inversión en acciones y crypto integradas.', 'https://www.revolut.com',            0.00,    0.0025, FALSE, 'FCA, CySEC', 4.0, ARRAY['stocks','etfs','crypto']),
('Fidelity',            'EE.UU.',    'Broker tradicional con excelente servicio al cliente y sin comisiones en acciones.', 'https://www.fidelity.com',           0.00,    0.0000, FALSE, 'SEC, FINRA, SIPC', 4.7, ARRAY['stocks','etfs','mutual funds','bonds','options']);
