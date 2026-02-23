export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    skyTint: "#0a0a0f",
    volatility: 1,
    spawnRateMultiplier: 1
  });
}
