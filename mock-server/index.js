const express = require("express");
const cors = require("cors");
const {
  getStations,
  getStation,
  getStationHistory,
  getStationUtilisationPct,
  getUtilisationSeries,
} = require("./data");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function parseHours(req, res, fallback = 24) {
  const raw = req.query.hours;
  if (raw === undefined) return fallback;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) {
    res.status(400).json({ error: "hours must be a positive number" });
    return null;
  }
  return hours;
}

app.get("/api/stations", (_req, res) => {
  res.json(getStations());
});

app.get("/api/stations/:id/history", (req, res) => {
  const hours = parseHours(req, res);
  if (hours === null) return;
  const history = getStationHistory(req.params.id, hours);
  if (history === null) {
    res.status(404).json({ error: `Unknown station: ${req.params.id}` });
    return;
  }
  res.json({
    stationId: req.params.id,
    hours,
    utilisationPct: getStationUtilisationPct(req.params.id, hours),
    intervals: history,
  });
});

app.get("/api/utilisation", (req, res) => {
  const hours = parseHours(req, res);
  if (hours === null) return;
  res.json({ hours, samples: getUtilisationSeries(hours) });
});

const streamClients = new Set();

app.get("/api/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const send = () => {
    res.write(`data: ${JSON.stringify(getStations())}\n\n`);
  };

  send(); // push current state immediately on connect
  const interval = setInterval(send, 3000);
  streamClients.add(res);

  req.on("close", () => {
    clearInterval(interval);
    streamClients.delete(res);
    res.end();
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, stations: getStation("M01") ? 6 : 0 });
});

// Test-only: force-closes every open SSE connection so E2E tests can
// exercise the client's "reconnecting" UI without killing the whole
// server process. Not part of the API a real client would call.
app.post("/api/test/drop-stream", (_req, res) => {
  const dropped = streamClients.size;
  for (const client of streamClients) client.end();
  streamClients.clear();
  res.json({ dropped });
});

app.listen(PORT, () => {
  console.log(`Mock factory server listening on http://localhost:${PORT}`);
  console.log("  GET  /api/stations");
  console.log("  GET  /api/stations/:id/history?hours=24");
  console.log("  GET  /api/utilisation?hours=24");
  console.log("  GET  /api/stream (SSE)");
});
