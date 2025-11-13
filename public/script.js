const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const marketsContainer = document.getElementById("markets-container");

searchButton.addEventListener("click", async () => {
  const keyword = searchInput.value;
  if (!keyword) {
    return;
  }

  const response = await fetch(`/api/markets?keyword=${keyword}`);
  const data = await response.json();

  if (response.status !== 200) {
    marketsContainer.innerHTML = `<div class="error">${data.error}</div>`;
    return;
  }

  const { polyMarkets, predictItMarkets, kalshiMarkets, errors } = data;

  if (
    polyMarkets.length === 0 &&
    predictItMarkets.length === 0 &&
    kalshiMarkets.length === 0
  ) {
    marketsContainer.innerHTML = "No markets found";
    return;
  }

  let html = "";

  if (errors.length > 0) {
    html += `<div class="error">⚠️ Some platforms failed: ${errors.join(
      "; ",
    )}</div>`;
  }

  polyMarkets.forEach((m) => {
    const oddsList = Object.entries(m.odds)
      .map(
        ([outcome, prob]) => `${outcome}: ${(prob * 100).toFixed(1)}%`,
      )
      .join(" | ");
    html += `<div class="market"><strong>Polymarket: ${m.question}</strong><br>${oddsList}</div>`;
  });

  predictItMarkets.forEach((m) => {
    const contractOdds = m.contracts
      .map((c) => {
        const pct =
          c.lastTradePrice != null
            ? `${(c.lastTradePrice * 100).toFixed(1)}%`
            : "n/a";
        return `${c.shortName}: ${pct}`;
      })
      .join(" | ");
    html += `<div class="market"><strong>PredictIt: ${m.name}</strong><br>${contractOdds}</div>`;
  });

  kalshiMarkets.forEach((e) => {
    html += `<div class="market"><strong>Kalshi: ${e.title}</strong><br>${e.sub_title} (${e.category})</div>`;
  });

  marketsContainer.innerHTML = html;
});
