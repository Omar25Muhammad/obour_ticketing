// Copyright (c) 2023, ARD and contributors
// For license information, please see license.txt

frappe.ui.form.on("Ticketing Groups", {
  onload_post_render(frm) {
    frm.set_query("user_email", "technicians", function () {
      return {
        query: "obour_ticketing.queries.filter_based_on_role",
        filters: {
          role: "Support Team",
        },
      };
    });

    frm.set_query("supervisor_email", "supervisor_data", function () {
      return {
        query: "obour_ticketing.queries.filter_based_on_role",
        filters: {
          role: "Ticket Supervisors",
        },
      };
    });

    frm.set_query("admin_email", "administrator_data", function () {
      return {
        query: "obour_ticketing.queries.filter_based_on_role",
        filters: {
          role: "Ticket Administrators",
        },
      };
    });
  },
  // refresh: function(frm) {
  // }
});

frappe.ui.form.on("Ticketing Supervisor Table", {
  refresh(frm) {
    // your code here
  },
  supervisor_email(frm, cdt, cdn) {
    const d = locals[cdt][cdn];
    const email = d.supervisor_email;

    // Check for duplicates
    const duplicate = frm.doc.supervisor_data.some(
      (row) => row.supervisor_email === email && row.name !== d.name
    );

    if (duplicate) {
      frappe.msgprint(
        __("Supervisor email '{0}' is duplicated in this table.", [email])
      );
      d.supervisor_email = "";
      d.supervisor_name = "";
      frm.refresh_field("supervisor_data");
    }
  },
  active(frm, cdt, cdn) {
    const d = locals[cdt][cdn];

    for (let i in frm.doc.supervisor_data) {
      if (i != d.idx - 1) {
        frm.doc.supervisor_data[i].active = 0;
      }
    }

    frm.refresh_field("supervisor_data");
  },
});

frappe.ui.form.on("Ticketing Administrator Table", {
  refresh(frm) {
    // your code here
  },
  admin_email(frm, cdt, cdn) {
    const d = locals[cdt][cdn];
    const email = d.admin_email;

    // Check for duplicates
    const duplicate = frm.doc.administrator_data.some(
      (row) => row.admin_email === email && row.name !== d.name
    );

    if (duplicate) {
      frappe.msgprint(
        __("Administrator email '{0}' is duplicated in this table.", [email])
      );
      d.admin_email = "";
      d.admin_name = "";
      frm.refresh_field("administrator_data");
    }
  },
  active(frm, cdt, cdn) {
    const d = locals[cdt][cdn];

    for (let i in frm.doc.administrator_data) {
      if (i != d.idx - 1) {
        frm.doc.administrator_data[i].active = 0;
      }
    }

    frm.refresh_field("administrator_data");
  },
});

frappe.ui.form.on("Ticketing User Table", {
  refresh(frm) {
    // your code here
  },
  user_email(frm, cdt, cdn) {
    const d = locals[cdt][cdn];
    const email = d.user_email;

    // Check for duplicates
    const duplicate = frm.doc.technicians.some(
      (row) => row.user_email === email && row.name !== d.name
    );

    if (duplicate) {
      frappe.msgprint(
        __("Technicians email '{0}' is duplicated in this table.", [email])
      );
      d.user_email = "";
      d.user_name = "";
      frm.refresh_field("technicians");
    }
  },
});
