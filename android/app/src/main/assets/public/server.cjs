var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var DATA_FILE = import_path.default.join(process.cwd(), "cloud_store.json");
var cloudState = {
  messages: [],
  calls: [],
  attendance: [],
  productSales: [],
  agents: [],
  teams: [],
  users: [],
  meetings: [],
  leaves: [],
  ezCash: [],
  verifications: [],
  smsLogs: [],
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
if (import_fs.default.existsSync(DATA_FILE)) {
  try {
    const raw = import_fs.default.readFileSync(DATA_FILE, "utf-8");
    cloudState = { ...cloudState, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to load cloud_store.json:", err);
  }
}
var saveCloudState = () => {
  try {
    cloudState.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(cloudState, null, 2));
  } catch (err) {
    console.error("Failed to write cloud_store.json:", err);
  }
};
var sseClients = [];
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", updatedAt: cloudState.updatedAt })}

`);
  sseClients.push(res);
  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});
var broadcastToAllClients = (eventPayload) => {
  const payloadStr = `data: ${JSON.stringify(eventPayload)}

`;
  sseClients.forEach((client) => {
    try {
      client.write(payloadStr);
    } catch (e) {
    }
  });
};
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    connectedClients: sseClients.length,
    updatedAt: cloudState.updatedAt,
    system: "DD WORLD Enterprise Cloud Interconnect Engine (4G/5G Live)"
  });
});
app.get("/download", (req, res) => {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  if (isAndroid) {
    res.send(`<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DD World Enterprise - Android APK Download</title>
  <style>
    body { background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: #0f172a; border: 1px solid #059669; border-radius: 24px; padding: 32px 24px; max-width: 440px; width: 100%; box-shadow: 0 25px 50px -12px rgba(5,150,105,0.25); }
    .badge { display: inline-block; background: rgba(5,150,105,0.2); color: #34d399; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 20px; margin: 0 0 8px; color: #fff; font-weight: 800; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: block; background: #059669; color: #fff; text-decoration: none; font-weight: 700; padding: 14px 20px; border-radius: 14px; font-size: 15px; margin-bottom: 12px; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(5,150,105,0.4); }
    .btn:active { transform: scale(0.98); }
    .btn-sec { display: block; background: #1e293b; color: #cbd5e1; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 14px; font-size: 13px; }
    .note { margin-top: 20px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">\u{1F916} Android Auto-Detected</div>
    <h1>DD WORLD ENTERPRISE APK</h1>
    <p>\u0DB1\u0DC0\u0DAD\u0DB8 DD World Enterprise Suite (v5.3 Production Release) Android APK \u0D9C\u0DDC\u0DB1\u0DD4\u0DC0 \u0D94\u0DB6\u0D9C\u0DDA \u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1\u0DBA\u0DA7 \u0DC3\u0DCA\u0DAE\u0DCF\u0DB4\u0DB1\u0DBA \u0D9A\u0DBB\u0D9C\u0DB1\u0DCA\u0DB1.</p>
    <a href="/?app=ready" class="btn" id="openBtn">Open DD World Workspace</a>
    <a href="/manifest.json" download="ddworld-app.json" class="btn-sec">Download App Manifest</a>
    <div class="note">\u2705 Live Background GPS \u2022 \u{1F6E1}\uFE0F Anti-Cheat Shield \u2022 \u{1F510} Biometrics FaceID</div>
  </div>
</body>
</html>`);
    return;
  }
  if (isIOS) {
    res.send(`<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DD World Enterprise - iOS Installation</title>
  <style>
    body { background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: #0f172a; border: 1px solid #4f46e5; border-radius: 24px; padding: 32px 24px; max-width: 440px; width: 100%; box-shadow: 0 25px 50px -12px rgba(79,70,229,0.25); }
    .badge { display: inline-block; background: rgba(79,70,229,0.2); color: #818cf8; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 20px; margin: 0 0 8px; color: #fff; font-weight: 800; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: block; background: #4f46e5; color: #fff; text-decoration: none; font-weight: 700; padding: 14px 20px; border-radius: 14px; font-size: 15px; margin-bottom: 12px; box-shadow: 0 10px 15px -3px rgba(79,70,229,0.4); }
    .step { background: #1e293b; padding: 12px; border-radius: 12px; text-align: left; font-size: 12px; margin-bottom: 8px; color: #cbd5e1; }
    .step b { color: #818cf8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">\u{1F34F} Apple iOS Detected</div>
    <h1>DD WORLD ENTERPRISE FOR iOS</h1>
    <p>Apple iOS \u0DC3\u0DB3\u0DC4\u0DCF PWA & TestFlight Secure Container \u0DC3\u0DC4\u0DCF\u0DBA \u0DC3\u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DBA\u0DD2.</p>
    <div class="step">1. \u0DB4\u0DC4\u0DC5 \u0D87\u0DAD\u0DD2 <b>Open App Workspace</b> \u0D94\u0DB6\u0DB1\u0DCA\u0DB1.</div>
    <div class="step">2. Safari \u0DB6\u0DCA\u200D\u0DBB\u0DC0\u0DD4\u0DC3\u0DBB\u0DBA\u0DDA <b>Share (\u{1F4E4})</b> \u0D85\u0DBA\u0DD2\u0D9A\u0DB1\u0DBA \u0DAD\u0DDD\u0DBB\u0DB1\u0DCA\u0DB1.</div>
    <div class="step">3. <b>'Add to Home Screen' (+)</b> \u0DAD\u0DDD\u0DBB\u0DCF \u0DC3\u0DCA\u0DAE\u0DCF\u0DB4\u0DB1\u0DBA \u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.</div>
    <a href="/?app=ready" class="btn" style="margin-top:16px;">Open App Workspace</a>
  </div>
</body>
</html>`);
    return;
  }
  res.redirect("/?app=ready");
});
app.get("/api/sync/state", (req, res) => {
  res.json(cloudState);
});
app.post("/api/sync/broadcast", (req, res) => {
  const { type, data } = req.body || {};
  if (!type) {
    return res.status(400).json({ error: "Missing type parameter" });
  }
  if (type === "NEW_MESSAGE" && data) {
    if (!cloudState.messages.some((m) => m.id === data.id)) {
      cloudState.messages.unshift(data);
    }
  } else if (type === "ADD_ATTENDANCE" && data) {
    const existingIdx = cloudState.attendance.findIndex((a) => a.id === data.id);
    if (existingIdx >= 0) {
      cloudState.attendance[existingIdx] = { ...cloudState.attendance[existingIdx], ...data };
    } else {
      cloudState.attendance.unshift(data);
    }
  } else if (type === "ADD_SALE" && data) {
    if (!cloudState.productSales.some((s) => s.id === data.id)) {
      cloudState.productSales.unshift(data);
    }
  } else if (type === "UPDATE_USER_GPS" && data) {
    const targetId = data.id || data.userId;
    if (targetId) {
      const uIdx = cloudState.users.findIndex((u) => u.id === targetId);
      if (uIdx >= 0) {
        cloudState.users[uIdx] = { ...cloudState.users[uIdx], ...data };
      } else {
        cloudState.users.push(data);
      }
    }
  } else if (type === "CREATE_MEETING" && data) {
    if (!cloudState.meetings.some((m) => m.id === data.id)) {
      cloudState.meetings.unshift(data);
    }
  } else if (type === "CANCEL_MEETING" && data) {
    const mId = typeof data === "string" ? data : data.id;
    cloudState.meetings = cloudState.meetings.filter((m) => m.id !== mId);
  } else if (type === "SUBMIT_LEAVE" && data) {
    if (!cloudState.leaves.some((l) => l.id === data.id)) {
      cloudState.leaves.unshift(data);
    }
  } else if (type === "UPDATE_LEAVE" && data) {
    const lIdx = cloudState.leaves.findIndex((l) => l.id === data.id);
    if (lIdx >= 0) {
      cloudState.leaves[lIdx] = { ...cloudState.leaves[lIdx], ...data };
    }
  } else if (type === "ADD_EZCASH" && data) {
    if (!cloudState.ezCash.some((e) => e.id === data.id)) {
      cloudState.ezCash.unshift(data);
    }
  } else if (type === "ADD_AGENT" && data) {
    const uIdx = cloudState.users.findIndex((u) => u.id === data.id);
    if (uIdx >= 0) {
      cloudState.users[uIdx] = { ...cloudState.users[uIdx], ...data };
    } else {
      cloudState.users.push(data);
    }
  } else if (type === "ADD_VERIFICATION" && data) {
    const vIdx = cloudState.verifications.findIndex((v) => v.id === data.id || v.userId === data.userId);
    if (vIdx >= 0) {
      cloudState.verifications[vIdx] = { ...cloudState.verifications[vIdx], ...data };
    } else {
      cloudState.verifications.unshift(data);
    }
  } else if (type === "ADD_SMS_LOG" && data) {
    if (!cloudState.smsLogs.some((s) => s.id === data.id)) {
      cloudState.smsLogs.unshift(data);
    }
  } else if (type === "START_CALL" && data) {
    cloudState.calls.unshift(data);
  } else if (type === "SYNC_USERS_LIST" && Array.isArray(data)) {
    cloudState.users = data;
  }
  saveCloudState();
  broadcastToAllClients({ type, data });
  res.json({ success: true, broadcastedTo: sseClients.length });
});
app.post("/api/native-gps-sync", (req, res) => {
  const record = req.body || {};
  const { employeeId, agentCode, latitude, longitude, accuracy, timestamp, batteryLevel, networkStatus, gpsStatus, source } = record;
  if (!employeeId || latitude === void 0 || longitude === void 0) {
    return res.status(400).json({ error: "Missing required GPS fields" });
  }
  const uIdx = cloudState.users.findIndex(
    (u) => u.employeeId === employeeId || u.agentCode === agentCode || u.id === employeeId
  );
  const updatedGpsData = {
    lastGpsUpdate: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
    latitude,
    longitude,
    accuracy: accuracy || 10,
    batteryLevel: batteryLevel || 100,
    networkStatus: networkStatus || "ONLINE",
    gpsStatus: gpsStatus || "ACTIVE_HIGH_ACCURACY",
    trackingSource: source || "NATIVE_ANDROID_GPS",
    status: "active"
  };
  if (uIdx >= 0) {
    cloudState.users[uIdx] = { ...cloudState.users[uIdx], ...updatedGpsData };
  }
  saveCloudState();
  broadcastToAllClients({
    type: "UPDATE_USER_GPS",
    data: {
      id: uIdx >= 0 ? cloudState.users[uIdx].id : employeeId,
      employeeId,
      agentCode,
      ...updatedGpsData
    }
  });
  res.json({ success: true, receivedTimestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/native-gps-batch-sync", (req, res) => {
  const records = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "Array of records expected" });
  }
  records.forEach((rec) => {
    const { employeeId, agentCode, latitude, longitude, accuracy, timestamp, batteryLevel, source } = rec;
    const uIdx = cloudState.users.findIndex(
      (u) => u.employeeId === employeeId || u.agentCode === agentCode || u.id === employeeId
    );
    if (uIdx >= 0) {
      cloudState.users[uIdx] = {
        ...cloudState.users[uIdx],
        lastGpsUpdate: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        latitude,
        longitude,
        accuracy: accuracy || 10,
        batteryLevel: batteryLevel || 100,
        trackingSource: source || "NATIVE_ANDROID_GPS"
      };
    }
  });
  saveCloudState();
  broadcastToAllClients({
    type: "BATCH_GPS_UPDATE",
    data: { count: records.length, latestRecord: records[records.length - 1] }
  });
  res.json({ success: true, processedCount: records.length });
});
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    res.json({
      reply: `[DD WORLD AI Cloud System Response]: ${prompt ? `\u0DC3\u0DCA\u0DC0\u0DBA\u0D82\u0D9A\u0DCA\u200D\u0DBB\u0DD3\u0DBA\u0DC0 \u0DC0\u0DD2\u0DC1\u0DCA\u0DBD\u0DDA\u0DC2\u0DAB\u0DBA \u0D9A\u0DBB\u0DB1 \u0DBD\u0DAF\u0DD3: "${prompt}". \u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2\u0DBA\u0DDA \u0DC3\u0DA2\u0DD3\u0DC0\u0DD3 \u0DAF\u0DAD\u0DCA\u0DAD 250km \u0DC3\u0DB1\u0DCA\u0DB1\u0DD2\u0DC0\u0DDA\u0DAF\u0DB1 \u0DB8\u0DCF\u0DBB\u0DCA\u0D9C\u0DBA \u0DC4\u0DBB\u0DC4\u0DCF Cloud Sync \u0DC0\u0DD3 \u0D87\u0DAD.` : "DD WORLD AI \u0DC3\u0DA2\u0DD3\u0DC0\u0DD3\u0DC0 \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DAD\u0DCA\u0DB8\u0D9A\u0DBA\u0DD2."}`
    });
  } catch (err) {
    res.status(500).json({ error: "AI processing error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DD WORLD Enterprise Cloud Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
