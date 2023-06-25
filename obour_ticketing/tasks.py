
import frappe
import requests
import json
from frappe import _
from frappe.utils import add_to_date, now_datetime, today

def auto_close_tickets():
    """Auto-close Resolved support tickets after 3 days"""
    auto_close_after_days = (
        frappe.db.get_value("Support Settings", "Support Settings", "close_issue_after_days") or 3
    )

    issues = frappe.db.sql(""" 
            SELECT name FROM tabIssue
            WHERE status='Resolved'
            AND modified<DATE_SUB(CURDATE(), INTERVAL %s DAY)
        """,
        (auto_close_after_days),
        as_dict=True,
    )

    for issue in issues:
        doc = frappe.get_doc("Issue", issue.get("name"))
        doc.status = "Closed"
        doc.flags.ignore_permissions = True
        doc.flags.ignore_mandatory = True
        doc.save()

    frappe.db.commit()

def send_slack_notification():
    resp_issues = frappe.db.sql("""
        SELECT iss.name, iss.ticketing_group, iss.priority, iss.service_level_agreement,
            slap.notify_resolution_time, slap.notify_response_time,
            iss.response_by_variance, iss.response_by, iss.resolution_by_variance, iss.resolution_by
        FROM tabIssue iss
        LEFT JOIN `tabService Level Priority` slap
            ON iss.service_level_agreement=slap.parent
            AND iss.priority=slap.priority
        WHERE iss.status='Open'
        """, as_dict=True)

    if len(resp_issues):
        for issue in resp_issues:
            if not issue.service_level_agreement: continue
            sla = frappe.get_doc("Service Level Agreement", issue.service_level_agreement)
            issue_priority = {}
            if not sla: continue
            if len(sla.priorities) == 0: continue
            for row in sla.priorities:
                # in values [0.25 => response time, 1 => resolution time]
                issue_priority[row.priority] = [row.notify_response_time, row.notify_resolution_time]
            if not issue_priority: continue
            response_time = add_to_date(issue.response_by, hours=issue.notify_response_time)
            resolution_time = add_to_date(issue.resolution_by, hours=issue.notify_resolution_time)

            if response_time >= now_datetime():
                supervisors = frappe.get_all("Ticketing Supervisor Table", filters={"parent": issue.ticketing_group}, pluck="slack_url")
                if len(supervisors) > 0:
                    send_recipents(supervisors, issue, True)

            if resolution_time >= now_datetime():
                admins = frappe.get_all("Ticketing Administrator Table", filters={"parent": issue.ticketing_group}, pluck="slack_url")
                if len(admins) > 0:
                    send_recipents(admins, issue, False)

def send_recipents(recipents, issue, is_response):
    for slack_url in recipents:
        if is_response:
            msg = f"Hello, Ticket With ID: {issue.name} without response since {now()}!"
        else:
            msg = f"Hello, Ticket With ID: {issue.name} resolution time ended since {now()}!"

        send(slack_url, msg)

def send(slack_url, msg):
    payload = {"text": msg}
    headers = {"Content-type": "application/json"}
    response = requests.post(slack_url, data=json.dumps(payload), headers=headers)
    # Check the response status
    if response.status_code == 200:
        frappe.msgprint(_("Message sent successfully to Slack!"), alert=True)
    else:
        frappe.msgprint(_("Failed to send message to Slack. Status code: {}".format(response.status_code)), alert=True)

def ticket_summary():
    """send daily summary about ticket"""
    tickets = frappe.db.sql("""
        SELECT COUNT(iss.name) as total, iss.ticketing_group, iss.status, tg.reporting_to
        FROM tabIssue iss
        LEFT JOIN `tabTicketing Groups` tg ON tg.name=iss.ticketing_group
        WHERE DATE(iss.creation)='{}'
        GROUP BY iss.ticketing_group, iss.status
    """.format(today()), as_dict=True)

    if any(tickets):
        for ticket in tickets:
            frappe.sendmail(
                recipients = [ticket.reporting_to],
                subject    = f"Daily {ticket.status} Ticket Report",
                message    = f"You Have a {ticket.total} tickets {ticket.status} today"
            )
