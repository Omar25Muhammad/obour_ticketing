
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
            fieldtype: 'Date',
            fieldname: 'date'
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
                }
            ],
            // Pick up priority from the source document, if it exists and is available in ToDo
            default: ["Low", "Medium", "High"].includes(me.frm && me.frm.doc.priority ? me.frm.doc.priority : 'Medium')
        },
        // {
        //     fieldtype: 'Section Break'
        // },
        // {
        //     label: __("Comment"),
        //     fieldtype: 'Small Text',
        //     fieldname: 'description'
        // }
    ];
    return fields;
};