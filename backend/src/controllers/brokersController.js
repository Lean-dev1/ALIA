import { query } from "../db/pool.js";

// GET /api/brokers
export const getAllBrokers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, country, description, website_url,
              min_deposit_usd, commission_per_trade,
              has_demo_account, regulation, rating, supported_assets
       FROM brokers
       WHERE is_active = TRUE
       ORDER BY rating DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al obtener brokers" });
  }
};
