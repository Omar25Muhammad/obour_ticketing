
import frappe

def auto_close_tickets():
    """Auto-close Resolved support tickets after 3 days"""
    auto_close_after_days = (
        frappe.db.get_value("Support Settings", "Support Settings", "close_issue_after_days") or 3
    )

    issues = frappe.db.sql(""" 
            SELECT name FROM tabIssue
            WHERE status='Resolved'
            AND modified<DATE_SUB(CURDATE(), INTERVAL %s DAY)
        """,
        (auto_close_after_days),
        as_dict=True,
    )

    for issue in issues:
        doc = frappe.get_doc("Issue", issue.get("name"))
        doc.status = "Closed"
        doc.flags.ignore_permissions = True
        doc.flags.ignore_mandatory = True
        doc.save()

    frappe.db.commit()
