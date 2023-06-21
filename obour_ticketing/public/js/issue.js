
frappe.ui.form.on("Issue", {
    setup: function(){},
	onload: async function(frm) {
        let assigned_users = await frm.events.get_assigned_users(frm)
        if(!frm.is_new()) {
            if ((assigned_users || []).includes(frappe.session.user)){
                frm.add_custom_button(__("Re-Assign"), () => {
                    frappe.call({
                        method: "frappe.desk.form.assign_to.remove",
                        args: {
                            doctype: frm.doctype,
                            name: frm.docname,
                            assign_to: frappe.session.user
                        },
                        callback: r => {
                            if(r.message.length == 0) {
                                frappe.call({
                                    method: "obour_ticketing.api.reassign_users",
                                    args: {
                                        docname: frm.doc.name
                                    },
                                    callback: r => {
                                        setTimeout(() =>history.back(), 500)
                                    }
                                })
                            };
                        }
                    })
                });
            }
        }
	},
    get_assigned_users: async function(frm) {
        const user_assign = await frappe.db.get_value("Issue", cur_frm.doc.name, "_assign")
        const _assign = await user_assign.message._assign
        return JSON.parse(_assign)
    },
    refresh: function(frm) {
        frm.remove_custom_button("Task", "Create")
    },
    status: function (frm) {
        if (frm.doc.status == __('Resolved') || frm.doc.status == __('Closed')) {
            frm.set_df_property("resolution_details", "reqd", true);
            frm.refresh_field('resolution_details')
        }
        else {
            frm.set_df_property("resolution_details", "reqd", false);
            frm.refresh_field('resolution_details')
        }
    }
});
