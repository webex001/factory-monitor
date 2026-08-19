// In-memory station state + simulation for the mock backend.
// Standing in for DAQ -> processing -> PostgreSQL; nothing here persists
// across a server restart, which is fine for a mock.

const STATUSES = ["running", "idle", "maintenance", "faulted"];

// Weighted so the line spends most of its time running, matching a
// factory that's actually producing rather than constantly broken.
const STATUS_WEIGHTS = { running: 0.72, idle: 0.15, maintenance: 0.07, faulted: 0.06 };

// `stage` is the short process step shown in the Stations table's STAGE
// column; `type` is the longer descriptive label shown in TYPE. Both come
// from the task doc's Machine/Process table, split into the two columns
const STATION_DEFS = [
  { id: "M01", name: "3D Printer", stage: "Print", type: "Metal 3D Print", kind: "printer" },
  { id: "M02", name: "CNC Lathe", stage: "Turn", type: "Precision turning", kind: "lathe" },
  { id: "M03", name: "Honing Machine", stage: "Hone", type: "Bore honing", kind: "hone" },
  { id: "M04", name: "Test Rig", stage: "Test", type: "End-of-line performance test", kind: "test" },
  { id: "M05", name: "Laser Marker", stage: "Mark", type: "Part identification", kind: "mark" },
  { id: "M06", name: "Shipping Station", stage: "Ship", type: "Packaging and dispatch", kind: "ship" },
];

const TICK_MS = 3000;
const HISTORY_SEED_HOURS = 24;

let serialCounter = 1000;
function nextSerial() {
  serialCounter += 1;
  return `VLV-${String(serialCounter).padStart(6, "0")}`;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function pickWeightedStatus(excludeCurrent) {
  const entries = Object.entries(STATUS_WEIGHTS).filter(([s]) => s !== excludeCurrent);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [status, weight] of entries) {
    r -= weight;
    if (r <= 0) return status;
  }
  return entries[entries.length - 1][0];
}

function pickInitialStatus() {
  let r = Math.random();
  for (const status of STATUSES) {
    r -= STATUS_WEIGHTS[status];
    if (r <= 0) return status;
  }
  return "running";
}

// --- Telemetry ---------------------------------------------------------

function initTelemetry(kind) {
  switch (kind) {
    case "printer":
      return {
        chamber_temp_c: round1(randRange(195, 205)),
        build_progress_pct: Math.floor(randRange(0, 100)),
        material_remaining_pct: round1(randRange(40, 95)),
        job_id: `J-${String(Math.floor(randRange(1000, 9999)))}`,
      };
    case "lathe":
      return {
        spindle_rpm: Math.round(randRange(1200, 1800)),
        coolant_temp_c: round1(randRange(28, 38)),
      };
    case "hone":
      return {};
    case "test":
      return {
        test_running: false,
        test_result: null,
        inlet_pressure_bar: round1(randRange(145, 155)),
        outlet_pressure_bar: round1(randRange(140, 150)),
        flow_rate_lpm: round1(randRange(8, 14)),
        fluid_temp_c: round1(randRange(35, 45)),
        test_duration_s: 0,
        part_serial: null,
      };
    case "mark":
      return { parts_marked_shift: Math.floor(randRange(20, 60)) };
    case "ship":
      return { parts_dispatched_shift: Math.floor(randRange(15, 50)) };
    default:
      return {};
  }
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function stepTelemetry(kind, telemetry, status) {
  const running = status === "running";
  switch (kind) {
    case "printer": {
      const chamber_temp_c = running
        ? clamp(telemetry.chamber_temp_c + randRange(-1.5, 1.5), 190, 225)
        : clamp(telemetry.chamber_temp_c + randRange(-3, -0.5), 20, 225);
      let build_progress_pct = telemetry.build_progress_pct;
      let material_remaining_pct = telemetry.material_remaining_pct;
      let job_id = telemetry.job_id;
      if (running) {
        build_progress_pct += randRange(0.5, 2.5);
        material_remaining_pct = clamp(material_remaining_pct - randRange(0.05, 0.2), 0, 100);
        if (build_progress_pct >= 100) {
          build_progress_pct = 0;
          job_id = `J-${String(Math.floor(randRange(1000, 9999)))}`;
        }
      }
      return {
        chamber_temp_c: round1(chamber_temp_c),
        build_progress_pct: Math.round(clamp(build_progress_pct, 0, 100)),
        material_remaining_pct: round1(material_remaining_pct),
        job_id,
      };
    }
    case "lathe": {
      const spindle_rpm = running
        ? Math.round(clamp(telemetry.spindle_rpm + randRange(-40, 40), 1000, 2000))
        : 0;
      const coolant_temp_c = running
        ? round1(clamp(telemetry.coolant_temp_c + randRange(-0.8, 0.8), 25, 45))
        : round1(clamp(telemetry.coolant_temp_c + randRange(-1, -0.2), 20, 45));
      return { spindle_rpm, coolant_temp_c };
    }
    case "hone":
      return {};
    case "test": {
      let { test_running, test_result, test_duration_s, part_serial } = telemetry;
      const inlet_pressure_bar = round1(clamp(telemetry.inlet_pressure_bar + randRange(-1, 1), 120, 170));
      const outlet_pressure_bar = round1(clamp(telemetry.outlet_pressure_bar + randRange(-1, 1), 115, 165));
      const flow_rate_lpm = round1(clamp(telemetry.flow_rate_lpm + randRange(-0.5, 0.5), 4, 18));
      const fluid_temp_c = round1(clamp(telemetry.fluid_temp_c + randRange(-0.5, 0.5), 25, 55));

      if (running) {
        if (!test_running && Math.random() < 0.2) {
          test_running = true;
          test_duration_s = 0;
          test_result = null;
          part_serial = nextSerial();
        } else if (test_running) {
          test_duration_s += Math.round(TICK_MS / 1000);
          if (test_duration_s >= 18) {
            test_running = false;
            test_result = Math.random() < 0.92 ? "pass" : "fail";
          }
        }
      } else {
        test_running = false;
      }

      return {
        test_running,
        test_result,
        inlet_pressure_bar,
        outlet_pressure_bar,
        flow_rate_lpm,
        fluid_temp_c,
        test_duration_s,
        part_serial,
      };
    }
    case "mark": {
      const parts_marked_shift =
        running && Math.random() < 0.3 ? telemetry.parts_marked_shift + 1 : telemetry.parts_marked_shift;
      return { parts_marked_shift };
    }
    case "ship": {
      const parts_dispatched_shift =
        running && Math.random() < 0.25 ? telemetry.parts_dispatched_shift + 1 : telemetry.parts_dispatched_shift;
      return { parts_dispatched_shift };
    }
    default:
      return telemetry;
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// --- Parts flow (lightweight, per-station queue -> processed) ----------

function initParts() {
  const queued = Array.from({ length: Math.floor(randRange(2, 5)) }, () => nextSerial());
  const processed = Array.from({ length: Math.floor(randRange(3, 10)) }, () => nextSerial());
  return { queued, processed };
}

function stepParts(parts, status) {
  const queued = [...parts.queued];
  const processed = [...parts.processed];
  if (status === "running" && Math.random() < 0.35) {
    if (queued.length === 0) queued.push(nextSerial());
    const serial = queued.shift();
    processed.push(serial);
    if (processed.length > 200) processed.shift();
  }
  if (queued.length < 2 && Math.random() < 0.4) {
    queued.push(nextSerial());
  }
  return { queued, processed };
}

// --- Status history (interval log, one per station) --------------------
// Each entry: { status, from: epochMs, to: epochMs|null }. `to: null` means
// the interval is still ongoing (i.e. it's the station's current status).

function seedHistory(initialStatus) {
  const now = Date.now();
  const windowStart = now - HISTORY_SEED_HOURS * 60 * 60 * 1000;
  const intervals = [];

  // Walk backwards from "now" so the seeded history ends in the station's
  // actual current status, then fill earlier intervals with random walks.
  let cursorEnd = now;
  let status = initialStatus;
  while (cursorEnd > windowStart) {
    const durationMs = randRange(30, 150) * 60 * 1000; // 30min-2.5h per interval
    const from = Math.max(windowStart, cursorEnd - durationMs);
    intervals.unshift({ status, from, to: cursorEnd === now && intervals.length === 0 ? null : cursorEnd });
    cursorEnd = from;
    status = pickWeightedStatus(status);
  }

  // The most recent (last-pushed via unshift = first in array reversed)
  // interval should have `to: null`. Rebuild cleanly to guarantee that.
  intervals.sort((a, b) => a.from - b.from);
  intervals[intervals.length - 1].to = null;
  return intervals;
}

function closeCurrentInterval(history, at) {
  const current = history[history.length - 1];
  current.to = at;
}

function statusAt(history, timestamp) {
  for (let i = history.length - 1; i >= 0; i--) {
    const interval = history[i];
    if (timestamp >= interval.from && (interval.to === null || timestamp < interval.to)) {
      return interval.status;
    }
    if (timestamp >= interval.from) {
      return interval.status;
    }
  }
  return history[0]?.status ?? "idle";
}

// --- Station factory + store --------------------------------------------

function createStation(def) {
  const status = pickInitialStatus();
  const now = Date.now();
  return {
    id: def.id,
    name: def.name,
    stage: def.stage,
    type: def.type,
    kind: def.kind,
    status,
    statusSince: now,
    telemetry: initTelemetry(def.kind),
    parts: initParts(),
    history: seedHistory(status),
  };
}

const stations = STATION_DEFS.map(createStation);

// --- Shift boundary ------------------------------------------------------
// parts_marked_shift / parts_dispatched_shift only ever increment (see
// stepTelemetry), so a server left running past local midnight would show
// a "today" counter that's really "since last restart" and drifts further
// past DAILY_THROUGHPUT_TARGET the longer the process stays up. Reset them
// at the local-midnight boundary so "shift" stays meaningful regardless of
// server uptime.
let currentShiftDay = new Date().toDateString();

function resetShiftCounters(station) {
  if (station.kind === "mark") station.telemetry.parts_marked_shift = 0;
  if (station.kind === "ship") station.telemetry.parts_dispatched_shift = 0;
}

function tick() {
  const now = Date.now();
  const today = new Date(now).toDateString();
  if (today !== currentShiftDay) {
    currentShiftDay = today;
    for (const station of stations) resetShiftCounters(station);
  }
  for (const station of stations) {
    // Small chance of a status transition each tick — tuned so live
    // transitions average roughly one every ~30min per station, matching
    // seedHistory's interval-duration range instead of flickering.
    if (Math.random() < 0.0015) {
      const newStatus = pickWeightedStatus(station.status);
      if (newStatus !== station.status) {
        closeCurrentInterval(station.history, now);
        station.history.push({ status: newStatus, from: now, to: null });
        station.status = newStatus;
        station.statusSince = now;
        // Keep history from growing unbounded on a long-running process.
        const windowStart = now - HISTORY_SEED_HOURS * 60 * 60 * 1000 - 60 * 60 * 1000;
        while (station.history.length > 1 && station.history[1].from < windowStart) {
          station.history.shift();
        }
      }
    }
    station.telemetry = stepTelemetry(station.kind, station.telemetry, station.status);
    station.parts = stepParts(station.parts, station.status);
  }
}

setInterval(tick, TICK_MS);

// --- Public accessors ----------------------------------------------------

function serializeStation(station) {
  const { kind: _kind, history: _history, ...rest } = station;
  return {
    ...rest,
    timeInStateSeconds: Math.floor((Date.now() - station.statusSince) / 1000),
    utilisationPct24h: utilisationPctForHistory(station.history, HISTORY_SEED_HOURS),
  };
}

function getStations() {
  return stations.map(serializeStation);
}

function getStation(id) {
  const station = stations.find((s) => s.id === id);
  return station ? serializeStation(station) : null;
}

function getStationHistory(id, hours) {
  const station = stations.find((s) => s.id === id);
  if (!station) return null;
  const now = Date.now();
  const windowStart = now - hours * 60 * 60 * 1000;
  return station.history
    .filter((interval) => (interval.to ?? now) > windowStart)
    .map((interval) => ({
      status: interval.status,
      startedAt: new Date(Math.max(interval.from, windowStart)).toISOString(),
      endedAt: interval.to ? new Date(interval.to).toISOString() : null,
    }));
}

// % of the window a station's history spent "running".
function utilisationPctForHistory(history, hours) {
  const now = Date.now();
  const windowStart = now - hours * 60 * 60 * 1000;
  const windowMs = now - windowStart;
  let runningMs = 0;
  for (const interval of history) {
    const from = Math.max(interval.from, windowStart);
    const to = interval.to ?? now;
    if (to <= from) continue;
    if (interval.status === "running") runningMs += to - from;
  }
  return windowMs > 0 ? round1((runningMs / windowMs) * 100) : 0;
}

function getStationUtilisationPct(id, hours) {
  const station = stations.find((s) => s.id === id);
  return station ? utilisationPctForHistory(station.history, hours) : null;
}

// Factory-wide utilisation series, sampled every 30 minutes across the
// requested window: counts of each status across all 6 stations, plus an
// overall utilisation % (running / total).
function getUtilisationSeries(hours) {
  const now = Date.now();
  const windowStart = now - hours * 60 * 60 * 1000;
  const stepMs = 30 * 60 * 1000;
  const samples = [];
  for (let t = windowStart; t <= now; t += stepMs) {
    const counts = { running: 0, idle: 0, maintenance: 0, faulted: 0 };
    for (const station of stations) {
      const status = statusAt(station.history, t);
      counts[status] = (counts[status] ?? 0) + 1;
    }
    samples.push({
      timestamp: new Date(t).toISOString(),
      running: counts.running,
      idle: counts.idle,
      maintenance: counts.maintenance,
      faulted: counts.faulted,
      utilisationPct: round1((counts.running / stations.length) * 100),
    });
  }
  return samples;
}

module.exports = {
  STATUSES,
  getStations,
  getStation,
  getStationHistory,
  getStationUtilisationPct,
  getUtilisationSeries,
};
