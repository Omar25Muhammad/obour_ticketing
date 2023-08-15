// frappe.ready(function () {

// })

const closeTicket = () => {
  const issue = frappe.web_form.doc.name;
  frappe.call({
    method: "obour_ticketing.obour_ticketing.web_form.issues.issues.close",
    args: {
      issue: issue,
    },
    callback: (r) => {
      if (r.message) {
        frappe.msgprint(
          __(`Issue <b>${issue}</b> has been Closed Successfully !`)
        );
        setTimeout(() => history.back(), 2500);
      }
    },
  });
};

const reOpenTicket = () => {
  const issue = frappe.web_form.doc.name;
  let d = new frappe.ui.Dialog({
    title: `Decline Ticket ${issue}`,
    fields: [
      {
        label: "Reason",
        fieldname: "reason",
        fieldtype: "Text",
        reqd: true,
      },
    ],
    primary_action_label: "Decline",
    primary_action(values) {
      const reason = values.reason;
      frappe.call({
        method: "obour_ticketing.obour_ticketing.web_form.issues.issues.reopen",
        args: {
          issue: issue,
          comment: reason,
        },
        callback: (r) => {
          if (r.message) {
            frappe.msgprint(
              __(`Issue <b>${issue}</b> has been Re-Opened Successfully !`)
            );
            setTimeout(() => history.back(), 2500);
          }
        },
      });
      d.hide();
    },
  });

  d.show();
};

const archiveTicket = () => {
  const issue = frappe.web_form.doc.name;
  const message = __('Are you sure you want to cancel ticket ?')
  let d = new frappe.ui.Dialog({
    title: __(`Cancel Ticket <b>${issue}</b>`),
	fields:[{"fieldname": "msg", "fieldtype": "SmallText", "read_only": 1, "default": message}],
    primary_action_label: "Submit",
    primary_action(values) {
      frappe.call({
        method: "obour_ticketing.obour_ticketing.web_form.issues.issues.arhive_ticket",
        args: {
          issue: issue,
        },
        callback: (r) => {
          if (r.message) {
            frappe.msgprint(
              	__(`Issue <b>${issue}</b> move to archived issue Successfully !`)
            );
            setTimeout(() => history.back(), 2500);
          }
        },
      });
      d.hide();
    }
  });
  d.show();
};
