-- AP Plastic cloud database (Cloudflare D1)
-- records: every record of every app, the same shape as on the PC: col (kind), id, data (JSON)
CREATE TABLE IF NOT EXISTS records (
  col TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,      -- 1 = removed; kept so other computers learn about it
  updated_at TEXT NOT NULL,                -- set by the cloud, ISO time
  updated_by TEXT NOT NULL,                -- which app wrote it: main, sales
  PRIMARY KEY (col, id)
);
CREATE INDEX IF NOT EXISTS records_updated ON records (updated_at);

-- monthly: one copy of every record, made by the cloud on the 1st of each month for the month that ended.
-- Nothing ever deletes from this table, so every month is kept (at least 12 months, as decided).
CREATE TABLE IF NOT EXISTS monthly (
  month TEXT NOT NULL,                     -- YYYY-MM
  col TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  PRIMARY KEY (month, col, id)
);

-- login_tries: wrong sign-in tries, per username ("user:<name>") and per address ("ip:<address>"),
-- so the cloud can stop someone guessing passwords (5 wrong tries in 15 minutes).
CREATE TABLE IF NOT EXISTS login_tries (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,                      -- wrong tries in this window
  since INTEGER NOT NULL                   -- when the window started, seconds since 1970
);
