
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

@frappe.whitelist()
def reassign_users(docname):
    issue = frappe.get_doc("Issue", docname)

    if len(issue.get_assigned_users()) == 0:
        ticketing_group = frappe.get_doc("Ticketing Groups", issue.ticketing_group)
        recipients = []

        if len(ticketing_group.administrator_data):
            for admin in ticketing_group.administrator_data:
                recipients.append(admin.admin_email)

        if len(ticketing_group.supervisor_data):
            for supervisor in ticketing_group.supervisor_data:
                recipients.append(supervisor.supervisor_email)

        if len(recipients):
            frappe.sendmail(
                recipients=recipients,
                subject="Issue Un Assigned !",
                message="Issue: {} Has no Technicians Assignment!".format(frappe.bold(issue.name))
            )

@frappe.whitelist()
def get_customer(user):
    if not user:
        user = frappe.session.user

    if user == "Administrator":
        return False

    from frappe.contacts.doctype.contact.contact import get_contact_name
    contact_name = get_contact_name(user)
    
    if contact_name:
        customer = frappe.get_all("Customer", {"customer_primary_contact": contact_name}, pluck="customer_name", limit=1)
        if len(customer):
            return customer [0]
    return False
