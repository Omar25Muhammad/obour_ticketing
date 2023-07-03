
frappe.ui.form.AssignToDialog.prototype.get_fields = function() {
    let me = this;
    const fields = [
        {
            label: __("Assign to me"),
            fieldtype: 'Check',
            fieldname: 'assign_to_me',
            default: 0,
            onchange: () => me.assign_to_me()
        },
        {
            fieldtype: 'MultiSelectPills',
            fieldname: 'assign_to',
            label: __("Assign To"),
            reqd: true,
            get_data: function(txt) {
                const data = frappe.call({
                    method: "obour_ticketing.api.get_users",
                    args: {
                        txt,
                        doctype: cur_frm.doctype,
                        docname: cur_frm.doc.name
                    },
                }).then(r => {
                    return r.message
                })
                return data
            }

        },
        {
            fieldtype: 'Section Break'
        },
        {
            label: __("Complete By"),
            fieldtype: 'Datetime',
            fieldname: 'date',
            default: cur_frm.doc.resolution_by
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: __("Priority"),
            fieldtype: 'Select',
            fieldname: 'priority',
            options: [
                {
                    value: 'Low',
                    label: __('Low')
                },
                {
                    value: 'Medium',
                    label: __('Medium')
                },
                {
                    value: 'High',
                    label: __('High')
                },
                {
                    value: 'Critical',
                    label: __('Critical')
                }
            ],
            // Pick up priority from the source document, if it exists and is available in ToDo
            default: cur_frm.doc.priority
        },
    ];
    return fields;
};

frappe.ui.form.AssignTo.prototype.add = function(){
		var me = this;

		if (this.frm.is_new()) {
			frappe.throw(__("Please save the document before assignment"));
			return;
		}

		if (!me.assign_to) {
			me.assign_to = new frappe.ui.form.AssignToDialog({
				method: "frappe.desk.form.assign_to.add",
				doctype: me.frm.doctype,
				docname: me.frm.docname,
				frm: me.frm,
				callback: function (r) {
					me.render(r.message);
                    me.frm.set_value("status", "In Progress");
                    me.frm.refresh_fields();
                    me.frm.save();
				}
			});
		}
		me.assign_to.dialog.clear();
		me.assign_to.dialog.show();
}