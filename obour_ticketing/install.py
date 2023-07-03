
import frappe
from frappe.permissions import add_permission, update_permission_property

def after_install():
    if not frappe.db.exists("Role", "Ticket Initiator"):
        role = frappe.new_doc("Role")
        role.role_name = "Ticket Initiator"
        role.is_custom = True
        role.save(ignore_permissions=True)
        frappe.db.commit()

    doctypes = ["Issue", "Issue Priority", "Issue Type"]
    perms = ["write", "read", "create", "select", "delete"]
    for doc in doctypes:
        add_permission(doc, "Ticket Initiator", 0)
        for perm in perms:
            update_permission_property(doc, "Ticket Initiator", 0, perm, 1)
    frappe.db.commit()
