
import frappe
from frappe.utils import cint
from frappe import sendmail

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

def check_priority(doc, method):
    """create a priority if not exists"""

    if not frappe.db.exists("Issue Priority", doc.priority):
        issue_priority = frappe.new_doc("Issue Priority")
        issue_priority.name = doc.priority
        issue_priority.flags.ignore_permissions = True
        issue_priority.save()
        frappe.db.commit()

def send_email_issue_initiator(doc, method):
    """send email for issue initiator 'customer' after create issue"""
    if cint(doc.via_customer_portal):
        sendmail(
            recipients=[frappe.session.user],
            subject="New Ticket was Opened",
            message="Test Message"
        )

def update_website_context(context):
    portal_items = [
    {
        "title": "Issues",
		"route": "/issues",
		"reference_doctype": "Issue",
		"role": "Ticket Initiator"
    }
]
    context["sidebar_items"] = portal_items
    context["splash_image"]  = "/assets/obour_ticketing/img/logo.png"
    context["favicon"]       = "/assets/obour_ticketing/img/logo.png"
    context["banner_image"]  = "/assets/obour_ticketing/img/logo.png"