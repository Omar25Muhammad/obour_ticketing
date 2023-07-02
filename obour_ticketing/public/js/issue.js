
frappe.ui.form.on("Issue", {
    onload: function(frm){
        frm.remove_custom_button("Task", "Create")
    },
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
    status: function (frm) {
        if (frm.doc.status == __('Resolved') || frm.doc.status == __('Closed')) {
            // frm.doc.resolution_details = ""
            // frm.refresh_field('resolution_details')
            frm.set_df_property("resolution_details", "reqd", true);
        }
        else {
            // frm.doc.resolution_details = __("The Solution Will be Here ...")
            // frm.refresh_field('resolution_details')
            frm.set_df_property("resolution_details", "reqd", false);
        }
    }
});

// override function in refresh hook 'Issue doc'
function set_time_to_resolve_and_response(frm) {
	frm.dashboard.clear_headline();

	var time_to_respond = get_status(frm.doc.response_by_variance);
	if (!frm.doc.first_responded_on && frm.doc.agreement_status === "Ongoing") {
		time_to_respond = get_time_left(frm.doc.response_by, frm.doc.agreement_status);
	}

	var time_to_resolve = get_status(frm.doc.resolution_by_variance);
	if (!frm.doc.resolution_date && frm.doc.agreement_status === "Ongoing") {
		time_to_resolve = get_time_left(frm.doc.resolution_by, frm.doc.agreement_status);
	}

	frm.dashboard.set_headline_alert(
		`<div class="row">
			<div class="col-xs-12 col-sm-6">
				<span class="indicator whitespace-nowrap ${time_to_respond.indicator}">
                    <span>Time to Respond: 
                        ${time_to_respond.diff_display}
                    </span>
                </span> 
			</div>
			<div class="col-xs-12 col-sm-6">
				<span class="indicator whitespace-nowrap ${time_to_resolve.indicator}">
                    <span>Time to Resolve: ${time_to_resolve.diff_display}
                    </span>
                </span>
		    </div>
		</div>`
	);

	if (time_to_respond.indicator == "green") {
        if (frm.doc.response_status != "Still"){
            frm.set_value("response_status", "Still");
            frm.save();
        }
	}

	else if (time_to_respond.indicator == "red"){
        if (frm.doc.response_status != "Overdue"){
            frm.set_value("response_status", "Overdue");
            frm.save();
        }
	}

	if (time_to_resolve.indicator == "green") {
        if (frm.doc.resolution_status != "Still"){
            frm.set_value("resolution_status", "Still");
            frm.save();
        }
	}
	else if (time_to_resolve.indicator == "red") {
        if (frm.doc.resolution_status != "Overdue"){
            frm.set_value("resolution_status", "Overdue");
            frm.save();
        }

	}
}