// frappe.ready(function () {
	
// })

const closeTicket = () => {
	const issue = frappe.web_form.doc.name
	frappe.call({
		method: "obour_ticketing.obour_ticketing.web_form.issues.issues.close",
		args: {
			issue: issue
		},
		callback: r => {
			if(r.message){
				frappe.msgprint(__(`Issue <b>${issue}</b> has been Closed Successfully !`))
				setTimeout(() => history.back(), 2500)
			}
		}
	})
};

const reOpenTicket = () => {
	const issue = frappe.web_form.doc.name
	let d = new frappe.ui.Dialog({
		title: `Decline Ticket ${issue}`,
		fields: [
			{
				label: "Reason",
				fieldname: "reason",
				fieldtype: "Text",
				reqd: true
			}
		],
		primary_action_label: "Decline",
		primary_action(values) {
			const reason = values.reason
			frappe.call({
				method: "obour_ticketing.obour_ticketing.web_form.issues.issues.reopen",
				args: {
					issue: issue,
					comment: reason
				},
				callback: r => {
					if(r.message){
						frappe.msgprint(__(`Issue <b>${issue}</b> has been Re-Opened Successfully !`))
						setTimeout(() => history.back(), 2500)
					}
				}
			})
			d.hide();
		}
	});
	
	d.show();
};