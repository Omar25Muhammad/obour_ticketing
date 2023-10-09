# Copyright (c) 2023, ARD and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _
from obour_ticketing.api import detect_duplicates


class TicketingGroups(Document):
    def validate(self):
        tables = {
            "technicians": "user_email",
            "supervisor_data": "supervisor_email",
            "administrator_data": "admin_email",
        }
        for table, email_field in tables.items():
            detect_duplicates(getattr(self, table), email_field)

        # detect_duplicates(self.technicians, "user_email", "Users can' be duplicated!")
