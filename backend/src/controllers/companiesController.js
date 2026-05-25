import { query } from "../db/pool.js";
import { getQuote, getDailyHistory } from "../../services/alphaVantage.js";
// GET /api/companies — todas las empresas con su categoría de riesgo
export const getAllCompanies = async (req, res) => {
  try {
    const { risk } = req.query; // ?risk=low|medium|high
    let sql = `
      SELECT
        c.id, c.ticker, c.name, c.sector, c.description,
        c.current_price, c.price_change_pct, c.market_cap_usd,
        r.slug  AS risk_slug,
        r.label AS risk_label,
        r.color_hex AS risk_color,
        r.annual_return_min,
        r.annual_return_max
      FROM companies c
      JOIN risk_categories r ON c.risk_id = r.id
      WHERE c.is_active = TRUE
    `;
    const params = [];
    if (risk) {
      params.push(risk);
      sql += ` AND r.slug = $${params.length}`;
    }
    sql += " ORDER BY r.id ASC, c.name ASC";

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error al obtener empresas" });
  }
};

// GET /api/companies/:ticker — detalle de una empresa
export const getCompanyByTicker = async (req, res) => {
  try {
    const { ticker } = req.params;
    const result = await query(
      `SELECT c.*, r.slug AS risk_slug, r.label AS risk_label,
              r.color_hex AS risk_color, r.description AS risk_description,
              r.annual_return_min, r.annual_return_max
       FROM companies c
       JOIN risk_categories r ON c.risk_id = r.id
       WHERE UPPER(c.ticker) = UPPER($1) AND c.is_active = TRUE`,
      [ticker]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: "Empresa no encontrada" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al obtener empresa" });
  }
};

// GET /api/companies/:ticker/history?days=90
export const getPriceHistory = async (req, res) => {
  const { ticker } = req.params;
  const days = parseInt(req.query.days) || 90;

  try {
    // 1. Intentar con Alpha Vantage (datos reales)
    const liveData = await getDailyHistory(ticker, days);
    if (liveData.length > 0) {
      return res.json({ success: true, data: liveData, source: "alphavantage" });
    }
  } catch (err) {
    console.warn(`AV rate limit para ${ticker}, usando DB:`, err.message);
  }

  // 2. Fallback a la base de datos local
  const company = await query(
    "SELECT id FROM companies WHERE UPPER(ticker) = UPPER($1)", [ticker]
  );
  if (!company.rows.length) {
    return res.status(404).json({ success: false, error: "Empresa no encontrada" });
  }
  const history = await query(
    `SELECT price_date, open_price, high_price, low_price, close_price, volume
     FROM price_history
     WHERE company_id = $1 AND price_date >= NOW() - ($2 || ' days')::INTERVAL
     ORDER BY price_date ASC`,
    [company.rows[0].id, days]
  );
  res.json({ success: true, data: history.rows, source: "database" });
};

// GET /api/companies/market/summary — resumen del mercado (top movers)
export const getMarketSummary = async (req, res) => {
  try {
    const gainers = await query(`
      SELECT ticker, name, current_price, price_change_pct, r.slug AS risk_slug, r.color_hex
      FROM companies c JOIN risk_categories r ON c.risk_id = r.id
      WHERE is_active = TRUE ORDER BY price_change_pct DESC LIMIT 5
    `);
    const losers = await query(`
      SELECT ticker, name, current_price, price_change_pct, r.slug AS risk_slug, r.color_hex
      FROM companies c JOIN risk_categories r ON c.risk_id = r.id
      WHERE is_active = TRUE ORDER BY price_change_pct ASC LIMIT 5
    `);
    const stats = await query(`
      SELECT
        COUNT(*) FILTER (WHERE price_change_pct > 0) AS gainers_count,
        COUNT(*) FILTER (WHERE price_change_pct < 0) AS losers_count,
        COUNT(*) FILTER (WHERE price_change_pct = 0) AS unchanged_count,
        ROUND(AVG(price_change_pct)::NUMERIC, 2) AS avg_change
      FROM companies WHERE is_active = TRUE
    `);
    res.json({
      success: true,
      data: {
        gainers: gainers.rows,
        losers: losers.rows,
        stats: stats.rows[0],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al obtener resumen de mercado" });
  }
};
// GET /api/quote/:ticker — cotización en vivo
export const getLiveQuote = async (req, res) => {
  try {
    const { ticker } = req.params;
    const quote = await getQuote(ticker);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: "Cotización no encontrada" });
    }
    
    res.json({ success: true, data: quote });
  } catch (err) {
    console.error(`Error obteniendo quote para ${req.params.ticker}:`, err.message);
    res.status(500).json({ success: false, error: "Error al obtener cotización de Alpha Vantage" });
  }
};
