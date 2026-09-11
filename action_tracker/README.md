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
