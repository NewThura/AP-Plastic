/* AP Plastic cloud (Cloudflare Worker + D1).
   The apps send and fetch records here. Every request carries a key in the "X-AP-Key" header.
   The keys are Cloudflare secrets (MAIN_KEY, SALES_KEY), never in this project.

   GET  /health                      -> {ok:true}                       (no key needed)
   GET  /records?since=<ISO time>    -> {now, records:[{col,id,data,deleted,updated_at,updated_by}]}
                                        records changed after "since" (all records when it is left out)
   POST /records  {records:[{col,id,data,deleted}]} -> {now, saved}
   GET  /months                      -> {months:[{month,count}]}        (the monthly copies kept)

   On the 1st of every month (cron) the cloud copies every record into "monthly" for the month that ended. */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-AP-Key",
  "Access-Control-Max-Age": "86400",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

// which app is asking: "main", "sales", or null
function who(req, env) {
  const k = req.headers.get("X-AP-Key") || "";
  if (!k) return null;
  if (env.MAIN_KEY && k === env.MAIN_KEY) return "main";
  if (env.SALES_KEY && k === env.SALES_KEY) return "sales";
  return null;
}

const MAX_BATCH = 50;   // the free plan allows 50 database queries per request
const okName = (s) => typeof s === "string" && s.length > 0 && s.length <= 200;

async function saveRecords(req, env, app) {
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: "Not JSON" }, 400); }
  const recs = Array.isArray(body && body.records) ? body.records : null;
  if (!recs) return json({ error: "records missing" }, 400);
  if (recs.length > MAX_BATCH) return json({ error: "At most " + MAX_BATCH + " records at a time" }, 400);
  for (const r of recs) if (!r || !okName(r.col) || !okName(r.id)) return json({ error: "Each record needs col and id" }, 400);
  const now = new Date().toISOString();
  const st = env.DB.prepare(
    `INSERT INTO records (col,id,data,deleted,updated_at,updated_by) VALUES (?,?,?,?,?,?)
     ON CONFLICT(col,id) DO UPDATE SET data=excluded.data, deleted=excluded.deleted,
       updated_at=excluded.updated_at, updated_by=excluded.updated_by`);
  if (recs.length)
    await env.DB.batch(recs.map((r) => st.bind(r.col, r.id, JSON.stringify(r.data ?? {}), r.deleted ? 1 : 0, now, app)));
  return json({ now, saved: recs.length });
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
