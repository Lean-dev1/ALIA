import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export function useFetch(path, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const refetch = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api.get(path)
      .then((res) => { 
        setData(res.data); 
        setError(null); 
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

export function useCompanies(riskFilter = "") {
  const path = riskFilter ? `/companies?risk=${riskFilter}` : "/companies";
  return useFetch(path, [riskFilter]);
}

export function usePriceHistory(ticker, days = 90) {
  return useFetch(ticker ? `/companies/${ticker}/history?days=${days}` : null, [ticker, days]);
}

export function useMarketSummary() {
  return useFetch("/market/summary");
}

export function useBrokers() {
  return useFetch("/brokers");
}

export function useLiveQuote(ticker) {
  return useFetch(ticker ? `/quote/${ticker}` : null, [ticker]);
}