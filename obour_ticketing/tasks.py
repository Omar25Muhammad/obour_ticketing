
import frappe
import requests
import json
from frappe import _

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
            SELECT name, ticketing_group, priority, response_by, resolution_by, TIMESTAMPDIFF(HOUR, response_by, NOW()) response,
            TIMESTAMPDIFF(HOUR, resolution_by, NOW()) resolution
            FROM tabIssue WHERE status='Open'
            """, as_dict=True)

    # in values [0.25 => response time, 1 => resolution time]
    issue_priority = {
        "Critical": [0.25, 1],
        "High": [2, 8],
        "Medium": [12, 48],
        "Low": [42, 168]
    }

    if len(resp_issues):
        for issue in resp_issues:
            supervisors = frappe.get_all("Ticketing Supervisor Table", filters={"parent": issue.ticketing_group}, pluck="slack_url")
            admins = frappe.get_all("Ticketing Administrator Table", filters={"parent": issue.ticketing_group}, pluck="slack_url")
            recipents = supervisors + admins
            if issue.response_by:
                # send notification for supervisor & administrator
                if len(recipents) > 0:
                    if issue.response > issue_priority[issue.priority][0]:
                        send_recipents(recipents, issue, True)
                    if issue.resolution > issue_priority[issue.priority][1]:
                        send_recipents(recipents, issue, False)
                else:
                    pass
                    # frappe.msgprint(_("Please set Salck URL for Administrator/Supervisor in Group {} !".format(issue.ticketing_group)), alert=True)

def send_recipents(recipents, issue, is_response):
    for slack_url in recipents:
        if is_response:
            msg = f"Hello, Ticket With ID: {issue.name} without response!"
        else:
            msg = f"Hello, Ticket With ID: {issue.name} resolution time ended!"

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
