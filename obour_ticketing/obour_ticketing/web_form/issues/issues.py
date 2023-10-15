from __future__ import unicode_literals
import frappe


def get_context(context):
    # do your magic here
    pass


# @frappe.whitelist()
# def close(issue):
# 	if frappe.db.exists("Issue", issue):
# 		issue = frappe.get_doc("Issue", issue)
# 		issue.status = "Closed"
# 		issue.flags.ignore_permissions = True
# 		issue.flags.ignore_mandatory = True
# 		issue.save()
# 		frappe.db.commit()
# 		return True
# 	return False


@frappe.whitelist()
def reopen(issue, comment):
    if frappe.db.exists("Issue", issue):
        issue = frappe.get_doc("Issue", issue)
        issue.status = "In Progress"
        issue.add_comment(text=comment, comment_by=frappe.session.user)
        issue.flags.ignore_permissions = True
        issue.flags.ignore_mandatory = True
        issue.save()
        frappe.db.commit()
        return True
    return False


@frappe.whitelist()
def arhive_ticket(issue):
    """move issue to archived issue doctype when user cancel it"""
    if not frappe.db.exists("Issue", issue):
        return

    issue = frappe.get_doc("Issue", issue)
    archive_issue = frappe.new_doc("Archived Issue")
    archive_issue.issue_id = issue.name
    archive_issue.subject = issue.subject
    archive_issue.issue_type = issue.issue_type
    archive_issue.priority = issue.priority
    archive_issue.ticketing_group = issue.ticketing_group
    archive_issue.status = issue.status
    archive_issue.customer = issue.customer
    archive_issue.via_portal = issue.via_customer_portal
    archive_issue.insert(ignore_permissions=True)

    issue.delete(ignore_permissions=True)
    frappe.db.commit()
    return True
