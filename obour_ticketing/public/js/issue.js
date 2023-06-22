
frappe.ui.form.on("Issue", {
    // setup: function(frm){
        
    // },
	refresh: async function(frm) {
        // remove create button
        frm.remove_custom_button("Task", "Create")

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
                                        location.reload();
                                        // setTimeout(() =>history.back(), 500)
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
    // refresh: function(frm) {
    //     frm.remove_custom_button("Task", "Create")
    // },
    status: function (frm) {
        if (frm.doc.status == __('Resolved') || frm.doc.status == __('Closed')) {
            frm.doc.resolution_details = ""
            frm.refresh_field('resolution_details')
            frm.set_df_property("resolution_details", "reqd", true);
        }
        else {
            frm.doc.resolution_details = __("The Solution Will be Here ...")
            frm.refresh_field('resolution_details')
            frm.set_df_property("resolution_details", "reqd", false);
        }
    }
});
