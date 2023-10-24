import frappe
import json
from frappe.core.doctype.file.file import remove_file_by_url
from frappe.rate_limiter import rate_limit
from frappe import _
import re
from frappe.utils import add_to_date, now
from frappe.website.render import clear_cache


def get_permission_query_conditions(user):
    if user == "Administrator":
        return ""

    user_ticketing_group = frappe.get_all(
        "Ticketing User Table", filters={"user_email": user}, pluck="parent"
    )
    user_ticketing_group = ",".join(
        ["'{}'".format(group) for group in user_ticketing_group]
    )

    super_ticketing_group = frappe.get_all(
        "Ticketing Supervisor Table", filters={"supervisor_email": user}, pluck="parent"
    )
    super_ticketing_group = ",".join(
        ["'{}'".format(group) for group in super_ticketing_group]
    )

    admin_ticketing_group = frappe.get_all(
        "Ticketing Administrator Table", filters={"admin_email": user}, pluck="parent"
    )
    admin_ticketing_group = ",".join(
        ["'{}'".format(group) for group in admin_ticketing_group]
    )

    roles = [r.role for r in frappe.get_doc("User", user).roles]

    conditions = []

    if user_ticketing_group:
        conditions.append(
            "`tabIssue`.ticketing_group in ({})".format(user_ticketing_group)
        )

    if super_ticketing_group:
        conditions.append(
            "`tabIssue`.ticketing_group in ({})".format(super_ticketing_group)
        )

    if admin_ticketing_group:
        conditions.append(
            "`tabIssue`.ticketing_group in ({})".format(admin_ticketing_group)
        )

    if "Customer" in roles or "Ticket Initiator" in roles:
        conditions.append("`tabIssue`.owner = '{}'".format(user))

    if conditions:
        return " OR ".join(conditions)
    else:
        return "1=1"


@frappe.whitelist(allow_guest=True)
@rate_limit(key="web_form", limit=5, seconds=60, methods=["POST"])
def accept(web_form, data, for_payment=False):
    """Save the web form"""
    """overrides => allow upload multi files in issue webform in attachment child table"""
    data = frappe._dict(json.loads(data))
    for_payment = frappe.parse_json(for_payment)

    files = []
    files_to_delete = []

    web_form = frappe.get_doc("Web Form", web_form)
    doctype = web_form.doc_type

    if data.name and not web_form.allow_edit:
        frappe.throw(_("You are not allowed to update this Web Form Document"))

    frappe.flags.in_web_form = True
    meta = frappe.get_meta(doctype)

    if data.name:
        # update
        doc = frappe.get_doc(doctype, data.name)
    else:
        # insert
        doc = frappe.new_doc(doctype)

    # set values
    for field in web_form.web_form_fields:
        fieldname = field.fieldname
        df = meta.get_field(fieldname)
        value = data.get(fieldname, None)

        if df and df.fieldtype in ("Attach", "Attach Image"):
            if value and "data:" and "base64" in value:
                files.append((fieldname, value))
                if not doc.name:
                    doc.set(fieldname, "")
                continue

            elif not value and doc.get(fieldname):
                files_to_delete.append(doc.get(fieldname))

        if (
            doctype == "Issue"
            and field.fieldtype == "Table"
            and fieldname == "attachment"
        ):
            for row in value:
                doc.append("attachments", {"attachment": row.get("attachment")})

        else:
            doc.set(fieldname, value)

    if for_payment:
        web_form.validate_mandatory(doc)
        doc.run_method("validate_payment")

    if doc.name:
        if web_form.has_web_form_permission(doctype, doc.name, "write"):
            doc.save(ignore_permissions=True)
        else:
            # only if permissions are present
            doc.save()

    else:
        # insert
        if web_form.login_required and frappe.session.user == "Guest":
            frappe.throw(_("You must login to submit this form"))

        ignore_mandatory = True if files else False

        doc.insert(ignore_permissions=True, ignore_mandatory=ignore_mandatory)

    # add files
    if files:
        for f in files:
            fieldname, filedata = f

            # remove earlier attached file (if exists)
            if doc.get(fieldname):
                remove_file_by_url(doc.get(fieldname), doctype=doctype, name=doc.name)

            # save new file
            filename, dataurl = filedata.split(",", 1)
            _file = frappe.get_doc(
                {
                    "doctype": "File",
                    "file_name": filename,
                    "attached_to_doctype": doctype,
                    "attached_to_name": doc.name,
                    "content": dataurl,
                    "decode": True,
                }
            )
            _file.save()

            # update values
            doc.set(fieldname, _file.file_url)

        doc.save(ignore_permissions=True)

    if files_to_delete:
        for f in files_to_delete:
            if f:
                remove_file_by_url(f, doctype=doctype, name=doc.name)

    frappe.flags.web_form_doc = doc

    if for_payment:
        return web_form.get_payment_gateway_url(doc)
    else:
        return doc


@frappe.whitelist(allow_guest=True)
def add_comment(
    comment, comment_email, comment_by, reference_doctype, reference_name, route
):
    doc = frappe.get_doc(reference_doctype, reference_name)

    if frappe.session.user == "Guest" and doc.doctype not in ["Blog Post", "Web Page"]:
        return

    if not comment.strip():
        frappe.msgprint(_("The comment cannot be empty"))
        return False

    if not reference_doctype == "Issue":
        url_regex = re.compile(
            r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
            re.IGNORECASE,
        )
        email_regex = re.compile(
            r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)", re.IGNORECASE
        )

        if url_regex.search(comment) or email_regex.search(comment):
            frappe.msgprint(_("Comments cannot have links or email addresses"))
            return False

    comments_count = frappe.db.count(
        "Comment",
        {
            "comment_type": "Comment",
            "comment_email": comment_email,
            "creation": (">", add_to_date(now(), hours=-1)),
        },
    )

    if comments_count > 20:
        frappe.msgprint(
            _("Hourly comment limit reached for: {0}").format(
                frappe.bold(comment_email)
            )
        )
        return False

    comment = doc.add_comment(
        text=comment, comment_email=comment_email, comment_by=comment_by
    )

    comment.db_set("published", 1)

    # since comments are embedded in the page, clear the web cache
    if route:
        clear_cache(route)

    content = (
        comment.content
        + "<p><a href='{0}/app/Form/Comment/{1}' style='font-size: 80%'>{2}</a></p>".format(
            frappe.utils.get_request_site_address(), comment.name, _("View Comment")
        )
    )

    # notify creator
    frappe.sendmail(
        recipients=frappe.db.get_value("User", doc.owner, "email") or doc.owner,
        subject=_("New Comment on {0}: {1}").format(doc.doctype, doc.name),
        message=content,
        reference_doctype=doc.doctype,
        reference_name=doc.name,
    )

    # revert with template if all clear (no backlinks)
    template = frappe.get_template("templates/includes/comments/comment.html")
    return template.render({"comment": comment.as_dict()}), comment.as_dict()
