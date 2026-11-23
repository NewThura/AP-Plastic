# AP Main: note for every Claude (and every person) working here

Claude Code reads this file by itself at the start of every session.

## What AP Main is
AP Main is the owner's app for AP Plastic (a plastic packaging company). It collects the company's data and shows
it to the CEO: Overview (graphs and alerts), Sales (receipts, payments, customers), Production (raw materials,
finished products, waste), Computers (the computers and accounts of the department apps) and Settings.
Myanmar and English. **Its name is "AP Main". It is never called "ERP".**

It is one file, `index.html` (no build step). The desktop shortcut "AP Plastic" opens `E:\AP\AP Main\index.html`
in its own Chrome window.
**Installing on a computer:** copy the AP Main folder there and double-click `install\Install AP Main.bat`. It puts
AP Main in `E:\AP\AP Main` (or `%LOCALAPPDATA%\Programs\AP Main` without a fixed E: drive) and adds the gold
"AP Plastic" icon to the Desktop and Start menu. Running it again updates the app; records are never touched.
When you add a file the app needs, add it to `$files` in `install\AP Main setup.ps1`.

## Keep apart: the old AP ERP
This project on GitHub (NewThura/AP-Plastic) also holds the **old AP ERP**, a different app, on branch `main`,
live at https://newthura.github.io/AP-Plastic/ . Its folder on the PC is `E:\AP\Old AP app` (and the older
`E:\AP-Plastic`). AP Main lives on branch `new-app` and has none of the old ERP's files.
- **Never merge `new-app` into `main`, or `main` into `new-app`.** That would wipe one app with the other.
- Never delete, move or change anything of the old AP ERP without asking the owner first.

## Where everything is
All AP folders are in `E:\AP`:
- `AP Main`: this project (branch `new-app`).
- `Old AP app`: the old AP ERP (branch `main`). Keep it.
- `AP Sales`: the Sales department app, built in its own chat ("Sales app chat"). Its record shapes are in
  `E:\AP\AP Sales\DATA.md`, the agreement between the two apps.
- `AP Sales Data`: the Sales app's records.
- `AP Records`: AP Main's records folder (chosen once in the app).

## The rules
1. **Small steps.** One change, test it, commit it, push it.
2. **Never put private data here.** This project is **public**. No customer or staff names, phone numbers,
   salaries, sales sheets, Excel files, photos of ledgers, record files, database exports, passwords or keys.
   Test data is made up and must stay made up. `.gitignore` blocks the usual private files; still check `git status`.
3. Add one line to `CHANGES.md` for each change (newest first): date, who, what and why.
4. Save with `git add <the files you changed>`, then `git commit`, then `git push`. Never `git add -A` / `git add .`.
5. If `git pull` reports a conflict, stop and tell the person; don't guess which side to keep.
6. **Talk to the Sales app chat directly** (SendMessage to "Sales app chat") instead of asking the owner to copy
   messages. Tell the owner in one line what you agreed.

## How the code is laid out (`index.html`)
Styles at the top, then the page, then one script.
- Words: `MY` (English → Myanmar). Every new piece of on-screen text needs a Myanmar line. Wrap fixed text in
  `t()` / `T()`; text that must not be translated (names, numbers) goes inside an element with class `notr`.
- Records: `COLS` (kinds), `DB[col][id]`, `save(col,id,data,msg)` / `remove(col,id,msg)`.
  `Store` keeps them in the browser (IndexedDB) and in the records folder: `ap-records.json` (everything) and
  `ap-records-YYYY-MM.json` (one per month). Record files are private and blocked in `.gitignore`.
- Pages: `DEPTS` (left menu and tabs), `V.<tab>()` returns a tab's HTML, `V.<tab>.bind()` hooks up its buttons.
  `openForm({...})` is the side form.
- Products: one list shared with the Sales app (`productList`); `PRODS()` shows it as price per dozen.
- The Sales app's records (`SALES_COLS`) come from the cloud; `salesView()` shows its receipts, payments and
  returns as read-only sales and payments.
- Computers page: accept / lock the department apps' computers (`appSettings`/`sales` {tabs, accepted, locked});
  Accounts tab: the Sales app's sign-ins (`users`, password kept only as a PBKDF2 hash).
- Permissions page: everything waiting for the owner's yes (`waitingComps`, `pendingFixes` = Sales app receiptFixes
  with status "pending", `outsideComps`). Any alert about such a request must `go("permissions")`.
- Passcode: important actions (records folder change, cloud link/unlink, Sales app tabs, computers, accounts) call
  `askPass()` first; set in Settings > Passcode, kept on that PC as a PBKDF2 hash, one minute of grace after a right
  passcode. Forgotten: "Forgot passcode?" in the passcode box (tap twice), then set a new one.
- As little explaining text as possible: no hint lines, short buttons, short messages. White interface, blue only
  as a small touch.

## The cloud (Cloudflare)
Code in `cloud/`: a Worker (`src/worker.js`) and a D1 database `ap-records` in Asia (`schema.sql`), at
https://ap-plastic-cloud.applastic.workers.dev . Table `records` (col, id, data, deleted, updated_at, updated_by)
holds every app's records; table `monthly` gets a copy of every record on the 1st of each month and is never
cleared (the owner wants at least 12 months kept). Records stay on the PC too; the cloud never replaces the folder.
Each app sends its own key in the `X-AP-Key` header (MAIN_KEY, SALES_KEY: Cloudflare secrets, also in the owner's
`Documents\AP cloud keys.txt`). Only the main key (or Thura's) may write `appSettings`, `users` and `productList` (prices: the owner, 2026-11-23);
such records sent with the Sales key are left out and the rest of the batch is saved.
**Never put a key in this project or in a message.** The owner pastes the key into the app himself.
Sales app updates: AP Main uploads the signed `.apsu` file (`POST /app/sales`, main key only); sales computers read
`GET /app/sales/version` and `GET /app/sales`. Stored whole in D1 tables `app_files` (parts) and `app_meta`, not in records.
Sales computers join without a key: `GET /login/salt?username=` then `POST /login {username, hash, code}` returns
the Sales key for an active account (hash made on the PC; 5 wrong tries in 15 minutes per name or address = 429).
The secret `LOGIN_SECRET` makes the made-up salts for unknown names. Publish a cloud change with
`npx wrangler@4 deploy` in `cloud/`.

## Thura's Code (the master key)
The owner's Thura's Code sees and controls AP through `thura-link/ap-link.js` (README there), a small helper on the
owner's PC following the Thura App Link standard (HTTPS on 127.0.0.1:47840, pinned certificate, signed requests,
Thura's SDK loaded from Thura's folder, never copied here). It uses the cloud secret `THURA_KEY`: the highest
authority, may write everything the main key may, changes marked "thura". Reading is free for Thura; every change
(computers, accounts, Sales tabs, any record) is "high" risk, so Thura asks the owner each time. Its private files
are in `%LOCALAPPDATA%\AP Main\thura-link\`, and the link file in Thura's `Data\module-data\thura-applink\links\ap.json`.
Test it against a local test cloud with made-up keys only.

## Testing
- `python -m http.server 8770 --directory "E:/AP/AP Main"`, then open http://127.0.0.1:8770/ .
- Without the real cloud: `cloud/.dev.vars` with made-up keys, `npx wrangler@4 dev --port 8788` in `cloud/`, and in
  the app's browser console `localStorage.setItem("ap2.cloudUrl","http://127.0.0.1:8788")`. (Port 8790 is the
  Sales app chat's.) Unlink and remove `ap2.cloudUrl` afterwards so test records never reach the real cloud.
- Check every page you changed in **English and Myanmar**, at **computer and phone width**, and look for errors
  in the browser console.

## Plain words
The owner wants plain English: short sentences, no jargon. Buttons and messages in the app follow the same rule.
