from __future__ import unicode_literals
import frappe

def get_context(context):
	# do your magic here
	pass

@frappe.whitelist()
def close(issue):
	if frappe.db.exists("Issue", issue):
		issue = frappe.get_doc("Issue", issue)
		issue.status = "Closed"
		issue.flags.ignore_permissions = True
		issue.flags.ignore_mandatory = True
		issue.save()
		frappe.db.commit()
		return True
	return False

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
