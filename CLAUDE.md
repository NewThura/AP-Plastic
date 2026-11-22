# AP Plastic ERP: note for every Claude (and every person) working here

Claude Code reads this file by itself at the start of every session. Two people work on this app, each with
their own Claude, each on their own computer. This GitHub project is the one shared workplace.

## What the app is
A factory and office app for AP Plastic, a plastic packaging company: production, raw materials, staff pay,
molds, electricity, sales, customers, orders, bills, buying and suppliers. Myanmar and English.
- Live app: https://newthura.github.io/AP-Plastic/ (GitHub Pages serves `index.html` from `main`).
- Records live in Supabase (one table `records`: `col` = record type, `id`, `data` JSON; access in `app_users`
  with roles owner / editor / viewer). The database is not in this project.

## The golden rules
1. **Before starting: `git pull`.** The other person may have changed things since yesterday.
2. **Say what you are working on** in "Working on now" below, commit and push that line first, so the two of you
   don't change the same part at the same time.
3. **Small steps.** One change, test it, commit it, push it. Don't sit on a day of changes.
4. **Pushing to `main` puts it live at once** for everyone at the factory. Only push what you have tested.
   For something big or risky, use a branch (`git switch -c <name>`) and merge it when it is ready.
5. **Never put private data here.** This project is **public**. No customer or staff names, phone numbers,
   salaries, sales sheets, Excel files, photos of ledgers, database exports or passwords. Test data in `test/`
   is made up and must stay made up. `.gitignore` blocks the usual private files; still check `git status`.
6. Add one line to `CHANGES.md` for each change (newest first): date, who, what and why.
7. Save with `git add <the files you changed>`, then `git commit`, then `git push`. Never `git add -A` / `git add .`.
8. If `git pull` reports a conflict, stop and tell the person; don't guess which side to keep.

## Where everything is (since 2026-11-23)
All AP folders are in `E:\AP`: `AP Main` (this project, branch `new-app`; the new app in `app/` is called **AP Main**, never "ERP"),
`Old AP app` (the **old AP ERP**: the same project on branch `main`, live online; keep it, never delete it), `AP Sales` (the Sales app,
its own chat), `AP Sales Data` (the Sales app's records) and `AP Records` (the main app's records folder).
The desktop shortcut "AP Plastic" opens `E:\AP\AP Mainpp\index.html` in its own window.

## Working on now
Write your name, the part, and the date. Remove your line when you are done.

| Who | Part | Since |
|---|---|---|
| Thura (Main App Chat) | Records kept on the device instead of Supabase (sign-in, saving), branch `device-records` | 2026-11-21 |
| Thura (Main App Chat) | New simple app in `app/` (step 1: sales), branch `new-app` | 2026-11-21 |

## The new app (`app/`, started 2026-11-21)
A new, simpler app is being built step by step in `app/index.html` (one file, readable code). It only collects
data and shows it to the CEO. Departments: Sales (receipts, payments, customers) and Production (raw materials,
finished products, waste). Records are saved into a folder on the office computer's drive, chosen once in
Settings (Chrome or Edge): `ap-records.json` holds everything, `ap-records-YYYY-MM.json` is kept for each month;
a copy is also kept in the browser. Nothing is sent anywhere. These files are private (blocked in `.gitignore`).
Words: `MY` (English → Myanmar) at the top of its script; wrap fixed text in `t()` / `T()`. Test it with
`python -m http.server 8770 --directory .` from the project folder, then open http://127.0.0.1:8770/app/ .
The old app below stays live until the new one replaces it.

**Rule for other apps (decided 2026-11-21): the main app leads, other apps ask.** When the main app adds,
changes or removes a customer or a product, it writes an entry to `outbox` (in its records): `what`
(customers / products), `recId`, `name`, `action` (add / change / remove), `before` and `after` (only the fields
that changed), `at`, `status: "waiting"`. Another app, such as the sales department's receipt app, must never
take these changes by itself: it shows each one ("The main app changed this. Accept?") with before and after,
and only updates its own copy after someone presses Accept. Refuse leaves its copy as it was. The two apps get
connected when there is a cloud again; until then the outbox only fills up. Sales and payments are not shared.
The main app shows as little explaining text as possible: no hint lines, short buttons, short messages.

**Cloud plan (decided 2026-11-21).** Records are kept in two places: the cloud
and the office computer's folder. Neither replaces the other; the folder saving stays as it is. The cloud must
keep at least one year of records: every record stays (nothing is cleared after a time limit), and the cloud also
keeps one copy for each month, the same as `ap-records-YYYY-MM.json` on the computer, never deleting a month that
is less than 12 months old. Don't count on the cloud company's own backups for this (on cheap plans they are kept
only a few days, or not at all); the app makes the monthly copies itself. Choose a plan that does not pause the
database when it is not used for a while.

**The cloud (Cloudflare, set up 2026-11-22; the new main app links to it from Settings > Cloud, the Sales app not yet). The main app keeps the Sales
app's kinds as they come (SALES_COLS, shapes in E:\AP\AP Sales\DATA.md) and shows receipts, payments and returns through
`salesView()` as read-only sales and payments; Settings > Sales app writes `appSettings`/`sales` {tabs, locked}.** Code in `cloud/`: a Worker
(`src/worker.js`) and a D1 database `ap-records` in Asia (`schema.sql`), at https://ap-plastic-cloud.applastic.workers.dev .
Table `records` (col, id, data, deleted, updated_at, updated_by) holds every app's records in the same shape as on
the PC; table `monthly` gets a copy of every record on the 1st of each month and is never cleared. Each app sends its
own key in the `X-AP-Key` header (MAIN_KEY, SALES_KEY: Cloudflare secrets, also in the owner's
Documents\AP cloud keys.txt). **Never put a key in this project.** Publish a change with `npx wrangler@4 deploy` in `cloud/`.
To test without the real cloud: `cloud/.dev.vars` with made-up keys, `npx wrangler@4 dev --port 8787`, and in the
app's browser console `localStorage.setItem("ap2.cloudUrl","http://127.0.0.1:8787")`.

## How the code is laid out (old app)
Everything is in `index.html` (one file, no build step): styles at the top, then the page, then one script.
- `COLS`: record types loaded from Supabase. `S[col][id]` holds them. `save(col,id,data,msg)` / `remove(col,id,msg)` write.
- `PAGES`: the left menu and each page's tabs. `V.<page>.<tab>()` returns the HTML of a tab; `V.<page>.<tab>.bind()` hooks up its buttons.
- `openForm({...})`: the side form for adding and editing a record.
- `DICT`: English → Myanmar words. Every new piece of on-screen text needs a Myanmar line in `DICT`
  (the block "Myanmar words for the new parts" near the end is the easiest place to add them).
  Text that must not be translated (names, numbers) goes inside an element with class `notr`.
- The block "New parts (2026-11-16): Home, Orders, Bills, Buying" holds the Home page, Orders, Bills and Buying.
- `config.js`: Supabase address and the public (publishable) key. Never put a secret key in this project.
- Installing: `manifest.webmanifest` (name, icons), `sw.js` (needed for the Install button; it loads the newest
  version first and keeps a copy for no-internet; when you add a new file the app needs offline, nothing else is
  required), the "Install as an app" block in `index.html`, and `install/` (Windows setup for computers without
  Chrome or Edge). The icons are `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`.

## Testing
- `python test/run_test.py`, then open http://127.0.0.1:8765/ . It runs the app with a pretend database and
  made-up records (`test/fake-supabase.js`), signed in as owner. Nothing reaches the real database.
  In the browser console, `fakeReset()` starts the test records again.
- Check every page you changed in **English and Myanmar**, at **computer and phone width**, and look for errors
  in the browser console.
- Only after that, push. Then open the live app, press Ctrl+F5, and check it once more.

## Plain words
The owner wants plain English: short sentences, no jargon. Buttons and messages in the app follow the same rule.
