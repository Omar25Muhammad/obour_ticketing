
import frappe

def check_doc_permissions(doc, user):
    if doc.is_new():
        return True

    techniquies = frappe.get_list("Ticketing User Table", {"parent": doc.ticketing_group}, pluck="user_email")

    issue = frappe.get_doc("Issue", doc.name)
    assignments = list(issue.get_assigned_users())

    # if len(assignments) == 0:
    #     return False

    if user in assignments:
        return True
    else:
        return False