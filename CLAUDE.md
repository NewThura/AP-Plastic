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

## Working on now
Write your name, the part, and the date. Remove your line when you are done.

| Who | Part | Since |
|---|---|---|
| Thura (Main App Chat) | Records kept on the device instead of Supabase (sign-in, saving), branch `device-records` | 2026-11-21 |
| Thura (Main App Chat) | New simple app in `app/` (step 1: sales), branch `new-app` | 2026-11-21 |

## How the code is laid out
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
