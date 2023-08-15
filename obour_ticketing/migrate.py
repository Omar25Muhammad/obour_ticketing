
import frappe

def after_migrate():
    set_support_settings()
    set_portal_settings()

def set_support_settings():
    if frappe.db.get_single_value("Support Settings", "close_issue_after_days") != 3:
        frappe.db.set_single_value("Support Settings", "close_issue_after_days", 3)
        frappe.db.commit()

def set_portal_settings():
    if not frappe.db.get_single_value("Portal Settings", "hide_standard_menu"):
        frappe.db.set_single_value("Portal Settings", "hide_standard_menu", 1)
        frappe.db.commit()
