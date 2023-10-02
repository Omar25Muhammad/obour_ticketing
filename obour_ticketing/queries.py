import frappe


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def filter_based_on_role(doctype, txt, searchfield, start, page_len, filters):
    """
    Filter users on specific roles
    """

    role = filters.get("role")

    query = f"""
        SELECT parent
        FROM `tabHas Role`
        WHERE role = '{role}'
        AND parenttype = 'User'
        AND parent != 'Administrator'
        AND parent LIKE '%{txt}%';
        """

    return frappe.db.sql(query)


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def filter_assign_to_users(doctype, txt, searchfield, start, page_len, filters):
    """ """

    # role = filters.get("role")
    ticketing_group = filters.get("ticketing_group")

    query = f"""
    SELECT user_email, user_name
    FROM `tabTicketing User Table`
    WHERE parent='{ticketing_group}'
    AND 
    (user_email LIKE '%{txt}%'
    OR user_name LIKE '%{txt}%');
    """

    return frappe.db.sql(query)


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def filter_assign_to_admins(doctype, txt, searchfield, start, page_len, filters):
    """ """

    # role = filters.get("role")
    ticketing_group = filters.get("ticketing_group")

    query = f"""
        SELECT user_email, user_name
        FROM `tabTicketing User Table`
        WHERE parent='{ticketing_group}'
        AND 
        (user_email LIKE '%{txt}%'
        OR user_name LIKE '%{txt}%')
        UNION
        SELECT supervisor_email, supervisor_name
        FROM `tabTicketing Supervisor Table` 
        WHERE parent='{ticketing_group}'
        AND 
        (supervisor_email LIKE '%{txt}%'
        OR supervisor_name LIKE '%{txt}%')
        UNION
        SELECT admin_email, admin_name
        FROM `tabTicketing Administrator Table` 
        WHERE parent='{ticketing_group}'
        AND 
        (admin_email LIKE '%{txt}%'
        OR admin_name LIKE '%{txt}%');
    """

    return frappe.db.sql(query)


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def filter_assign_to_supers(doctype, txt, searchfield, start, page_len, filters):
    """ """

    # role = filters.get("role")
    ticketing_group = filters.get("ticketing_group")

    query = f"""
        SELECT user_email, user_name
        FROM `tabTicketing User Table`
        WHERE parent='{ticketing_group}'
        AND 
        (user_email LIKE '%{txt}%'
        OR user_name LIKE '%{txt}%')
        UNION
        SELECT supervisor_email, supervisor_name
        FROM `tabTicketing Supervisor Table` 
        WHERE parent='{ticketing_group}'
        AND 
        (supervisor_email LIKE '%{txt}%'
        OR supervisor_name LIKE '%{txt}%');
    """

    return frappe.db.sql(query)
