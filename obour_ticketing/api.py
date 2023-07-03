
import frappe
from frappe.utils import cint, get_url_to_form
from frappe import sendmail, _
from frappe.desk.form.assign_to import add
from obour_ticketing.tasks import send

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
                message="Issue: {} Has no Technicians Assignment!".format(frappe.bold(issue.name)),
                delayed=False
            )
    if len(ticketing_group.supervisor_data):
        supervisor = ticketing_group.supervisor_data[0].supervisor_email or ""
        supervisor_slack_url = [d.slack_url for d in ticketing_group.supervisor_data]

        if frappe.db.exists("User", supervisor):
            args = {
                "assign_to": [supervisor],
                "doctype": "Issue",
                "name": issue.name,
                "description": "Escalate ....",
            }
            add(args)

        if len(supervisor_slack_url):
            for row in supervisor_slack_url:
                msg = f"Issue : {docname} Escalate to you ..."
                send(row, msg)
        else:
            frappe.msgprint(_("Supervisor {} does not exists").format(frappe.bold(supervisor)))

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

def check_priority_and_type(doc, method):
    """create a priority or type if not exists"""
    if doc.priority:
        if not frappe.db.exists("Issue Priority", doc.priority):
            issue_priority = frappe.new_doc("Issue Priority")
            issue_priority.name = doc.priority
            issue_priority.flags.ignore_permissions = True
            issue_priority.save()
            frappe.db.commit()
    if doc.issue_type:
        if not frappe.db.exists("Issue Type", doc.issue_type):
            issue_type = frappe.new_doc("Issue Type")
            issue_type.__newname = doc.issue_type
            issue_type.flags.ignore_permissions = True
            issue_type.save()
            frappe.db.commit()
    
    # set raised by field = current user
    doc.raised_by = frappe.session.user

def send_email_issue_initiator(doc, method):
    """send email for issue initiator 'customer' after create issue"""
    if cint(doc.via_customer_portal):
        sendmail(
            recipients=[frappe.session.user],
            subject="Your Ticket has Opened in system",
            message="Test Message",
            delayed=False
        )

def send_email_ticket_group(doc, method):
    """send email for all users in the ticket group"""
    recipients = get_recipients(doc)
    if len(recipients) > 0:
        sendmail(
            recipients=recipients,
            subject="New Ticket was Opened {0} for {1} Ticket Group".format(doc.name, doc.ticketing_group),
            message="Test Message"
        )

def send_email_issue_status(doc, method):
    """send email when issue status is changed for ticketing group and initiator user"""
    if not doc.get_doc_before_save():
        return

    prev_status = doc.get_doc_before_save().status
    current_status = doc.status
    subject = ""
    message = ""
    recipients = get_recipients(doc)
    if doc.raised_by:
        recipients.append(doc.raised_by)

    # case: user decline the ticket 
    if prev_status in ("Closed", "Resolved") and current_status == "In Progress":
        subject = "Ticket Declined"
        message = "Ticket {0} is Declined".format(doc.name)

    elif current_status != prev_status and prev_status != "Closed":

        if current_status == "Resolved":
            subject = "Ticket Resolved"
            message = "Ticket {0} is Resolved".format(doc.name)

        elif current_status == "Closed":
            subject = "Ticket Closed"
            message = "Ticket {0} is Closed".format(doc.name)


    if subject and message and len(recipients) > 0:
        sendmail(
            recipients=recipients,
            subject=subject,
            message=message,
            delayed=False
        )

def send_notification(doc, method):
    if not doc.get_doc_before_save():
        return
    prev_status = doc.get_doc_before_save().status
    current_status = doc.status
    prev_priority = doc.get_doc_before_save().priority
    current_priority = doc.priority
    recipients = get_recipients(doc)
    doc_link = get_url_to_form("Issue", doc.name)
    url = frappe.db.get_value("Ticketing Groups", doc.ticketing_group, "slack_url")
    msg = ""

    if prev_status != current_status:
        msg = f"""
            Ticket <b>{doc.name} </b>: Status Changed <br> From <b>{prev_status}</b> to <b>{current_status}</b>
            """
        create_notification_log(recipients, msg, doc, doc_link)
        # send slack notification 
        if url:
            send(url, msg)
    if prev_priority != current_priority:
        msg = f"""
            Ticket <b>{doc.name} </b>: priority Changed <br> From <b>{prev_priority}</b> to <b>{current_priority}</b>
            """
        create_notification_log(recipients, msg, doc, doc_link)
        # send slack notification 
        if url:
            send(url, msg)

def send_slack_notification(doc, method):
    url = frappe.db.get_value("Ticketing Groups", doc.ticketing_group, "slack_url")
    if not url:
        frappe.msgprint(_("Failed to send message to Slack. Please Set Slack Webhook URL in Group"), alert=True)
        return

    msg = f"Ticket: {doc.name} updated ... "
    send(url, msg)

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
    context["favicon"]       = "/assets/obour_ticketing/img/favico.png"
    context["banner_image"]  = "/assets/obour_ticketing/img/logo.png"

def get_recipients(doc):
    recipients = []
    technicians = frappe.get_all("Ticketing User Table", filters={"parent": doc.ticketing_group}, pluck="user_email")
    supervisors = frappe.get_all("Ticketing Supervisor Table", filters={"parent": doc.ticketing_group}, pluck="supervisor_email")
    admins = frappe.get_all("Ticketing Administrator Table", filters={"parent": doc.ticketing_group}, pluck="admin_email")

    recipients = technicians + supervisors + admins
    if doc.raised_by:
        recipients.append(doc.raised_by)
    recipients = list(set(recipients))
    return recipients

def add_ticket_role(doc, method):
    """Add ticket initiator role to new users"""
    if frappe.db.exists("Role", "Ticket Initiator"):
        doc.add_roles("Ticket Initiator")
        doc.save()
        frappe.db.commit()

def create_notification_log(recipients, msg, doc, doc_link):
    for user in recipients:
        if not frappe.db.exists("User", user):
            continue
        if user.lower() == "administrator":
            continue
        notify_log = frappe.new_doc("Notification Log")
        notify_log.subject = msg
        notify_log.for_user = user
        notify_log.type = "Alert"
        notify_log.email_content = f"""<a href="{doc_link}" style="cursor: pointer">{doc.name}</a>"""
        notify_log.insert(ignore_permissions=True)
