import { Router } from "express";
import {
  getAllCompanies,
  getCompanyByTicker,
  getPriceHistory,
  getMarketSummary,
  getLiveQuote,
} from "../controllers/companiesController.js";
import { simulateInvestment } from "../controllers/simulationController.js";
import { getAllBrokers } from "../controllers/brokersController.js";

const router = Router();

// ── Market ─────────────────────────────────────────────────
router.get("/market/summary", getMarketSummary);

// ── Companies ──────────────────────────────────────────────
router.get("/companies", getAllCompanies);               // ?risk=low|medium|high
router.get("/companies/:ticker", getCompanyByTicker);
router.get("/companies/:ticker/history", getPriceHistory); // ?days=90
router.get("/quote/:ticker", getLiveQuote);
// ── Simulation ─────────────────────────────────────────────
router.post("/simulate", simulateInvestment);

// ── Brokers ────────────────────────────────────────────────
router.get("/brokers", getAllBrokers);

export default router;
