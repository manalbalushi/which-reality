"""Generates sample_data/sample_action_tracker.xlsx - a stand-in for a typical
manually maintained Excel action tracker, used to demo the Import feature."""
import os
from datetime import date, timedelta

from openpyxl import Workbook

OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "sample_data", "sample_action_tracker.xlsx")


def build():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    wb = Workbook()
    ws = wb.active
    ws.title = "Action Tracker"

    headers = [
        "Ref No", "Action", "Description", "Owner", "Dept", "Priority", "Source",
        "Raised Date", "Due Date", "Status", "% Complete", "Comments", "Evidence Required",
    ]
    ws.append(headers)

    today = date.today()

    def d(offset):
        return (today + timedelta(days=offset)).strftime("%Y-%m-%d")

    rows = [
        ["LEG-001", "Rotate shared service account passwords", "Quarterly rotation of shared service credentials.",
         "Ahmed Al Balushi", "IT Security", "High", "Internal Audit", d(-30), d(-2), "In Progress", 70,
         "Rotation script tested, production rollout pending change approval.", "Yes"],
        ["LEG-002", "Review supplier contracts for data protection clauses", "Legal review of top 10 supplier contracts.",
         "Fatma Al Siyabi", "Finance", "Medium", "Compliance Review", d(-45), d(20), "Not Started", 0,
         "", "Yes"],
        ["LEG-003", "Patch legacy file server OS", "Apply outstanding security patches to file server FS-02.",
         "Yousuf Al Harthy", "Operations", "Critical", "Vulnerability Scan", d(-20), d(-5), "In Progress", 50,
         "Maintenance window booked for next weekend.", "Yes"],
        ["LEG-004", "Update incident response runbook", "Incorporate lessons learned from March tabletop exercise.",
         "Ahmed Al Balushi", "IT Security", "Low", "Tabletop Exercise", d(-10), d(40), "Not Started", 0,
         "", "No"],
        ["LEG-005", "Archive terminated employee accounts", "Disable and archive accounts for leavers in Q2.",
         "Fatma Al Siyabi", "Finance", "Medium", "HR Audit", d(-15), d(10), "In Progress", 30,
         "Half of the list processed so far.", "Yes"],
    ]
    for r in rows:
        ws.append(r)

    for col in ws.columns:
        width = max((len(str(c.value)) for c in col if c.value is not None), default=10)
        ws.column_dimensions[col[0].column_letter].width = min(width + 2, 40)

    wb.save(OUT_PATH)
    print(f"Sample tracker written to {os.path.abspath(OUT_PATH)}")


if __name__ == "__main__":
    build()
