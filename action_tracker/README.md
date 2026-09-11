# Action & Evidence Tracker — prototype

A working reference implementation of the SharePoint/Power Platform design in
[`docs/DESIGN.md`](../docs/DESIGN.md). See §13 of that document for how each
piece here maps onto SharePoint Lists, the Evidence document library, Power
Automate flows, and Power BI.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python run.py
```

Open http://127.0.0.1:5000 — a database with demo users and sample actions
is created automatically on first run (`instance/action_tracker.db`).

Sign in as one of the seeded users to see role-based behaviour:

| Name | Role | What you can do |
|---|---|---|
| Manal Albalushi | Admin | everything, including Import and Settings |
| Sara Al Hinai | Reviewer | review submitted evidence |
| Ahmed Al Balushi / Fatma Al Siyabi / Yousuf Al Harthy | Owner | update their own actions, upload evidence |
| Layla Al Kindi | Management | read-only dashboard/register |

## Share it with your team on the office network

`run.py` is single-user and localhost-only — it's for trying the app out
yourself. To let colleagues on the same office network/Wi-Fi reach it from
their own browsers, run the LAN entry point instead, from the repo root:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python serve_lan.py
```

It prints the address to share, e.g. `http://192.168.1.42:5000` — send that
to your team. Differences from `run.py`:

- Binds to the network (`0.0.0.0`), not just `127.0.0.1`.
- Runs on Waitress, a production WSGI server that handles several people
  using it at once — not Flask's single-request debug server.
- Debug mode and auto-reload are off. **Never run `run.py` (debug mode) on
  an address other people can reach** — its interactive debugger lets
  anyone who can open the page run arbitrary code on your machine.

A few things worth knowing before you share the link:

- **It only runs while your PC is on and `serve_lan.py` is running.**
  Closing the terminal window stops it for everyone. For anything beyond a
  quick pilot, move it to a server/VM (see `docs/DESIGN.md` §12) or run it
  as a background service instead of a terminal window.
- **There are no real passwords.** Signing in is a name picker (see the
  table above) — fine on a small, trusted office network, but anyone who
  can reach the URL can act as any listed user. Don't put it on a network
  segment (e.g. guest Wi-Fi) that untrusted people share, and say if you'd
  like a password added per user before rolling it out more widely.
- **Open the port on your firewall** if colleagues can't connect: Windows
  will prompt to allow Python through the firewall the first time you run
  it — accept for "Private networks"; on macOS, allow it under
  System Settings → Network → Firewall if prompted.
- **Back up `instance/`** (`action_tracker.db` + `uploads/`) periodically —
  it's the only copy of the data while running this way.

## Try the Excel migration

A sample legacy tracker is provided at
`sample_data/sample_action_tracker.xlsx` (regenerate with
`python3 scripts/make_sample_excel.py`). Sign in as an Admin, open
**Import**, upload that file, review the auto-suggested column mapping, and
confirm — new actions appear in the register with their original reference
preserved as a Legacy ID. The uploaded file itself is kept untouched under
`instance/uploads/imports/`.

## Notes

- SQLite database and uploaded files live under `instance/` and are
  gitignored — delete that folder to reset the demo data.
- `flask --app run.py init-db` re-seeds if you ever wipe the database.
- Alerts are recorded in-app on the Notifications page rather than sent by
  email — see §14 of the design doc for why, and what replaces it in the
  SharePoint build (Power Automate/Outlook).
