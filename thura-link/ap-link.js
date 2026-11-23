'use strict';
/* AP link: lets the owner's Thura's Code see and control AP Main, following the Thura App Link standard
   (E:\Thura's APP\Modules\installed\thura-applink\files\THURA-APP-LINK-SPEC.md).

   It runs on the owner's PC only (https://127.0.0.1:47840), with its own certificate. Thura signs every request;
   this helper checks it and signs every answer (Thura's own SDK does that part, loaded from Thura's folder).
   The helper talks to the AP cloud with the master key ("Thura key"), so whatever it changes shows in AP Main
   and in the Sales app, marked "thura".

   Nothing private is kept in this project. The certificate, the link code and the Thura key live in
   %LOCALAPPDATA%\AP Main\thura-link\ on the owner's PC.

     node ap-link.js setup     make the certificate, the link code and the Thura key; write the link file for Thura
     node ap-link.js           run (Windows starts it by itself after "Install AP link.bat")

   Options (for testing): --thura <Thura folder>  --state <folder>  --cloud <address>  --port <n>  --out <link file>
   Reading actions are "low" risk. Every action that changes something is "high": Thura asks the owner each time. */
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const VERSION = '1.0';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const THURA = arg('thura', "E:\\Thura's APP");
const STATE = arg('state', path.join(process.env.LOCALAPPDATA || '.', 'AP Main', 'thura-link'));
const PORT = Number(arg('port', 47840));
const SDK = path.join(THURA, 'Modules', 'installed', 'thura-applink', 'files', 'sdk', 'node', 'thura-link-server.js');
const stateFile = path.join(STATE, 'state.json');
const readState = () => JSON.parse(fs.readFileSync(stateFile, 'utf8'));
const writeState = (s) => { fs.mkdirSync(STATE, { recursive: true }); const t = stateFile + '.tmp'; fs.writeFileSync(t, JSON.stringify(s, null, 2), { mode: 0o600 }); fs.renameSync(t, stateFile); };
const log = (...a) => { try { fs.appendFileSync(path.join(STATE, 'ap-link.log'), new Date().toISOString() + ' ' + a.join(' ') + '\n'); } catch (e) {} };

if (!fs.existsSync(SDK)) { console.error('Thura App Link is not installed in ' + THURA + ' (looked for ' + SDK + ')'); process.exit(1); }
const { ThuraLink, writeLinkFile, newCode } = require(SDK);

/* ---------- setup ---------- */
function findOpenssl() {
  const c = ['openssl', 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe', 'C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe'];
  for (const x of c) { try { execFileSync(x, ['version'], { stdio: 'ignore' }); return x; } catch (e) {} }
  throw new Error('openssl not found (it comes with Git for Windows)');
}
function setup() {
  fs.mkdirSync(STATE, { recursive: true });
  const cert = path.join(STATE, 'cert.pem'), key = path.join(STATE, 'key.pem');
  if (!fs.existsSync(cert) || !fs.existsSync(key)) {
    const cfg = path.join(STATE, 'cert.cnf');
    fs.writeFileSync(cfg, '[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=AP Main\n[ext]\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n');
    execFileSync(findOpenssl(), ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '3650', '-keyout', key, '-out', cert, '-config', cfg], { stdio: 'ignore' });
    fs.unlinkSync(cfg);
  }
  let old = {}; try { old = readState(); } catch (e) {}
  const st = {
    code: newCode(),                                              // new link code each time the owner connects
    linkId: 'thura-' + crypto.randomBytes(4).toString('hex'),
    thuraKey: old.thuraKey || crypto.randomBytes(32).toString('base64url'),   // the master key for the cloud: kept
    cloud: arg('cloud', old.cloud || 'https://ap-plastic-cloud.applastic.workers.dev'),
    port: PORT,
  };
  writeState(st);
  const { file } = writeLinkFile({ app: 'ap', name: 'AP Main', id: st.linkId, addresses: ['https://127.0.0.1:' + PORT],
    certPem: fs.readFileSync(cert), scopes: ['*'], code: st.code, thuraRoot: arg('out') ? undefined : THURA, outFile: arg('out') });
  console.log('Link file written: ' + file);
  console.log('Private files: ' + STATE);
  if (!process.argv.includes('--no-startup')) {   // start hidden when Windows starts
    const dir = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const q = (s) => '""' + s + '""';
    fs.writeFileSync(path.join(dir, 'AP link.vbs'), `CreateObject("WScript.Shell").Run "${q(process.execPath)} ${q(path.resolve(__filename))}", 0, False\r\n`);
    console.log('Starts by itself with Windows: ' + path.join(dir, 'AP link.vbs'));
  }
}

/* ---------- the AP cloud ---------- */
let S, cache = { at: 0, recs: null };
async function cloud(p, opt = {}) {
  const r = await fetch(S.cloud + p, { ...opt, headers: { 'Content-Type': 'application/json', 'X-AP-Key': S.thuraKey, ...(opt.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw { status: r.status === 401 ? 503 : 502, code: 'CLOUD', en: 'The AP cloud said no: ' + (j.error || r.status) + (r.status === 401 ? '. The Thura key is not set in the cloud yet.' : '') };
  return j;
}
async function records(fresh) {   // every record, by kind: {col: {id: data}}; kept 15 seconds
  if (!fresh && cache.recs && Date.now() - cache.at < 15000) return cache.recs;
  const j = await cloud('/records'), o = {};
  for (const r of j.records || []) { if (r.deleted) continue; (o[r.col] = o[r.col] || {})[r.id] = r.data; }
  cache = { at: Date.now(), recs: o };
  return o;
}
async function put(recs) { await cloud('/records', { method: 'POST', body: JSON.stringify({ records: recs }) }); cache.recs = null; }
const all = (R, c) => Object.entries(R[c] || {}).map(([id, d]) => ({ id, ...d }));
const num = (v) => { const n = Number(String(v ?? '').replace(/,/g, '')); return isFinite(n) ? n : 0; };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const noSecrets = (d) => { const { hash, salt, ...x } = d || {}; return x; };
const fail = (en, status = 400, code = 'BAD_BODY') => { throw { status, code, en }; };

/* sales from both apps, the same way AP Main counts them */
function salesOf(R) {
  const main = all(R, 'sales').map((s) => ({ date: s.date || '', cust: s.cust || '', total: (s.lines || []).reduce((a, l) => a + num(l.qty) * num(l.price), 0) + num(s.delivery), paid: num(s.paid), from: 'main' }));
  const shop = all(R, 'receipts').map((r) => ({ date: r.date || '', cust: r.customerId || '', total: num(r.total), paid: num(r.paid), from: 'sales app', no: r.no }));
  return main.concat(shop);
}
function balances(R) {
  const b = {};
  for (const s of salesOf(R)) if (s.cust) b[s.cust] = (b[s.cust] || 0) + s.total - s.paid;
  for (const p of all(R, 'payments')) if (p.cust) b[p.cust] = (b[p.cust] || 0) - num(p.amount);
  for (const p of all(R, 'receiptPayments').concat(all(R, 'receiptReturns'))) if (p.customerId) b[p.customerId] = (b[p.customerId] || 0) - num(p.amount);
  return b;
}
const salesSet = (R) => (R.appSettings || {}).sales || {};
function compState(R, c) {
  const st = salesSet(R), L = c.letter || '';
  if ((st.locked || []).includes(c.id) || (L && (st.locked || []).includes(L))) return 'locked';
  return (st.accepted || []).includes(c.id) ? 'accepted' : 'waiting';
}
function compId(R, code) {   // "00AA-11BB-22CC", "pc00aa11bb22cc" or a letter like "B"
  const s = String(code || '').trim(), id = 'pc' + s.replace(/^pc/i, '').replace(/-/g, '').toLowerCase();
  if (R.computers && R.computers[id]) return id;
  const byLetter = all(R, 'computers').find((c) => c.letter && c.letter.toUpperCase() === s.toUpperCase());
  if (byLetter) return byLetter.id;
  fail('No computer with the code ' + s, 404, 'NOT_FOUND');
}
async function setSales(R, ch) { await put([{ col: 'appSettings', id: 'sales', data: { ...salesSet(R), ...ch } }]); }
const uniq = (a) => [...new Set(a)];
const SALES_TABS = ['receipts', 'pastReceipts', 'quotations', 'orders', 'customers', 'products'];

/* ---------- what Thura may do ---------- */
const obj = (props = {}, required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const CODE = { type: 'string', minLength: 1, maxLength: 20, description: 'the computer code (e.g. 3F9A-1C2B-7D10) or its letter' };
const DATE = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const ACTIONS = [
  { name: 'overview', description: 'Sales today and this month, money owed, and computers waiting', method: 'GET', path: '/api/overview', risk: 'low', inputSchema: obj() },
  { name: 'sales_by_day', description: 'Sales total for each day between two dates', method: 'GET', path: '/api/sales', risk: 'low', inputSchema: obj({ from: DATE, to: DATE }) },
  { name: 'debts', description: 'Customers who owe money, largest first', method: 'GET', path: '/api/debts', risk: 'low', inputSchema: obj() },
  { name: 'computers', description: 'Computers using the Sales app: waiting, accepted or locked', method: 'GET', path: '/api/computers', risk: 'low', inputSchema: obj() },
  { name: 'accounts', description: 'Sales app accounts (no passwords)', method: 'GET', path: '/api/accounts', risk: 'low', inputSchema: obj() },
  { name: 'read_records', description: 'Read records of one kind (for example production, customers, receipts)', method: 'GET', path: '/api/records', risk: 'low',
    inputSchema: obj({ col: { type: 'string', minLength: 1, maxLength: 60 }, limit: { type: 'string', pattern: '^\\d{1,4}$' } }, ['col']) },
  { name: 'accept_computer', description: 'Let a waiting computer use the Sales app', method: 'POST', path: '/api/computers/accept', risk: 'high', inputSchema: obj({ code: CODE }, ['code']) },
  { name: 'lock_computer', description: 'Stop a computer using the Sales app at once', method: 'POST', path: '/api/computers/lock', risk: 'high', inputSchema: obj({ code: CODE }, ['code']) },
  { name: 'unlock_computer', description: 'Let a locked computer use the Sales app again', method: 'POST', path: '/api/computers/unlock', risk: 'high', inputSchema: obj({ code: CODE }, ['code']) },
  { name: 'remove_computer', description: 'Take a computer off the accepted list (it must be accepted again)', method: 'POST', path: '/api/computers/remove', risk: 'high', inputSchema: obj({ code: CODE }, ['code']) },
  { name: 'set_account_active', description: 'Turn a Sales app account on or off', method: 'POST', path: '/api/accounts/active', risk: 'high',
    inputSchema: obj({ username: { type: 'string', minLength: 1, maxLength: 60 }, active: { type: 'boolean' } }, ['username', 'active']) },
  { name: 'set_sales_tabs', description: 'Choose which tabs the Sales app shows', method: 'POST', path: '/api/sales-tabs', risk: 'high',
    inputSchema: obj({ tabs: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', enum: SALES_TABS } } }, ['tabs']) },
  { name: 'save_record', description: 'Master key: write any record in AP (replaces it)', method: 'POST', path: '/api/records/save', risk: 'high',
    inputSchema: obj({ col: { type: 'string', minLength: 1, maxLength: 60 }, id: { type: 'string', minLength: 1, maxLength: 200 }, data: { type: 'object' } }, ['col', 'id', 'data']) },
  { name: 'delete_record', description: 'Master key: delete any record in AP', method: 'POST', path: '/api/records/delete', risk: 'high',
    inputSchema: obj({ col: { type: 'string', minLength: 1, maxLength: 60 }, id: { type: 'string', minLength: 1, maxLength: 200 } }, ['col', 'id']) },
];

async function act(action, input) {
  const R = await records(action.risk === 'high');
  switch (action.name) {
    case 'overview': {
      const s = salesOf(R), d = today(), m = d.slice(0, 7), b = Object.values(balances(R)).filter((x) => x > 0.5);
      const sum = (a) => Math.round(a.reduce((x, y) => x + y.total, 0));
      const waiting = all(R, 'computers').filter((c) => compState(R, c) === 'waiting').length;
      const o = { salesToday: sum(s.filter((x) => x.date === d)), salesThisMonth: sum(s.filter((x) => x.date.startsWith(m))),
        customersOwing: b.length, totalOwed: Math.round(b.reduce((x, y) => x + y, 0)), computersWaiting: waiting, currency: 'MMK' };
      return { ...o, summary: `Sales today ${o.salesToday.toLocaleString()} MMK, this month ${o.salesThisMonth.toLocaleString()} MMK; ${o.customersOwing} customers owe ${o.totalOwed.toLocaleString()} MMK; ${waiting} computer(s) waiting.` };
    }
    case 'sales_by_day': {
      const to = input.to || today(), from = input.from || to.slice(0, 8) + '01', days = {};
      for (const x of salesOf(R)) if (x.date >= from && x.date <= to) days[x.date] = (days[x.date] || 0) + x.total;
      const list = Object.keys(days).sort().map((k) => ({ date: k, total: Math.round(days[k]) }));
      return { from, to, days: list, total: list.reduce((a, x) => a + x.total, 0), summary: `${list.length} days of sales from ${from} to ${to}` };
    }
    case 'debts': {
      const b = balances(R), list = Object.entries(b).filter(([, v]) => v > 0.5).sort((a, c) => c[1] - a[1])
        .map(([id, v]) => ({ customer: (R.customers && R.customers[id] && R.customers[id].name) || id, owed: Math.round(v) }));
      return { debts: list, summary: `${list.length} customers owe money` };
    }
    case 'computers': {
      const list = all(R, 'computers').map((c) => ({ code: c.code || c.id, letter: c.letter || '', windowsName: c.windowsName || '', user: c.user || '', state: compState(R, c), lastSeen: c.seenAt ? new Date(c.seenAt).toISOString() : '' }));
      return { computers: list, summary: `${list.length} computers, ${list.filter((c) => c.state === 'waiting').length} waiting` };
    }
    case 'accounts': {
      const list = all(R, 'users').map((u) => ({ name: u.name, username: u.username, role: u.role, active: u.active !== false }));
      return { accounts: list, summary: `${list.length} accounts` };
    }
    case 'read_records': {
      const list = all(R, input.col).slice(0, Number(input.limit) || 200).map(noSecrets);
      return { col: input.col, records: list, summary: `${list.length} ${input.col} records` };
    }
    case 'accept_computer': {
      const id = compId(R, input.code), st = salesSet(R);
      await setSales(R, { accepted: uniq((st.accepted || []).concat(id)) });
      if (R.computers[id].waiting) await put([{ col: 'computers', id, data: { ...R.computers[id], waiting: false } }]);
      return { id, summary: `Computer ${R.computers[id].code || id} accepted` };
    }
    case 'lock_computer': {
      const id = compId(R, input.code), st = salesSet(R);
      await setSales(R, { locked: uniq((st.locked || []).concat(id)) });
      return { id, summary: `Computer ${R.computers[id].code || id} locked` };
    }
    case 'unlock_computer': {
      const id = compId(R, input.code), st = salesSet(R), L = R.computers[id].letter;
      await setSales(R, { locked: (st.locked || []).filter((x) => x !== id && x !== L) });
      return { id, summary: `Computer ${R.computers[id].code || id} unlocked` };
    }
    case 'remove_computer': {
      const id = compId(R, input.code), st = salesSet(R);
      await setSales(R, { accepted: (st.accepted || []).filter((x) => x !== id) });
      return { id, summary: `Computer ${R.computers[id].code || id} taken off the accepted list` };
    }
    case 'set_account_active': {
      const name = input.username.trim().toLowerCase(), u = all(R, 'users').find((x) => String(x.username || '').toLowerCase() === name);
      if (!u) fail('No account with the username ' + input.username, 404, 'NOT_FOUND');
      const { id, ...data } = u;
      await put([{ col: 'users', id, data: { ...data, active: input.active } }]);
      return { id, summary: `Account ${u.username} turned ${input.active ? 'on' : 'off'}` };
    }
    case 'set_sales_tabs':
      await setSales(R, { tabs: uniq(input.tabs) });
      return { summary: 'Sales app tabs: ' + uniq(input.tabs).join(', ') };
    case 'save_record':
      await put([{ col: input.col, id: input.id, data: input.data }]);
      return { id: input.id, summary: `Saved ${input.col}/${input.id}` };
    case 'delete_record':
      await put([{ col: input.col, id: input.id, data: (R[input.col] || {})[input.id] || {}, deleted: true }]);
      return { id: input.id, summary: `Deleted ${input.col}/${input.id}` };
  }
  fail('Unknown action', 404, 'NOT_FOUND');
}

/* ---------- run ---------- */
function run() {
  S = readState();
  const link = new ThuraLink({
    secret: S.code, app: { id: 'ap', name: 'AP Main', version: VERSION }, actions: ACTIONS,
    onRotate: (code) => { S.code = code; writeState(S); log('link code rotated'); },
    my: { BAD_SIGNATURE: 'လက်မှတ် မမှန်ပါ။ AP link ကို ပြန်ချိတ်ပါ။', STALE: 'ကွန်ပျူတာ နာရီ ၅ မိနစ်ထက် ကွာနေသည်။' },
  });
  const srv = https.createServer({ key: fs.readFileSync(path.join(STATE, 'key.pem')), cert: fs.readFileSync(path.join(STATE, 'cert.pem')) }, (req, res) => {
    const parts = []; let size = 0;
    req.on('data', (d) => { size += d.length; if (size > 1e6) req.destroy(); else parts.push(d); });
    req.on('end', () => link.handle(req, res, Buffer.concat(parts), async (action, input) => {
      if (action.method === 'GET') for (const k of Object.keys(input)) if (input[k] === '') delete input[k];
      const out = await act(action, input);
      if (action.risk === 'high') log('done', action.name, out.summary || '');
      return out;
    }).catch((e) => { log('error', e && e.message); try { res.end(); } catch (x) {} }));
  });
  srv.listen(S.port || PORT, '127.0.0.1', () => { log('AP link running on https://127.0.0.1:' + (S.port || PORT)); console.log('AP link running on https://127.0.0.1:' + (S.port || PORT)); });
}

if (process.argv[2] === 'setup') setup(); else run();
