
import frappe

def get_permission_query_conditions(user):
    if user == "Administrator":
        return ""

    ticketing_group = frappe.get_all("Ticketing User Table", filters={"user_email": user}, pluck="parent")
    ticketing_group = ",".join(["'{}'".format(group) for group in ticketing_group])
    if ticketing_group:
        return """`tabIssue`.ticketing_group in ({})""".format(ticketing_group)
    else:
        roles = [r.role for r in frappe.get_doc("User", user).roles]
        if "Customer" in roles or "Ticket Initiator" in roles:
            return """`tabIssue`.owner = '{}'""".format(user)
        return "1=1"
