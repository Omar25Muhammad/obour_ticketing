// Copyright (c) 2023, ARD and contributors
// For license information, please see license.txt

// Function to handle email field validation and role checks
function handleEmailValidation(frm, cdt, cdn, emailField, tableName, roleName) {
  const d = locals[cdt][cdn];
  const email = d[emailField];

  const duplicate = frm.doc[tableName].some(
    (row) => row[emailField] === email && row.name !== d.name
  );

  if (duplicate) {
    frappe.msgprint(
      __(`${roleName} email '${email}' is duplicated in this table.`)
    );
    d[emailField] = "";
    d[`${emailField.split("_")[0]}_name`] = "";
    frm.refresh_field(tableName);
  }

  frm.call({
    method: "obour_ticketing.api.user_has_role",
    args: { user_email: email, role: roleName },
    callback: (response) => {
      if (!response.message) {
        d[emailField] = "";
        d[`${emailField.split("_")[0]}_name`] = "";
        frm.refresh_field(tableName);
      }
    },
  });
}

// Event handler for "Ticketing Groups" form
frappe.ui.form.on("Ticketing Groups", {
  onload_post_render(frm) {
    frm.set_query("user_email", "technicians", () => ({
      query: "obour_ticketing.queries.filter_based_on_role",
      filters: { role: "Support Team" },
    }));
    frm.set_query("supervisor_email", "supervisor_data", () => ({
      query: "obour_ticketing.queries.filter_based_on_role",
      filters: { role: "Ticket Supervisors" },
    }));
    frm.set_query("admin_email", "administrator_data", () => ({
      query: "obour_ticketing.queries.filter_based_on_role",
      filters: { role: "Ticket Administrators" },
    }));
  },
});

// Event handler for table rows with email fields
function tableEmailHandlers(roleName, tableName, emailField) {
  return {
    refresh(frm) {
      // Your code here
    },
    [emailField](frm, cdt, cdn) {
      handleEmailValidation(frm, cdt, cdn, emailField, tableName, roleName);
    },
    active(frm, cdt, cdn) {
      const d = locals[cdt][cdn];

      for (let i in frm.doc[tableName]) {
        if (i != d.idx - 1) {
          frm.doc[tableName][i].active = 0;
        }
      }

      frm.refresh_field(tableName);
    },
  };
}

// Event handlers for "Ticketing Supervisor Table"
frappe.ui.form.on(
  "Ticketing Supervisor Table",
  tableEmailHandlers(
    "Ticket Supervisors",
    "supervisor_data",
    "supervisor_email"
  )
);

// Event handlers for "Ticketing Administrator Table"
frappe.ui.form.on(
  "Ticketing Administrator Table",
  tableEmailHandlers(
    "Ticket Administrators",
    "administrator_data",
    "admin_email"
  )
);

// Event handlers for "Ticketing User Table"
frappe.ui.form.on(
  "Ticketing User Table",
  tableEmailHandlers("Support Team", "technicians", "user_email")
);
