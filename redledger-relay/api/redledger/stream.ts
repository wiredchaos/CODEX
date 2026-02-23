export default function handler(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ tick: Date.now() })}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
  });
}
