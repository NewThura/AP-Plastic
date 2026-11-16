"""Runs the app on this computer with a pretend database and made-up records.

    python test/run_test.py          then open http://127.0.0.1:8765/

Nothing is sent to Supabase: test/fake-supabase.js stands in for it and keeps
records in the browser (run  fakeReset()  in the browser console to start again).
All names and numbers here are invented. Never put real customers or staff here:
this project is public on GitHub.
"""
import datetime, http.server, json, pathlib, shutil, socketserver, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "test" / "out"
CDN = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js"></script>'


def day(n):
    return (datetime.date.today() + datetime.timedelta(days=n)).isoformat()


def sample():
    t = datetime.date.today()
    month = t.strftime("%Y-%m")
    R = []
    add = lambda col, id, data: R.append({"col": col, "id": id, "data": data})
    add("settings", "main", {"company": {"name": "AP Plastic (test)", "phone": "09 000 000 000",
                                         "banks": "KBZ  0000 0000 0000  ·  Test account"}})
    for i, (my, en, sell, opening) in enumerate([("ခွက် (၁)", "Test cup 1", 30000, 200),
                                                 ("ခွက် (၂)", "Test cup 2", 28000, 50),
                                                 ("ပုံး", "Test bucket", 45000, 10)], 1):
        add("products", f"t{i}", {"no": i, "my": my, "en": en, "sellDz": sell, "openingDz": opening,
                                  "dzPerBag": 40, "active": True})
    add("materials", "m-test-resin", {"name": "Test resin", "group": "Resin", "unit": "lb", "price": 4000, "minStock": 500})
    add("materials", "m-test-red", {"name": "Test red colour", "group": "Colour", "unit": "lb", "price": 40000})
    add("stock", "s-test-1", {"date": day(-20), "kind": "in", "mat": "m-test-resin", "qty": 300, "price": 4000})
    for i, (name, area) in enumerate([("Test Shop One", "Yangon"), ("Test Shop Two", "Mandalay"),
                                      ("Test Shop Three", "Mawlamyine")], 1):
        add("customers", f"k-test-{i}", {"no": i, "name": name, "area": area, "phone": "09 000 000 00" + str(i),
                                         "terms": "Month-end", "companies": ["AP"]})
    add("sales", "o-test-1", {"date": day(-3), "cust": "k-test-1", "lines": [{"p": "t1", "dz": 20, "price": 30000}], "paid": 0})
    add("sales", "o-test-2", {"date": day(0), "cust": "k-test-2", "lines": [{"p": "t2", "dz": 10, "price": 28000}], "paid": 100000})
    add("payments", "y-test-1", {"date": day(-1), "cust": "k-test-1", "amount": 200000, "method": "KBZ"})
    add("production", month, {"bags": {"t1": 5, "t2": 2}})
    add("orders", "d-test-1", {"no": 1, "date": day(-4), "due": day(-1), "cust": "k-test-3", "status": "wait",
                               "lines": [{"p": "t3", "dz": 30, "price": 45000}], "place": "Mawlamyine"})
    add("orders", "d-test-2", {"no": 2, "date": day(-1), "due": day(2), "cust": "k-test-1", "status": "ready",
                               "lines": [{"p": "t1", "dz": 15, "price": 30000}]})
    add("suppliers", "v-test-1", {"name": "Test Resin Supplier", "sells": "Resin", "phone": "09 000 000 100"})
    add("purchases", "b-test-1", {"date": day(-5), "sup": "v-test-1", "lines": [{"mat": "m-test-resin", "qty": 100, "price": 4000}],
                                  "paid": 150000, "method": "Cash", "toStock": True})
    add("expenses", "x-test-1", {"date": day(-2), "cat": "Transport / fuel", "amount": 15000, "method": "Cash", "what": "Diesel"})
    return R


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    if page.count(CDN) != 1:
        sys.exit("run_test: the Supabase script line in index.html changed; update CDN in this file")
    (OUT / "index.html").write_text(page.replace(CDN, '<script src="fake-supabase.js"></script>'), encoding="utf-8")
    for f in ["config.js", "manifest.webmanifest", "sw.js", "icon.png", "icon-192.png", "icon-512.png",
              "icon-maskable-512.png", "apple-touch-icon.png"]:
        shutil.copy(ROOT / f, OUT / f)
    shutil.copy(ROOT / "test" / "fake-supabase.js", OUT / "fake-supabase.js")
    (OUT / "sample.json").write_text(json.dumps(sample(), ensure_ascii=False), encoding="utf-8")
    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(*a, directory=str(OUT), **k)
    with socketserver.TCPServer(("127.0.0.1", 8765), handler) as srv:
        print("Test app: http://127.0.0.1:8765/   (Ctrl+C to stop)")
        srv.serve_forever()


if __name__ == "__main__":
    main()
