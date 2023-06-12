
import frappe

def check_doc_permissions(doc, user):
    techniquies = frappe.get_list("Ticketing User Table", {"parent": doc.ticketing_group}, pluck="user_email")
    issue = frappe.get_doc("Issue", doc.name)
    assignments = list(issue.get_assigned_users())

    if doc.is_new() or len(assignments) == 0 or user in assignments:
        return True
    else:
        return False

    # if len(assignments) == 0:
    #     return False