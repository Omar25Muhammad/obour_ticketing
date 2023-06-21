
import frappe
from frappe.permissions import add_permission, update_permission_property

def after_install():
    doctypes = ["Issue", "Issue Priority", "Issue Type"]
    for doc in doctypes:
        add_permission(doc, "Ticket Initiator", 0)
        update_permission_property(doc, "Ticket Initiator", 0, "write", 1)
        update_permission_property(doc, "Ticket Initiator", 0, "read", 1)
        update_permission_property(doc, "Ticket Initiator", 0, "create", 1)
        update_permission_property(doc, "Ticket Initiator", 0, "select", 1)
        update_permission_property(doc, "Ticket Initiator", 0, "delete", 1)
    frappe.db.commit()
