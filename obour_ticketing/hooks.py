from . import __version__ as app_version

app_name = "obour_ticketing"
app_title = "Obour Ticketing"
app_publisher = "ARD"
app_description = "Ticketing stuff"
app_icon = "octicon octicon-file-directory"
app_color = "red"
app_email = "o.shehada@ard.ly"
app_license = "Copyright"

# Includes in <head>
# ------------------

update_website_context = [
	"obour_ticketing.api.update_website_context",
]

fixtures = [
    "Issue Type",
    {
        "dt": "Role",
        "filters": [
            ["name", "in", ["Ticket Initiator"]]
		]
	},
    {
        "dt": "Custom Field",
        "filters": [
            [
                "name",
                "in",
                [
					"Issue-ticketing_group",
                    "Service Level Priority-notify_response_time",
                    "Service Level Priority-notify_resolution_time",
                    "Issue-status_sb",
                    "Issue-response_status",
                    "Issue-column_break_dgcxb",
                    "Issue-resolution_status",
                    "Issue-attachment_sb",
                    "Issue-attachments"
                ]
            ]
        ]
  	},
    {
        "dt": "Property Setter",
        "filters": [
            [
                "name",
                "in",
                [
					"Issue-main-quick_entry",
					"Issue-status-options",
					"Portal Settings-hide_standard_menu-default",
					"Support Settings-close_issue_after_days-default",
					"ToDo-priority-options"
                ]
            ]
        ]
  	}
]


# include js, css files in header of desk.html
# app_include_css = "/assets/obour_ticketing/css/obour_ticketing.css"
app_include_js = "/assets/obour_ticketing/js/assign_to.js"

# include js, css files in header of web template
# web_include_css = "/assets/obour_ticketing/css/obour_ticketing.css"
# web_include_js = "/assets/obour_ticketing/js/obour_ticketing.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "obour_ticketing/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Issue" : "public/js/issue.js"
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Migration
after_migrate = "obour_ticketing.migrate.after_migrate"
# Installation
# ------------

# before_install = "obour_ticketing.install.before_install"
after_install = "obour_ticketing.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "obour_ticketing.uninstall.before_uninstall"
# after_uninstall = "obour_ticketing.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "obour_ticketing.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

permission_query_conditions = {
	"Issue": "obour_ticketing.event.get_permission_query_conditions",
}
#

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
	# "ToDo": "custom_app.overrides.CustomToDo",
	"Issue": "obour_ticketing.override.CustomIssue",
    "Web Form": "obour_ticketing.override.CustomWebForm"
}

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    "Issue": {
        "before_insert": "obour_ticketing.api.check_priority_and_type",
        "after_insert": [
                    	"obour_ticketing.api.send_email_issue_initiator",
                        "obour_ticketing.api.send_email_ticket_group"
                        ],
        "on_update": [
                        "obour_ticketing.api.send_email_issue_status",
                        "obour_ticketing.api.send_notification",
                        "obour_ticketing.api.send_slack_notification",
                    ],
	},
    "User": {
        "after_insert": "obour_ticketing.api.add_ticket_role",
	},
    "Web Form": {
        "on_update": "obour_ticketing.api.set_file_max_size"
    }
}

# Scheduled Tasks
# ---------------

scheduler_events = {
# 	"all": [
# 		"obour_ticketing.tasks.all"
# 	],
	"daily": [
		"obour_ticketing.tasks.auto_close_tickets"
	],
    "cron": {
        "0/15 * * * *": [
			"obour_ticketing.tasks.send_slack_notification",
            "obour_ticketing.tasks.set_response_resolution_status"
		],
        "0 23 * * *": [
            "obour_ticketing.tasks.ticket_summary"
		]
	}
# 	"weekly": [
# 		"obour_ticketing.tasks.weekly"
# 	]
# 	"monthly": [
# 		"obour_ticketing.tasks.monthly"
# 	]
}

# Testing
# -------

# before_tests = "obour_ticketing.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	"frappe.website.doctype.web_form.web_form.accept": "obour_ticketing.event.accept",
    "frappe.templates.includes.comments.comments.add_comment": "obour_ticketing.event.add_comment",
    "frappe.core.doctype.user.user.sign_up": "obour_ticketing.override.sign_up"
}

#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "obour_ticketing.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "{doctype_1}",
		"filter_by": "{filter_by}",
		"redact_fields": ["{field_1}", "{field_2}"],
		"partial": 1,
	},
	{
		"doctype": "{doctype_2}",
		"filter_by": "{filter_by}",
		"partial": 1,
	},
	{
		"doctype": "{doctype_3}",
		"strict": False,
	},
	{
		"doctype": "{doctype_4}"
	}
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"obour_ticketing.auth.validate"
# ]

# Translation
# --------------------------------

# Make link fields search translated document names for these DocTypes
# Recommended only for DocTypes which have limited documents with untranslated names
# For example: Role, Gender, etc.
# translated_search_doctypes = []
