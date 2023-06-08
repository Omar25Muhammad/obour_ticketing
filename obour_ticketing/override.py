# Copyright (c) 2023, Eng. Omar M Shehada, ARD Co.
# For license information, please see license.txt

from erpnext.support.doctype.issue.issue import Issue
import frappe
from frappe.model.document import Document
from frappe import _
from frappe.utils import cint

class CustomIssue(Issue):
    """
    Defines a custom document class for Issue with an automatic email sending feature.

    This class inherits from the 'Document' class of the Frappe framework and extends the functionality of the 'Issue' class of the ERPNext application.
    It Adds the 'after_insert' method to senf an email notification to list of people defined in the Ticketing Group document when raising an issue.
    """
    def after_insert(self):
        group = frappe.get_doc('Ticketing Groups', self.ticketing_group)
        emails = []

        for technician in group.technicians:
            emails.append(technician.user_email)
            # frappe.sendmail(recipients=technician.user_email, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)

        for admin in group.administrator_data:
            emails.append(admin.admin_email)
            # frappe.sendmail(recipients=admin.admin_email, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)

        for supervisor in group.supervisor_data:
            emails.append(supervisor.supervisor_email)
            # frappe.sendmail(recipients=supervisor.supervisor_email, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)

        frappe.sendmail(recipients=emails, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)
        # With disapling delay of sending the email, this's gonna seem to be affected the speed of creating the document (Issue).


    def update_agreement_status(self):
        # Added By Omar
        group = frappe.get_doc('Ticketing Groups', self.ticketing_group)
        emails = []

        for admin in group.administrator_data:
            emails.append(admin.admin_email)
            # frappe.sendmail(recipients=admin.admin_email, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)

        for supervisor in group.supervisor_data:
            emails.append(supervisor.supervisor_email)
            # frappe.sendmail(recipients=supervisor.supervisor_email, subject='New Issue!', message=f'New Issue with ID: {self.name} has raised by {self.raised_by}', delayed=False)

        if self.service_level_agreement and self.agreement_status == "Ongoing":
            if (
                cint(frappe.db.get_value("Issue", self.name, "response_by_variance")) < 0
                or cint(frappe.db.get_value("Issue", self.name, "resolution_by_variance")) < 0
            ):

                self.agreement_status = "Failed"
                # Added by Eng. Omar
                frappe.sendmail(recipients=emails, subject='Failed Issue!', message=f'Issue with ID: {self.name} raised by {self.raised_by} has failed!', delayed=False)

            # End Added by Eng. Omar
        else:
            self.agreement_status = "Fulfilled"
            # Added by Eng. Omar
            frappe.sendmail(recipients=emails, subject='Fulfilled Issue!', message=f'Issue with ID: {self.name} raised by {self.raised_by} has Fulfilled!', delayed=False)


            # End Added by Eng. Omar