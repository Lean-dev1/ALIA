import { query } from "../db/pool.js";

/**
 * POST /api/simulate
 * Body: { ticker, initialAmount, periodMonths, compoundFrequency }
 *
 * Calcula proyección de inversión con interés compuesto basado en
 * el retorno histórico promedio de la categoría de riesgo de la empresa.
 */
export const simulateInvestment = async (req, res) => {
  try {
    const {
      ticker,
      initialAmount,
      periodMonths,
      compoundFrequency = "monthly", // 'monthly' | 'annually'
    } = req.body;

    // Validaciones básicas
    if (!ticker || !initialAmount || !periodMonths) {
      return res.status(400).json({
        success: false,
        error: "Se requieren: ticker, initialAmount y periodMonths",
      });
    }
    if (initialAmount <= 0 || periodMonths <= 0) {
      return res.status(400).json({
        success: false,
        error: "Los valores deben ser positivos",
      });
    }

    // Buscar empresa y tasa de retorno esperada
    const companyResult = await query(
      `SELECT c.id, c.ticker, c.name, c.sector,
              r.slug AS risk_slug, r.label AS risk_label, r.color_hex,
              r.annual_return_min, r.annual_return_max
       FROM companies c
       JOIN risk_categories r ON c.risk_id = r.id
       WHERE UPPER(c.ticker) = UPPER($1) AND c.is_active = TRUE`,
      [ticker]
    );

    if (!companyResult.rows.length) {
      return res.status(404).json({ success: false, error: "Empresa no encontrada" });
    }

    const company = companyResult.rows[0];

    // Tasa anual: promedio entre min y max del perfil de riesgo
    const annualRateMin = parseFloat(company.annual_return_min) / 100;
    const annualRateAvg =
      (parseFloat(company.annual_return_min) +
        parseFloat(company.annual_return_max)) /
      2 /
      100;
    const annualRateMax = parseFloat(company.annual_return_max) / 100;

    const P = parseFloat(initialAmount);
    const t = parseFloat(periodMonths) / 12; // años

    // Interés compuesto: A = P * (1 + r/n)^(n*t)
    const n = compoundFrequency === "monthly" ? 12 : 1;

    const calcFinal = (rate) => P * Math.pow(1 + rate / n, n * t);

    const finalMin = calcFinal(annualRateMin);
    const finalAvg = calcFinal(annualRateAvg);
    const finalMax = calcFinal(annualRateMax);

    // Proyección mensual para gráfica
    const monthlyProjection = [];
    for (let m = 0; m <= periodMonths; m++) {
      const tM = m / 12;
      monthlyProjection.push({
        month: m,
        conservative: parseFloat((P * Math.pow(1 + annualRateMin / n, n * tM)).toFixed(2)),
        expected: parseFloat((P * Math.pow(1 + annualRateAvg / n, n * tM)).toFixed(2)),
        optimistic: parseFloat((P * Math.pow(1 + annualRateMax / n, n * tM)).toFixed(2)),
      });
    }

    const result = {
      company: {
        ticker: company.ticker,
        name: company.name,
        risk_slug: company.risk_slug,
        risk_label: company.risk_label,
        risk_color: company.color_hex,
      },
      input: {
        initialAmount: P,
        periodMonths: parseInt(periodMonths),
        compoundFrequency,
      },
      scenarios: {
        conservative: {
          annualRate: parseFloat(company.annual_return_min),
          finalAmount: parseFloat(finalMin.toFixed(2)),
          totalGain: parseFloat((finalMin - P).toFixed(2)),
          gainPct: parseFloat((((finalMin - P) / P) * 100).toFixed(2)),
        },
        expected: {
          annualRate: parseFloat(
            ((parseFloat(company.annual_return_min) + parseFloat(company.annual_return_max)) / 2).toFixed(2)
          ),
          finalAmount: parseFloat(finalAvg.toFixed(2)),
          totalGain: parseFloat((finalAvg - P).toFixed(2)),
          gainPct: parseFloat((((finalAvg - P) / P) * 100).toFixed(2)),
        },
        optimistic: {
          annualRate: parseFloat(company.annual_return_max),
          finalAmount: parseFloat(finalMax.toFixed(2)),
          totalGain: parseFloat((finalMax - P).toFixed(2)),
          gainPct: parseFloat((((finalMax - P) / P) * 100).toFixed(2)),
        },
      },
      monthlyProjection,
    };

    // Guardar simulación en historial
    await query(
      `INSERT INTO investment_simulations
         (company_id, initial_amount, period_months, annual_rate, final_amount, total_gain, gain_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        companyResult.rows[0].id,
        P,
        parseInt(periodMonths),
        annualRateAvg,
        finalAvg,
        finalAvg - P,
        ((finalAvg - P) / P) * 100,
      ]
    );

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error al calcular simulación" });
  }
};
