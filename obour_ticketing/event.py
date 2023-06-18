
import frappe

def get_permission_query_conditions(user):
    if user == "Administrator":
        return ""

    ticketing_group = frappe.get_all("Ticketing User Table", filters={"user_email": user}, pluck="parent")
    ticketing_group=",".join(["'{}'".format(item_group) for item_group in ticketing_group])
    if ticketing_group:
        return """`tabIssue`.ticketing_group in ({})""".format(ticketing_group)
    else:
        return "1=2"
