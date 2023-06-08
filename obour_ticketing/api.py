
import frappe

@frappe.whitelist()
def get_users(txt, doctype, docname, searchfield="name"):
	if doctype == "Issue":
		issue = frappe.get_doc("Issue", docname)
		technicians = frappe.get_list("Ticketing User Table", {"parent": issue.ticketing_group}, ["user_email as value", "user_name as description"])
		return technicians

	return frappe.db.sql(
		"""
		SELECT name as value, first_name as description
		FROM `tabUser`
			WHERE `{key}` LIKE %(txt)s OR first_name LIKE %(txt)s
			OR full_name LIKE %(txt)s
			AND enabled = 1 AND user_type = 'System User'
			ORDER BY name""".format(key=searchfield),
		{"txt": "%" + txt + "%"},
		as_dict=True
	)