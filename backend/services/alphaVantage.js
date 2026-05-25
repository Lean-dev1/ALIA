const BASE = "https://www.alphavantage.co/query";
const KEY  = process.env.ALPHA_VANTAGE_KEY;

// Cache en memoria simple para no quemar requests
const cache = new Map();
const TTL   = 5 * 60 * 1000; // 5 minutos

async function fetchAV(params) {
  const url = new URL(BASE);
  Object.entries({ ...params, apikey: KEY }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

  const res  = await fetch(url.toString());
  const data = await res.json();

  // Alpha Vantage devuelve error como campo, no como status HTTP
  if (data["Note"] || data["Information"]) {
    throw new Error("Rate limit alcanzado. Esperá 1 minuto.");
  }

  cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

// Precio actual de un ticker
export async function getQuote(ticker) {
  const data = await fetchAV({ function: "GLOBAL_QUOTE", symbol: ticker });
  const q    = data["Global Quote"];
  if (!q || !q["05. price"]) return null;

  return {
    ticker,
    price:      parseFloat(q["05. price"]),
    change:     parseFloat(q["09. change"]),
    changePct:  parseFloat(q["10. change percent"].replace("%", "")),
    volume:     parseInt(q["06. volume"]),
    prevClose:  parseFloat(q["08. previous close"]),
  };
}

// Historial diario (últimos N días)
export async function getDailyHistory(ticker, days = 90) {
  const data = await fetchAV({
    function:   "TIME_SERIES_DAILY",
    symbol:     ticker,
    outputsize: days > 100 ? "full" : "compact",
  });

  const series = data["Time Series (Daily)"];
  if (!series) return [];

  return Object.entries(series)
    .slice(0, days)
    .reverse()
    .map(([date, v]) => ({
      price_date:  date,
      open_price:  parseFloat(v["1. open"]),
      high_price:  parseFloat(v["2. high"]),
      low_price:   parseFloat(v["3. low"]),
      close_price: parseFloat(v["4. close"]),
      volume:      parseInt(v["5. volume"]),
    }));
}

// Datos fundamentales (sector, descripción, market cap, etc.)
export async function getOverview(ticker) {
  const data = await fetchAV({ function: "OVERVIEW", symbol: ticker });
  if (!data.Symbol) return null;

  return {
    ticker:      data.Symbol,
    name:        data.Name,
    description: data.Description,
    sector:      data.Sector,
    industry:    data.Industry,
    marketCap:   parseInt(data.MarketCapitalization),
    peRatio:     parseFloat(data.PERatio),
    dividendYield: parseFloat(data.DividendYield),
  };
}