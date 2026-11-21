# Changes

Newest first. Date, who (and which AI), what changed and why.

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
