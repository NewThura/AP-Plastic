# Changes

Newest first. Date, who (and which AI), what changed and why.

- 2026-11-23, Thura (Main App Chat): receipt form: each product line shows its amount in its own box (Amount column) instead of a grey number under the line. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): new Permissions page in the left menu: everything waiting for the owner's yes in one place (new computers: accept or refuse; receipt corrections from the Sales app: approve or refuse with a note; computers that tried to sign in outside the allowed places: add the place). Its alerts open it, and the menu shows how many are waiting. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): passcode box: "Forgot passcode?" (tap twice, then set a new one), a Show button, Myanmar numbers count the same as English ones, spaces are ignored, and a long number (like a phone number) also matches when the old box had cut it to 8. The owner's right passcode was refused.
- 2026-11-23, Thura (Main App Chat): nobody chooses a letter any more: each new account gets its own record code automatically (S1, S2, … for a Sales person; A1, A2, … for a Sales manager), kept in users.letter and never changed, so numbers look like S1-000001. The Overview warns when two Sales app computers gave the same number (and names the computers). Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): several accounts may now share a letter (the owner changed his mind). Which computer made a record is known from the computer's hidden code (pc) the Sales app writes on each record; tapping a Sales app receipt or payment in AP Main says who made it and on which computer. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): each account now has its own letter (A to Z), given only in AP Main when making the account; the numbers on that person's receipts start with it (A-000001); a letter already taken cannot be chosen again. The Sales app chat is asked to use the account's letter instead of letting each computer choose one. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): account types renamed on screen: "Sales worker" is now "Sales person", "Main office" is now "Sales manager" (saved values stay sales and office, which the Sales app reads). Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): removed the "No records file yet" bar at the top of every page and its Overview alert; the folder can still be chosen in Settings > Records file. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): allowed places for sales computers: Settings > Sales app has a list of places (name, map point, metres; paste from Google Maps). The cloud refuses sign-in outside every place (403 outside) or when the place is not found (403 noplace); no places = no check. The Computers page shows where each computer is, with a map link and "Add as allowed place". Asked for by the owner through the Sales app chat.
- 2026-11-23, Thura (Main App Chat): fixed: from Computers > Accounts the Computers tab would not open (the tab and the page share the name "computers", so it reopened the last tab). Tab buttons now open their own tab. Found by the owner.
- 2026-11-23, Thura (Main App Chat): Thura's Code can see and control AP: the cloud has a master key (THURA_KEY, changes marked "thura") and the new AP link helper (`thura-link/`) connects Thura's Code to AP by the Thura App Link standard. Thura reads freely; every change asks the owner first. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): sign-in also checks the computer: the right password on a computer not yet allowed in AP Main gets no key (403 waiting) and the cloud writes that computer for the Computers page; a locked one gets 403 locked. Wrong tries: 5 per name, 30 per address in 15 minutes. Accepting a computer in AP Main clears its waiting mark. Asked for by the owner.
- 2026-11-23, Thura (Main App Chat): cloud sign-in for sales computers without a key: /login/salt and /login check a username and password hash against the accounts made in AP Main and give back the Sales key; unknown names get a stable made-up salt; 5 wrong tries in 15 minutes are refused. Asked for by the owner through the Sales app chat.
- 2026-11-23, Thura (Main App Chat): passcode for important actions (change records folder, link or unlink the cloud, Sales app tabs, accept/lock/remove computers, make or change accounts), set in Settings > Passcode; kept on the PC only as a hash; after a right passcode, one minute without asking again. Asked for by the owner to avoid accidents.
- 2026-11-23, Thura (Main App Chat): the desktop icon showed garbled (black with blotchy yellow): the icon file now uses the classic picture format Windows reads everywhere, and the installer gives the copied icon a new name when it changes so Windows drops its old saved one.
- 2026-11-23, Thura (Main App Chat): sharper logo: cut again from the original, trimmed to the gold frame with see-through corners, larger sizes (256 in the app, 512 icon), and a real Windows icon with every size (install/ap-main.ico) for the Desktop and Start menu.
- 2026-11-23, Thura (Main App Chat): installer in install/: double-click Install AP Main.bat to put AP Main on a computer (E:\AP\AP Main, or LOCALAPPDATA\Programs\AP Main) with the gold AP Plastic icon on the Desktop and in the Start menu; running it again updates the app, records untouched.
- 2026-11-23, Thura (Main App Chat): AP Main holds only its own files now: the old AP ERP's files (old index.html, Supabase settings, installer, receipt maker, test setup, old icons) are taken off this branch; they stay on branch main. The app moved from app/ to the top of the folder. Notes rewritten for AP Main.
- 2026-11-23, Thura (Main App Chat): all AP folders now live in E:\AP (AP Main, Old AP app, AP Sales, AP Sales Data, AP Records); notes and paths updated.
- 2026-11-23, Thura (Main App Chat): new app: new gold AP logo (app icon and the mark beside the company name).
- 2026-11-23, Thura (Main App Chat): new app: Computers page. It lists every computer that opens the Sales app (online now or last seen, code, Windows name, IP, user) with Accept, Lock/Unlock and Remove (appSettings/sales accepted and locked), plus an alert when one is waiting. Accounts tab makes the Sales app's sign-ins (users, password kept only as a PBKDF2 hash). Cloud: only the main key may write users. The app fetches everything again when it learns new kinds of records.
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
