# Copyright (c) 2023, Eng. Omar M Shehada, ARD Co.
# For license information, please see license.txt

from erpnext.support.doctype.issue.issue import Issue
from frappe.website.doctype.web_form.web_form import WebForm
from frappe.email.doctype.email_queue.email_queue import EmailQueue
import frappe
from frappe import _
from frappe.utils import cint, escape_html
from bs4 import BeautifulSoup
from frappe.desk.form.load import get_attachments
from obour_ticketing.tasks import reload_page, get_assignees, clear_field_assign_to
from obour_ticketing.api import send_email_ticket_group, send_mails


class CustomIssue(Issue):
    """
    Defines a custom document class for Issue with an automatic email sending feature.
    This class inherits from the 'Document' class of the Frappe framework and extends the functionality of the 'Issue' class of the ERPNext application.
    It Adds the 'after_insert' method to senf an email notification to list of people defined in the Ticketing Group document when raising an issue.
    """

    def validate(self):
        # print(f"\n\n\n\n{frappe.get_doc('Issue', self.name)._assign}\n\n\n\n")

        prev_status = frappe.db.get_value("Issue", self.name, "status")
        if self.status == "Closed" and prev_status != "Closed":
            self.db_set("agreement_status", "Fulfilled")
        # else:
        #     self.db_set("agreement_status", "Ongoing")
        # self.add_status_reason()
        super().validate()
        old_assign_to = frappe.db.get_value(
            self.doctype, self.name, "assign_to", self.assign_to
        )
        new_assign_to = self.assign_to
        if old_assign_to != new_assign_to:
            frappe.publish_realtime(event="reload_doc")

    def before_save(self):
        if not self.is_new():
            old_ticketing_group = frappe.db.get_value(
                self.doctype, self.name, "ticketing_group", self.ticketing_group
            )
            new_ticketing_group = self.ticketing_group

            if old_ticketing_group != new_ticketing_group:
                get_assignees(self.name)
                # clear_field_assign_to(self.name)
                self.assign_to = ""
                self.assign_to_full_name = ""
                self.status = "Un Assigned"
                self.custom_reset_sla(
                    reason=f"Changing Department from {frappe.bold(old_ticketing_group)} to {frappe.bold(new_ticketing_group)}"
                )
                send_email_ticket_group(frappe.get_doc("Issue", self.name), "")
                frappe.publish_realtime(event="reset_sla_omar")

    def on_update(self):
        super().on_update()
        old_ticketing_group = frappe.db.get_value(
            self.doctype, self.name, "ticketing_group", self.ticketing_group
        )
        new_ticketing_group = self.ticketing_group
        # frappe.msgprint(f"Old: {old_ticketing_group}")
        # frappe.msgprint(f"New: {new_ticketing_group}")
        if old_ticketing_group:
            if (
                self.modified_by not in {self.raised_by, "Administrator"}
                and self.status == "Un Assigned"
                and old_ticketing_group == new_ticketing_group
            ):
                # self.status = "Open"
                frappe.db.set_value(self.doctype, self.name, "status", "Open")
                frappe.db.commit()
                frappe.publish_realtime(event="reload_doc")
        else:
            if (
                self.modified_by not in {self.raised_by, "Administrator"}
                and self.status == "Un Assigned"
            ):
                # self.status = "Open"
                frappe.db.set_value(self.doctype, self.name, "status", "Open")
                frappe.db.commit()
                frappe.publish_realtime(event="reload_doc")

    # def after_save(self):
    #     old_assign_to = frappe.db.get_value(
    #         self.doctype, self.name, "assign_to", self.assign_to
    #     )
    #     new_assign_to = self.assign_to
    #     if old_assign_to != new_assign_to:
    #         frappe.publish_realtime(event="reload_doc")

    @frappe.whitelist()
    def custom_reset_sla(self, reason):
        if not frappe.db.get_single_value(
            "Support Settings", "allow_resetting_service_level_agreement"
        ):
            frappe.throw(
                _("Allow Resetting Service Level Agreement from Support Settings.")
            )

        frappe.get_doc(
            {
                "doctype": "Comment",
                "comment_type": "Info",
                "reference_doctype": self.doctype,
                "reference_name": self.name,
                "comment_email": frappe.session.user_email,
                "content": "resetted Service Level Agreement - {0}".format(_(reason)),
            }
        ).insert(ignore_permissions=True)

        self.service_level_agreement_creation = frappe.utils.now_datetime()
        super().set_response_and_resolution_time(
            priority=self.priority, service_level_agreement=self.service_level_agreement
        )
        self.agreement_status = "Ongoing"

        frappe.msgprint("SLA reset successfully!")
        # self.save()

    # frm.call("reset_service_level_agreement", {
    # 	reason: values.reason,
    # 	user: frappe.session.user_email
    # }, () => {
    # 	reset_sla.enable_primary_action();
    # 	frm.refresh();
    # 	frappe.msgprint(__("Service Level Agreement was reset."));
    # });

    def update_agreement_status(self):
        # Added By Omar
        group = frappe.get_doc("Ticketing Groups", self.ticketing_group)
        emails = []

        for admin in group.administrator_data:
            emails.append(admin.admin_email)

        for supervisor in group.supervisor_data:
            emails.append(supervisor.supervisor_email)

        if self.service_level_agreement and self.agreement_status == "Ongoing":
            if (
                cint(frappe.db.get_value("Issue", self.name, "response_by_variance"))
                < 0
                or cint(
                    frappe.db.get_value("Issue", self.name, "resolution_by_variance")
                )
                < 0
            ):
                # self.agreement_status = "Failed"
                # # Added by Eng. Omar
                # if len(emails) > 0:
                #     frappe.sendmail(
                #         recipients=emails,
                #         subject="Failed Issue!",
                #         message=f"Issue with ID: {self.name} raised by {self.raised_by} has failed!",
                #         delayed=False,
                #     )
                ...

            # End Added by Eng. Omar
        else:
            self.agreement_status = "Fulfilled"
            # Added by Eng. Omar
            if len(emails) > 0:
                frappe.sendmail(
                    recipients=emails,
                    subject="Fulfilled Issue!",
                    message=f"Issue with ID: {self.name} raised by {self.raised_by} has Fulfilled!",
                    delayed=False,
                )

            # End Added by Eng. Omar

    def create_communication(self):
        communication = frappe.new_doc("Communication")
        communication.update(
            {
                "communication_type": "Communication",
                "communication_medium": "Email",
                "sent_or_received": "Received",
                "email_status": "Open",
                "subject": self.subject,
                "sender": self.raised_by,
                "content": self.description,
                "status": "Linked",
                "reference_doctype": "Issue",
                "reference_name": self.name,
            }
        )
        communication.flags.ignore_permissions = True
        communication.flags.ignore_mandatory = True
        communication.save()

    def add_status_reason(self):
        prev_table = cint(
            frappe.db.count("Track Issue Status", {"parent": self.name})
        )  # len(frappe.db.get_doc("Issue", self.name).issue_status_reasons)
        if self.has_value_changed("status") and not self.is_new():
            if prev_table == len(self.issue_status_reasons):
                frappe.throw(_("Please Add Reason in Track Issue Status table"))
                return False


class CustomWebForm(WebForm):
    def load_document(self, context):
        """Load document `doc` and `layout` properties for template"""
        if frappe.form_dict.name or frappe.form_dict.new:
            context.layout = self.get_layout()
            context.parents = [{"route": self.route, "label": _(self.title)}]

        if frappe.form_dict.name:
            context.doc = frappe.get_doc(self.doc_type, frappe.form_dict.name)
            context.title = context.doc.get(context.doc.meta.get_title_field())
            context.doc.add_seen()

            context.reference_doctype = context.doc.doctype
            context.reference_name = context.doc.name

            if self.show_attachments:
                context.attachments = frappe.get_all(
                    "File",
                    filters={
                        "attached_to_name": context.reference_name,
                        "attached_to_doctype": context.reference_doctype,
                        "is_private": 0,
                    },
                    fields=["file_name", "file_url", "file_size"],
                )

            if self.allow_comments:
                from frappe.website.utils import get_comment_list

                if context.doc.doctype == "Issue":
                    comments = self.get_comments(context.doc.doctype, context.doc.name)
                else:
                    comments = get_comment_list(context.doc.doctype, context.doc.name)

                context.comment_list = comments

    def get_comments(self, doctype, name):
        comments = frappe.get_all(
            "Comment",
            fields=[
                "name",
                "creation",
                "owner",
                "comment_email",
                "comment_by",
                "content",
            ],
            filters=dict(
                reference_doctype=doctype,
                reference_name=name,
                comment_type="Comment",
            ),
            or_filters=[
                ["owner", "=", frappe.session.user],
                ["published", "=", 1],
                ["send_to_portal", "=", 1],
            ],
        )

        for row in comments:
            extract_imgs_and_p(row)

        communications = frappe.get_all(
            "Communication",
            fields=[
                "name",
                "creation",
                "owner",
                "owner as comment_email",
                "sender_full_name as comment_by",
                "content",
                "recipients",
            ],
            filters=dict(
                reference_doctype=doctype,
                reference_name=name,
            ),
            or_filters=[
                ["recipients", "like", "%{0}%".format(frappe.session.user)],
                ["cc", "like", "%{0}%".format(frappe.session.user)],
                ["bcc", "like", "%{0}%".format(frappe.session.user)],
            ],
        )

        return sorted(
            (comments + communications),
            key=lambda comment: comment["creation"],
            reverse=True,
        )


@frappe.whitelist(allow_guest=True)
def sign_up(email, full_name, redirect_to):
    from frappe.website.utils import is_signup_disabled

    if is_signup_disabled():
        frappe.throw(_("Sign Up is disabled"), title=_("Not Allowed"))

    """ prevent sign up  if email domain in restricted domains"""
    issue_sett = frappe.get_doc("Issue Settings")
    if len(issue_sett.restricted_domains):
        restricted_domains = frappe.get_all("Restricted Domain", pluck="domain")
        domain = email.split("@")[1]
        if domain in restricted_domains:
            return 0, _(f"Domain {domain} Restricted by Admin")

    """  """
    user = frappe.db.get("User", {"email": email})
    if user:
        if user.enabled:
            return 0, _("Already Registered")
        else:
            return 0, _("Registered but disabled")
    else:
        if frappe.db.get_creation_count("User", 60) > 300:
            frappe.respond_as_web_page(
                _("Temporarily Disabled"),
                _(
                    "Too many users signed up recently, so the registration is disabled. Please try back in an hour"
                ),
                http_status_code=429,
            )

        from frappe.utils import random_string

        user = frappe.get_doc(
            {
                "doctype": "User",
                "email": email,
                "first_name": escape_html(full_name),
                "enabled": 1,
                "new_password": random_string(10),
                "user_type": "Website User",
            }
        )
        user.flags.ignore_permissions = True
        user.flags.ignore_password_policy = True
        user.insert()

        # set default signup role as per Portal Settings
        default_role = frappe.db.get_value("Portal Settings", None, "default_role")
        if default_role:
            user.add_roles(default_role)

        if redirect_to:
            frappe.cache().hset("redirect_after_login", user.name, redirect_to)

        if user.flags.email_sent:
            return 1, _("Please check your email for verification")
        else:
            return 2, _("Please ask your administrator to verify your sign-up")


def extract_imgs_and_p(row):
    row["attachments"] = get_attachments("Comment", row.name)
    soup = BeautifulSoup(row.content, "html.parser")
    p_tags = soup.find_all("p")
    img_tags = soup.find_all("img")

    for img_tag in img_tags:
        src_value = img_tag.get("src", "")
        if not src_value:
            continue
        row.attachments.append({"file_url": src_value})

    row["content"] = ""
    for p in p_tags:
        row["content"] += p.get_text()
        return row.content, row.attachments


class CustomEmailQueue(EmailQueue):
    def db_insert(self):
        send_mails()
