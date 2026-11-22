# Changes

Newest first. Date, who (and which AI), what changed and why.

- 2026-11-22, Thura (Main App Chat): new app: one product list with the Sales app (productList: name, brand, price per piece, pieces per bag). The main app shows it as price per dozen and dozens per bag and keeps its own Myanmar name, start stock and minimum in the same record; its older products move into it once with the same ids. Product form has Brand. Tested on a local test cloud.
- 2026-11-22, Thura (Main App Chat): new app reads the Sales app's records from the cloud (receipts, payments, returns, customers, products, computers): they count on Overview, the Sales tabs, debt and alerts, and can only be changed in the Sales app. Settings > Sales app: choose the Sales app's tabs and lock or unlock sales computers (appSettings/sales). Tested with made-up Sales records on a local test cloud.
- 2026-11-22, Thura (Main App Chat): cloud: only the main app's key can write appSettings (tabs, locked computers), so a locked sales computer cannot unlock itself.
- 2026-11-22, Thura (Main App Chat): new app linked to the cloud: paste the key once in Settings > Cloud. Every change is saved on the PC and sent to the cloud (waits and retries without internet); every 30 seconds the app fetches other computers' changes. First link takes the cloud's records first, then sends what only this PC has. Tested against a local test cloud.
- 2026-11-22, Thura (Main App Chat): cloud on Cloudflare: Worker and D1 database (cloud/), records table plus a monthly copy on the 1st of each month that is never cleared, one secret key per app. Tested with made-up records, then emptied. The apps are not linked yet.
- 2026-11-22, Thura (Main App Chat): new app: took out the department mode added the same day. The Sales app is made in its own chat and will connect to the main app through the cloud later.
- 2026-11-21, Thura with Claude: new app (`app/`): Overview graphs are titled by month ("November sales",
  "November income", "Customers' debt" ...). Sales graphs show an orange dashed prediction line (this month at
  today's pace, next month from the 6-month trend). Sales tab has a line graph per product; tap a name to hide it.

- 2026-11-21, Thura with Claude: new app (`app/`) Overview: the sales numbers are replaced by one graph per area
  (sales, money in, customers owe you, raw material used, production, waste), each with an Open button.

- 2026-11-21, Thura with Claude: new app (`app/`): every tab built the same way, top to bottom: tools (month,
  search, buttons), four numbers, graphs, then the lists with a title. Added the four numbers to Payments,
  Customers, Raw materials and Finished products; removed the last hint lines.

- 2026-11-21, Thura with Claude: new app (`app/`): graphs on every tab. Payments (each day, 6 months, paid by),
  Customers (owe the most, bought the most), Raw materials (used each day, bought), Finished products (made each
  day, 6 months, in store), Waste (each day, 6 months, by reason). Chart scales now use round steps.

- 2026-11-21, Thura with Claude: new app (`app/`): removed the "Sales records" line under the logo.

- 2026-11-21, Thura with Claude: wrote down the cloud plan for the new app in `CLAUDE.md`: records on both the
  cloud and the office computer, and the cloud keeps at least a year (a copy per month). Not built yet.

- 2026-11-21, Thura with Claude: new app (`app/`) saves into a folder chosen once in Settings instead of a single
  file: `ap-records.json` (everything, updated after each change) and `ap-records-YYYY-MM.json` (one per month,
  started by itself each new month). Settings has one button: Choose folder / Change folder.

- 2026-11-21, Thura with Claude: new app (`app/`) Production department. Raw materials: material list (unit, price,
  minimum), stock in (price updates the material), stock used, what is in store. Finished products: stock at
  start, minimum, production made (dozens or bags), in store = made minus sold on receipts. Waste products: waste
  each day (product or machine, weight in lb, reason), regrind made (can add to a raw material), waste sold.
  Overview alarms: material below minimum, product low or more sold than made, waste over 5% of material used.

- 2026-11-21, Thura with Claude: new app (`app/`) is split into departments with tabs: Sales (Receipts, Payments,
  Customers) and Production (Raw materials, Finished products, Waste products), plus Overview and Settings. Sales
  are now called receipts. Raw materials and Waste products are empty for now (next step).

- 2026-11-21, Thura with Claude: new app (`app/`): the records file name is no longer shown anywhere (sales
  workers would not understand it); the saving status is plain words: Saved, Not saved, Records file is closed.

- 2026-11-21, Thura with Claude: new app (`app/`): much less explaining text (Settings is just the file name, three
  buttons and the language; no hint lines; no line under page titles; one-line file messages). Every change to a
  customer or product is now kept in an `outbox` list, ready for when other apps are connected through a cloud:
  they must ask "Accept?" before taking a change from the main app (rule written in CLAUDE.md).

- 2026-11-21, Thura with Claude: new app (`app/`): better Myanmar words for overdue money (past the time) and the
  past sale. Backup is now automatic and not shown: one copy of all records per day, taken the first time the
  app is used that day, last 30 days kept in the browser. The Backup box and the backup reminder are gone.
  To restore, `apRestore("YYYY-MM-DD")` in the browser console (`apBackups()` lists the days).

- 2026-11-21, Thura with Claude: new app (`app/`): Overview page with notifications and alarms (overdue money per
  customer, records file problems, backup reminder, unpaid sales, products with no price, customers with no
  phone); full customer details as in the sales department's list (number, town, phone, address, bank, payment
  term, agent and commission, usual delivery charge, brands, note) with a details panel; delivery charge on a
  sale; graphs on the Sales tab (sales each day, last 6 months, top products, top customers). The look is now
  white with blue touches only (no dark mode), as the owner asked.

- 2026-11-21, Thura with Claude: new app (`app/`) shows the Advanced Packaging logo (menu, phone top bar, browser
  tab icon) and uses the logo's navy as its main colour. `app/logo.png` and `app/icon.png` are cut from the logo.

- 2026-11-21, Thura with Claude: start of a new, simpler app in `app/` for collecting data and showing it to
  the CEO, built step by step. Step 1 is sales: product list (price per dozen and per bag), customer list,
  sales with several products in dozens or bags, paid now, later payments, and what each customer still owes.
  Records are kept in a file on the office computer's drive. English and Myanmar, computer and phone. The old
  app stays as it is until the new one is ready.

- 2026-11-21, Thura with Claude: Home is now one list of notifications and alarms (Urgent, To do, For
  information), each with an Open button; the quick buttons stay on top. New alarms: not enough finished stock
  for orders, orders due tomorrow, customers owing for more than 30 days, money owed to suppliers. Overview now
  shows every number for the month in one box per area (money, sales and orders, production, finished stock,
  raw materials, staff pay, electricity, molds, buying), with arrows against last month. Asked for by the owner:
  simple and clear.

- 2026-11-21, Thura with Claude: `receipts/ap-receipts.html`, a simple receipt maker for the sales department
  (published as the "AP Receipts" artifact): form, modern customer receipt (picture or text for Viber), saved
  receipts for the team. Product names are typed for now; the product list will be made again later.

- 2026-11-16, Thura with Claude: the app can be installed. "Install app" button at the top (Chrome and Edge
  install it in one click; iPhone, Android and computer steps shown otherwise); sharp new icons at every size;
  `sw.js` so Chrome offers install and the app opens without internet (always loads the newest version first);
  Windows setup kept in `install/` for computers without Chrome or Edge. Asked for by the owner.

- 2026-11-16, Thura with Claude: made this project the shared workplace (CLAUDE.md rules, this file, test setup
  with made-up data in `test/`, `.gitignore` for private files).
- 2026-11-16, Thura with Claude: new parts. Home page (today's money, orders, what is owed, what is low, quick
  buttons); Orders (Waiting, Ready, On the way, Delivered, and Delivered records the sale); Bills (print, picture,
  send to Viber; details in Settings > Bill details); Buying (purchases into raw material stock, suppliers and what
  is owed, payments to suppliers, daily expenses). Asked for by the owner for the office.
