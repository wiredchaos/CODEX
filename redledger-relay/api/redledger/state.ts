export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    worldVersion: 1,
    globalSignal: 50,
    nodes: [
      { id: "node-0", captured: false },
      { id: "node-1", captured: false },
      { id: "node-2", captured: false },
      { id: "node-3", captured: false },
      { id: "node-4", captured: false }
    ],
    factions: [{ id: "SOVEREIGN", power: 1 }]
  });
}
