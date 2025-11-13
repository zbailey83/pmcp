import express from "express";
import {
  getPolymarketPredictionData,
  getPredictItMarkets,
  getKalshiMarkets,
} from "./utils/utils.js";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/api/markets", async (req, res) => {
  const keyword = req.query.keyword as string;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  const lowerKeyword = keyword.toLowerCase();
  const errors: string[] = [];
  let polyMarkets: any[] = [];
  let predictItMarkets: any[] = [];
  let kalshiMarkets: any[] = [];

  try {
    polyMarkets = await getPolymarketPredictionData(keyword);
  } catch (error) {
    errors.push(
      `Polymarket: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    predictItMarkets = await getPredictItMarkets();
  } catch (error) {
    errors.push(
      `PredictIt: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    kalshiMarkets = await getKalshiMarkets();
  } catch (error) {
    errors.push(
      `Kalshi: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  const filteredPredictIt = predictItMarkets.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerKeyword) ||
      m.shortName.toLowerCase().includes(lowerKeyword),
  );

  const filteredKalshi = kalshiMarkets.filter((e) =>
    e.title.toLowerCase().includes(lowerKeyword),
  );

  if (errors.length === 3) {
    return res
      .status(500)
      .json({ error: "Failed to fetch markets from all platforms" });
  }

  console.log({
    polyMarkets,
    predictItMarkets: filteredPredictIt,
    kalshiMarkets: filteredKalshi,
    errors,
  });
  res.json({
    polyMarkets,
    predictItMarkets: filteredPredictIt,
    kalshiMarkets: filteredKalshi,
    errors,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
