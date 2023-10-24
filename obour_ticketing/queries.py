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
def filter_assign_to_users_checker(ticketing_group: str):
    """ """

    query = f"""
    SELECT user_email
    FROM `tabTicketing User Table`
    WHERE parent='{ticketing_group}'
    """

    return [i[0] for i in frappe.db.sql(query)]


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
def filter_assign_to_admins_checker(ticketing_group: str):
    """ """

    query = f"""
        SELECT user_email
        FROM `tabTicketing User Table`
        WHERE parent='{ticketing_group}'
        UNION
        SELECT supervisor_email
        FROM `tabTicketing Supervisor Table` 
        WHERE parent='{ticketing_group}'
        UNION
        SELECT admin_email
        FROM `tabTicketing Administrator Table` 
        WHERE parent='{ticketing_group}';
    """

    return [i[0] for i in frappe.db.sql(query)]


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


@frappe.whitelist()
def filter_assign_to_supers_checker(ticketing_group: str):
    """ """

    query = f"""
        SELECT user_email
        FROM `tabTicketing User Table`
        WHERE parent='{ticketing_group}'
        UNION
        SELECT supervisor_email
        FROM `tabTicketing Supervisor Table` 
        WHERE parent='{ticketing_group}'
    """

    return [i[0] for i in frappe.db.sql(query)]


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def what_user_should_see(doctype, txt, searchfield, start, page_len, filters):
    user = filters.get("user")
    ticketing_group = filters.get("ticketing_group")

    if user == "Administrator":
        return "We are not counting Administrator"

    # For Techs
    techs = frappe.get_all(
        "Ticketing User Table",
        filters={"parent": ticketing_group, "user_email": user},
        pluck="user_email",
    )

    # For Supers
    supers = frappe.get_all(
        "Ticketing Supervisor Table",
        filters={"parent": ticketing_group, "supervisor_email": user},
        pluck="supervisor_email",
    )

    # For Admins
    admins = frappe.get_all(
        "Ticketing Administrator Table",
        filters={"parent": ticketing_group, "admin_email": user},
        pluck="admin_email",
    )

    # Total Users
    all_users = []
    all_levels = []

    if techs:
        # all_users.append(",".join(techs))
        all_levels.append("Techs")

    if supers:
        # all_users.append(",".join(supers))
        all_levels.append("Supers")

    if admins:
        # all_users.append(",".join(admins))
        all_levels.append("Admins")

    if "Admins" in all_levels:
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing Administrator Table",
        #         filters={"parent": ticketing_group},
        #         pluck="admin_email",
        #     )
        # )
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing Supervisor Table",
        #         filters={"parent": ticketing_group},
        #         pluck="supervisor_email",
        #     )
        # )
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing User Table",
        #         filters={"parent": ticketing_group},
        #         pluck="user_email",
        #     )
        # )
        # return list(set(all_users))

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

    elif "Supers" in all_levels:
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing Supervisor Table",
        #         filters={"parent": ticketing_group},
        #         pluck="supervisor_email",
        #     )
        # )
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing User Table",
        #         filters={"parent": ticketing_group},
        #         pluck="user_email",
        #     )
        # )
        # return list(set(all_users))

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

    # if "Techs" in all_levels:
    elif "Techs" in all_levels:
        # all_users.extend(
        #     frappe.get_all(
        #         "Ticketing User Table",
        #         filters={"parent": ticketing_group},
        #         pluck="user_email",
        #     )
        # )
        # return list(set(all_users))

        query = f"""
        SELECT user_email, user_name
        FROM `tabTicketing User Table`
        WHERE parent='{ticketing_group}'
        AND 
        (user_email LIKE '%{txt}%'
        OR user_name LIKE '%{txt}%');
        """

        return frappe.db.sql(query)

    else:
        return []


@frappe.whitelist()
def current_user_escalate_to(user, ticketing_group):
    if user == "Administrator":
        return "We are not counting Administrator"

    # For Techs
    techs = frappe.get_all(
        "Ticketing User Table",
        filters={"parent": ticketing_group, "user_email": user},
        pluck="user_email",
    )

    # For Supers
    supers = frappe.get_all(
        "Ticketing Supervisor Table",
        filters={"parent": ticketing_group, "supervisor_email": user},
        pluck="supervisor_email",
    )

    # For Admins
    admins = frappe.get_all(
        "Ticketing Administrator Table",
        filters={"parent": ticketing_group, "admin_email": user},
        pluck="admin_email",
    )

    # Total Users
    all_users = []
    all_levels = []

    if techs:
        # all_users.append(",".join(techs))
        all_levels.append("Techs")

    if supers:
        # all_users.append(",".join(supers))
        all_levels.append("Supers")

    if admins:
        # all_users.append(",".join(admins))
        all_levels.append("Admins")

    if "Admins" in all_levels:
        return ""

    elif "Supers" in all_levels:
        return "Escalate to Admins"

    # if "Techs" in all_levels:
    elif "Techs" in all_levels:
        return "Escalate to Supers"

    else:
        return ""
