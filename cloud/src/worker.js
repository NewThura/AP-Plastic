/* AP Plastic cloud (Cloudflare Worker + D1).
   The apps send and fetch records here. Every request carries a key in the "X-AP-Key" header.
   The keys are Cloudflare secrets (MAIN_KEY, SALES_KEY, THURA_KEY), never in this project.
   THURA_KEY is the master key, held only by the owner's Thura's Code (through the AP link helper on his PC):
   it can do everything the main app can, and its changes are marked "thura".

   GET  /health                      -> {ok:true}                       (no key needed)
   GET  /records?since=<ISO time>    -> {now, records:[{col,id,data,deleted,updated_at,updated_by}]}
                                        records changed after "since" (all records when it is left out)
   POST /records  {records:[{col,id,data,deleted}]} -> {now, saved}
   GET  /months                      -> {months:[{month,count}]}        (the monthly copies kept)

   Sign-in for sales computers (no key needed; accounts are made in AP Main, kind "users"):
   GET  /login/salt?username=<name>  -> {salt}   the account's salt; for a name that does not exist, a made-up salt
                                                 that stays the same, so nobody can tell which names exist
   POST /login {username, hash, code, windowsName, ip, appVersion, lat, lng, acc}
                                     hash = PBKDF2-SHA256(password, salt as text, 150000, 32 bytes, hex), made on the PC;
                                     code = the computer's code, "pc" + 12 hex characters (anything else: 400).
                                     Wrong password / account off: 401. Right password and the computer is allowed in
                                     AP Main (appSettings/sales accepted): 200 {key} (the Sales key). Locked: 403 {locked}.
                                     When AP Main has set allowed places (appSettings/sales areas [{name,lat,lng,r}]):
                                     outside every place 403 {outside}; place not sent or acc > 1000 m 403 {noplace}.
                                     Not allowed yet: 403 {waiting}, no key, and computers/<code> is written (waiting:true)
                                     so AP Main shows it. Too many wrong tries (5 in 15 minutes per name, 30 per address):
                                     429 {error, wait (seconds)}.

   On the 1st of every month (cron) the cloud copies every record into "monthly" for the month that ended. */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-AP-Key",
  "Access-Control-Max-Age": "86400",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

// which app is asking: "main", "sales", "thura" (the master key), or null
function who(req, env) {
  const k = req.headers.get("X-AP-Key") || "";
  if (!k) return null;
  if (env.MAIN_KEY && k === env.MAIN_KEY) return "main";
  if (env.SALES_KEY && k === env.SALES_KEY) return "sales";
  if (env.THURA_KEY && k === env.THURA_KEY) return "thura";
  return null;
}

const MAX_BATCH = 50;   // the free plan allows 50 database queries per request
// commands, sign-in accounts and products/prices (the owner, 2026-11-23): main app (and the master key) only
const MAIN_ONLY = ["appSettings", "users", "productList"];
const TOP = ["main", "thura"];
const okName =(s) => typeof s === "string" && s.length > 0 && s.length <= 200;

async function saveRecords(req, env, app) {
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: "Not JSON" }, 400); }
  let recs = Array.isArray(body && body.records) ? body.records : null;
  if (!recs) return json({ error: "records missing" }, 400);
  if (recs.length > MAX_BATCH) return json({ error: "At most " + MAX_BATCH + " records at a time" }, 400);
  for (const r of recs) if (!r || !okName(r.col) || !okName(r.id)) return json({ error: "Each record needs col and id" }, 400);
  // main-only kinds sent with another key are left out; the rest of the batch is still saved,
  // so an old Sales app that sends a product change together with receipts loses no receipts
  const refused = TOP.includes(app) ? [] : recs.filter((r) => MAIN_ONLY.includes(r.col));
  if (refused.length && refused.length === recs.length) return json({ error: "Only the main app can change " + MAIN_ONLY.join(", ") }, 403);
  if (refused.length) recs = recs.filter((r) => !MAIN_ONLY.includes(r.col));
  const now = new Date().toISOString();
  const st = env.DB.prepare(
    `INSERT INTO records (col,id,data,deleted,updated_at,updated_by) VALUES (?,?,?,?,?,?)
     ON CONFLICT(col,id) DO UPDATE SET data=excluded.data, deleted=excluded.deleted,
       updated_at=excluded.updated_at, updated_by=excluded.updated_by`);
  if (recs.length)
    await env.DB.batch(recs.map((r) => st.bind(r.col, r.id, JSON.stringify(r.data ?? {}), r.deleted ? 1 : 0, now, app)));
  return json(refused.length ? { now, saved: recs.length, refused: refused.map((r) => r.col + "/" + r.id) } : { now, saved: recs.length });
}

async function getRecords(url, env) {
  const since = url.searchParams.get("since");
  const now = new Date().toISOString();
  const q = since
    ? env.DB.prepare("SELECT * FROM records WHERE updated_at > ? ORDER BY updated_at").bind(since)
    : env.DB.prepare("SELECT * FROM records ORDER BY updated_at");
  const { results } = await q.all();
  return json({
    now,
    records: results.map((r) => ({ col: r.col, id: r.id, data: JSON.parse(r.data), deleted: !!r.deleted, updated_at: r.updated_at, updated_by: r.updated_by })),
  });
}

/* ---------- sign-in ---------- */
const TRIES = 5, IP_TRIES = 30, WINDOW = 15 * 60;   // wrong tries allowed per name / per address, in seconds
const okCode = (c) => /^pc[0-9a-f]{12}$/.test(String(c || ""));
const showCode = (c) => c.slice(2).toUpperCase().match(/.{4}/g).join("-");   // pc3f9a1c2b7d10 -> 3F9A-1C2B-7D10
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const cleanName = (s) => String(s || "").trim().toLowerCase().slice(0, 60);
async function findUser(env, name) {
  const r = await env.DB.prepare(
    "SELECT data FROM records WHERE col='users' AND deleted=0 AND json_extract(data,'$.username')=? LIMIT 1").bind(name).first();
  return r ? JSON.parse(r.data) : null;
}
async function fakeSalt(env, name) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.LOGIN_SECRET || env.SALES_KEY || "x"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("salt:" + name))).slice(0, 32);
}
function sameText(a, b) {   // compares in the same time whatever the text, so timing tells nothing
  a = String(a || ""); b = String(b || "");
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
async function blockedFor(env, keys, now) {   // seconds to wait, 0 = may try
  let wait = 0;
  for (const k of keys) {
    const r = await env.DB.prepare("SELECT n, since FROM login_tries WHERE k=?").bind(k).first();
    if (r && now - r.since < WINDOW && r.n >= (k.startsWith("ip:") ? IP_TRIES : TRIES)) wait = Math.max(wait, WINDOW - (now - r.since));
  }
  return wait;
}
async function countFail(env, keys, now) {
  const st = env.DB.prepare(
    `INSERT INTO login_tries (k,n,since) VALUES (?,1,?)
     ON CONFLICT(k) DO UPDATE SET n = CASE WHEN ? - since >= ${WINDOW} THEN 1 ELSE n + 1 END,
                                  since = CASE WHEN ? - since >= ${WINDOW} THEN ? ELSE since END`);
  await env.DB.batch(keys.map((k) => st.bind(k, now, now, now, now)));
}
/* Allowed places, the same rule as the Sales app: inside when, for some area, the distance to (lat, lng)
   <= r + min(acc, 100) metres. No areas: no check ("off"). No place sent, or acc > 1000 m: "noplace". */
function metres(a, b, c, d) {
  const R = 6371000, rad = (x) => (x * Math.PI) / 180, dl = rad(c - a), dn = rad(d - b);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function placeCheck(areas, b) {
  const list = (Array.isArray(areas) ? areas : []).filter((x) => x && isFinite(+x.lat) && isFinite(+x.lng) && +x.r > 0);
  const n = (v) => (v === "" || v == null ? NaN : Number(v));
  const lat = n(b.lat), lng = n(b.lng), acc = n(b.acc);
  const found = isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const place = found ? { lat, lng, acc: isFinite(acc) ? acc : null, at: Date.now() } : null;
  if (!list.length) return { ok: true, state: "off", area: "", place };
  if (!found || !isFinite(acc) || acc > 1000) return { ok: false, state: "noplace", area: "", place };
  const hit = list.find((x) => metres(lat, lng, +x.lat, +x.lng) <= +x.r + Math.min(Math.max(acc, 0), 100));
  return hit ? { ok: true, state: "in", area: String(hit.name || ""), place } : { ok: false, state: "out", area: "", place };
}
async function loginSalt(url, env) {
  const name = cleanName(url.searchParams.get("username"));
  if (!name) return json({ error: "username missing" }, 400);
  const u = await findUser(env, name);
  return json({ salt: u && u.salt ? u.salt : await fakeSalt(env, name) });
}
async function login(req, env) {
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: "Not JSON" }, 400); }
  const name = cleanName(b && b.username), hash = String((b && b.hash) || "").toLowerCase();
  if (!name || !/^[0-9a-f]{64}$/.test(hash)) return json({ error: "username and hash needed" }, 400);
  const code = String(b.code || "");
  if (!okCode(code)) return json({ error: "code must be pc + 12 hex characters" }, 400);
  const now = Math.floor(Date.now() / 1000), ip = req.headers.get("CF-Connecting-IP") || "local";
  const keys = ["user:" + name, "ip:" + ip];
  const wait = await blockedFor(env, keys, now);
  if (wait) return json({ error: "Too many wrong tries", wait }, 429);
  const u = await findUser(env, name);
  if (u && u.active !== false && u.hash && sameText(u.hash.toLowerCase(), hash)) {
    await env.DB.prepare("DELETE FROM login_tries WHERE k=?").bind("user:" + name).run();
    // the computer must be allowed in AP Main (appSettings/sales accepted) and not locked
    const sr = await env.DB.prepare("SELECT data FROM records WHERE col='appSettings' AND id='sales' AND deleted=0").first();
    const st = sr ? JSON.parse(sr.data) : {};
    const cr = await env.DB.prepare("SELECT data FROM records WHERE col='computers' AND id=?").bind(code).first();
    const comp = cr ? JSON.parse(cr.data) : {};
    const locked = st.locked || [];
    if (locked.includes(code) || (comp.letter && locked.includes(comp.letter))) return json({ locked: true }, 403);
    // allowed places (appSettings/sales areas): checked only when AP Main has set at least one
    const pl = placeCheck(st.areas, b);
    const accepted = (st.accepted || []).includes(code);
    if (accepted && pl.ok) return json({ key: env.SALES_KEY });
    // not allowed yet, or outside the allowed places: note the computer for AP Main's Computers page, give no key
    const t = (s, n) => String(s || "").slice(0, n);
    const rec = Object.assign({}, comp, { code: showCode(code), windowsName: t(b.windowsName, 80) || comp.windowsName || "", ip: t(b.ip, 60) || comp.ip || "",
      publicIp: t(ip, 60), user: name, appVersion: t(b.appVersion, 40) || comp.appVersion || "", seenAt: Date.now(), waiting: !accepted,
      place: pl.place, placeState: pl.state, placeArea: pl.area });
    await env.DB.prepare(
      `INSERT INTO records (col,id,data,deleted,updated_at,updated_by) VALUES ('computers',?,?,0,?, 'login')
       ON CONFLICT(col,id) DO UPDATE SET data=excluded.data, deleted=0, updated_at=excluded.updated_at, updated_by='login'`)
      .bind(code, JSON.stringify(rec), new Date().toISOString()).run();
    if (!pl.ok) return json(pl.state === "out" ? { outside: true } : { noplace: true }, 403);
    return json({ waiting: true }, 403);
  }
  await countFail(env, keys, now);
  return json({ error: "Wrong username or password" }, 401);
}

// the month that just ended, e.g. run on 2026-12-01 -> "2026-11"
function lastMonth(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - 86400000);
  return x.toISOString().slice(0, 7);
}
async function monthlyCopy(env, month = lastMonth()) {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO monthly (month,col,id,data,deleted,updated_at,updated_by)
     SELECT ?,col,id,data,deleted,updated_at,updated_by FROM records`).bind(month).run();
  return month;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health") return json({ ok: true });
    try {
      if (url.pathname === "/login/salt" && req.method === "GET") return await loginSalt(url, env);
      if (url.pathname === "/login" && req.method === "POST") return await login(req, env);
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
    const app = who(req, env);
    if (!app) return json({ error: "Wrong or missing key" }, 401);
    try {
      if (url.pathname === "/records" && req.method === "GET") return await getRecords(url, env);
      if (url.pathname === "/records" && req.method === "POST") return await saveRecords(req, env, app);
      if (url.pathname === "/months" && req.method === "GET") {
        const { results } = await env.DB.prepare("SELECT month, COUNT(*) AS count FROM monthly GROUP BY month ORDER BY month").all();
        return json({ months: results });
      }
      return json({ error: "Not found" }, 404);
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(monthlyCopy(env));
  },
};
