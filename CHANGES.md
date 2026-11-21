# Changes

Newest first. Date, who (and which AI), what changed and why.

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
