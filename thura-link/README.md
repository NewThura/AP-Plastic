# AP link (Thura's Code)

Lets the owner's Thura's Code see AP Main and control it, with the highest authority (the "Thura key").
It follows the Thura App Link standard in `E:\Thura's APP\Modules\installed\thura-applink\files\THURA-APP-LINK-SPEC.md`
and uses Thura's own SDK from that folder (it is not copied here).

- Runs only on the owner's PC: `https://127.0.0.1:47840`, its own certificate, every request signed by Thura.
- Talks to the AP cloud with the Thura key. Its changes show in AP Main and the Sales app, marked "thura".
- **Reading** (Thura does these freely): overview, sales by day, debts, computers, accounts (no passwords), any records.
- **Changing** (Thura asks the owner every time): accept, lock, unlock or remove a computer; turn an account on or off;
  Sales app tabs; write or delete any record.

Install: double-click `Install AP link.bat` once. It makes the certificate, the link code and the Thura key, writes
the link file into Thura's folder, and starts the helper (and again whenever Windows starts).
The Thura key must then be put in the cloud once: `npx wrangler secret put THURA_KEY` in `cloud`, fed from the private file.

Private files (never in this project): `%LOCALAPPDATA%\AP Main\thura-link\` (state.json, cert.pem, key.pem, ap-link.log).
Run `Install AP link.bat` again to connect afresh (new link code; the Thura key stays the same).
