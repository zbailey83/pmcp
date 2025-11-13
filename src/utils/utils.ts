import {
  KalshiEvent,
  KalshiResponse,
  MarketWithOdds,
  PredictItMarket,
  PredictItResponse,
  PolymarketSearchResponse,
  PolymarketMarket,
} from "./types.js";
import superagent from "superagent";

const POLYMARKET_API_BASE = "https://gamma-api.polymarket.com/public-search";
const PREDICTIT_API_URL = "https://www.predictit.org/api/marketdata/all/";
const KALSHI_API_URL = "https://api.elections.kalshi.com/trade-api/v2/events";
const USER_AGENT = "prediction-markets/1.0";

export async function getPolymarketPredictionData(
  keyword = "",
): Promise<MarketWithOdds[]> {
  const res = await superagent
    .get(`${POLYMARKET_API_BASE}?q=${keyword}`)
    .set("User-Agent", USER_AGENT);

  const json: PolymarketSearchResponse = res.body;

  if (!Array.isArray(json.events)) {
    throw new Error("Unexpected API response format");
  }

  const allMarkets = json.events.flatMap((event) => event.markets);

  return allMarkets
    .filter((market: PolymarketMarket) => market.active && !market.archived)
    .map((market: PolymarketMarket) => {
      const outcomes =
        typeof market.outcomes === "string"
          ? JSON.parse(market.outcomes)
          : market.outcomes;
      const outcomePrices =
        typeof market.outcomePrices === "string"
          ? JSON.parse(market.outcomePrices)
          : market.outcomePrices;

      if (!outcomes || !outcomePrices) {
        return { ...market, odds: {} };
      }

      const totalPrice = Object.values<number>(outcomePrices).reduce(
        (sum, price) => sum + price,
        0,
      );

      const odds: Record<string, number> = {};
      outcomes.forEach((outcome: string, index: number) => {
        const price = outcomePrices[index] || 0;
        odds[outcome] = totalPrice > 0 ? price / totalPrice : 0;
      });

      return { ...market, outcomes, odds };
    });
}

export async function getPredictItMarkets(): Promise<PredictItMarket[]> {
  const res = await superagent
    .get(PREDICTIT_API_URL)
    .set("User-Agent", USER_AGENT);

  const data: PredictItResponse = res.body;

  if (!Array.isArray(data.markets)) {
    throw new Error("Unexpected PredictIt API format");
  }

  return data.markets.filter((market) => market.status === "Open");
}

export async function getKalshiMarkets(): Promise<KalshiEvent[]> {
  const res = await superagent
    .get(KALSHI_API_URL)
    .set("accept", "application/json")
    .set("User-Agent", USER_AGENT);

  const data: KalshiResponse = res.body;

  if (!Array.isArray(data.events)) {
    throw new Error("Unexpected Kalshi API format");
  }

  return data.events;
}
