
frappe.ui.form.on("Issue", {
    setup: function(){},
	onload: async function(frm) {
        let assigned_users = await frm.events.get_assigned_users(frm)

        if(!frm.is_new()) {
            if (assigned_users.includes(frappe.session.user)){
                frm.add_custom_button(__("Re-Assign"), () => {
                    cur_frm.assign_to.remove(frappe.session.user)
                    location.reload()
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
        cur_frm.remove_custom_button("Task", "Create")
    },
    _assign: function(frm) {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@");
    },
});
