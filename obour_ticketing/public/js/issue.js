frappe.ui.form.on("Issue", {
  setup(frm) {
    frappe.realtime.on("reset_sla_omar", (data) => {
      console.log("omar was here");
      frappe.set_route("List", "Issue");
    });

    frappe.realtime.on("reload_doc", (data) => {
      frm.reload_doc();
    });
  },
  onload: function (frm) {
    $(".form-links").hide();
    frm.remove_custom_button("Task", "Create");
    frm.remove_custom_button("Close");
    // $(".form-assignments").hide();
    // $(".form-attachments").hide();
    $(".form-shared").hide();
    $(".form-reviews").hide();
    // $(".form-tags").hide();
    // $(".form-sidebar-stats").hide();
    // $(".list-unstyled.sidebar-menu.text-muted").hide();

    if (Boolean(frappe.user.has_role("Support Team")))
      frm.set_query("assign_to", function () {
        return {
          query: "obour_ticketing.queries.filter_assign_to_users",
          filters: {
            //   role: "Support Team",
            ticketing_group: frm.doc.ticketing_group,
          },
        };
      });

    if (Boolean(frappe.user.has_role("Ticket Administrators")))
      frm.set_query("assign_to", function () {
        return {
          query: "obour_ticketing.queries.filter_assign_to_admins",
          filters: {
            //   role: "Support Team",
            ticketing_group: frm.doc.ticketing_group,
          },
        };
      });

    Boolean(frappe.user.has_role("Ticket Supervisors"));
    frm.set_query("assign_to", function () {
      return {
        query: "obour_ticketing.queries.filter_assign_to_supers",
        filters: {
          //   role: "Support Team",
          ticketing_group: frm.doc.ticketing_group,
        },
      };
    });
  },
  // refresh: async function (frm) {
  refresh: async function (frm) {
    frm.add_custom_button(__("Send Comment to User"), () => {
      let d = new frappe.ui.Dialog({
        title: "Comment to User",
        fields: [
          {
            label: "Comment",
            fieldname: "comment",
            fieldtype: "Text Editor",
          },
        ],
        size: "large", // small, large, extra-large
        primary_action_label: "Comment",
        primary_action(values) {
          console.log(values.comment);
          frm.call({
            method: "obour_ticketing.api.comment_portal",
            args: {
              docname: frm.doc.name,
              comment: values.comment,
              comment_by: frappe.session.user_fullname,
            },
            callback: (r) => {
              frm.reload_doc();
              frappe.show_alert(
                {
                  message: __("Your comment has been submitted successfully!"),
                  indicator: "green",
                },
                5
              );
            },
          });
          d.hide();
        },
      });

      d.show();
    });
    $(".form-links").hide();

    // frappe.realtime.on("reload_page", (data) => {
    //   frm.call({
    //     method: "obour_ticketing.tasks.get_assignees",
    //     args: { docname: frm.doc.name },
    //     callback(r) {
    //       frm.doc.assign_to = "";
    //       frm.doc.status = "Open";
    //       let reset_sla = new frappe.ui.Dialog({
    //         title: __("Reset Service Level Agreement"),
    //         fields: [
    //           {
    //             fieldtype: "Data",
    //             fieldname: "reason",
    //             label: __("Reason"),
    //             reqd: 1,
    //           },
    //         ],
    //         primary_action_label: __("Reset"),
    //         primary_action: (values) => {
    //           reset_sla.disable_primary_action();
    //           reset_sla.hide();
    //           reset_sla.clear();

    //           frappe.show_alert({
    //             indicator: "green",
    //             message: __("Resetting Service Level Agreement."),
    //           });

    //           frm.call(
    //             "reset_service_level_agreement",
    //             {
    //               reason: values.reason,
    //               user: frappe.session.user_email,
    //             },
    //             () => {
    //               reset_sla.enable_primary_action();
    //               frm.refresh();
    //               frappe.msgprint(__("Service Level Agreement was reset."));
    //               frappe.set_route("List", "Issue");
    //             }
    //           );
    //         },
    //       });

    //       // reset_sla.show();
    //       // frm.refresh_fields();
    //     },
    //   });
    //   console.log(data);
    // });

    if (
      frappe.user.has_role("Support Team") &&
      !frm.is_new() &&
      frappe.session.user != "Administrator"
    )
      frm.set_df_property("ticketing_group", "read_only", 1);
    // if (frm.doc.assign_to) {
    //   if (frappe.session.user != frm.doc.assign_to) {
    //     frm.events.set_readonly(frm);
    //   }
    // }
    // remove create button
    frm.remove_custom_button("Task", "Create");
    frm.remove_custom_button("Close");
    // $(".form-assignments").hide();
    // $(".form-attachments").hide();
    $(".form-shared").hide();
    $(".form-reviews").hide();
    // $(".form-tags").hide();
    // $(".form-sidebar-stats").hide();
    // $(".list-unstyled.sidebar-menu.text-muted").hide();

    if (Boolean(frappe.user.has_role("Support Team")))
      frm.set_query("assign_to", function () {
        return {
          query: "obour_ticketing.queries.filter_assign_to_users",
          filters: {
            //   role: "Support Team",
            ticketing_group: frm.doc.ticketing_group,
          },
        };
      });

    if (Boolean(frappe.user.has_role("Ticket Administrators")))
      frm.set_query("assign_to", function () {
        return {
          query: "obour_ticketing.queries.filter_assign_to_admins",
          filters: {
            //   role: "Support Team",
            ticketing_group: frm.doc.ticketing_group,
          },
        };
      });

    if (Boolean(frappe.user.has_role("Ticket Supervisors")))
      frm.set_query("assign_to", function () {
        return {
          query: "obour_ticketing.queries.filter_assign_to_supers",
          filters: {
            //   role: "Support Team",
            ticketing_group: frm.doc.ticketing_group,
          },
        };
      });

    // --------------------------

    // frm.add_custom_button("ok", () => {
    //   frm.call({
    //     method: "obour_ticketing.tasks.reload_page",
    //     callback(res) {
    //       console.log("ok");
    //     },
    //     error(err) {
    //       console.log("Error");
    //     },
    //   });
    // });

    // --------------------------

    let assigned_users = await frm.events.get_assigned_users(frm);
    if (!frm.is_new()) {
      if (
        (assigned_users || []).includes(frappe.session.user) &&
        !frappe.user.has_role("Ticket Administrators")
      ) {
        frm.add_custom_button(__("Escalate..."), () => {
          frappe.call({
            method: "obour_ticketing.tasks.get_assignees",
            args: {
              docname: frm.doc.name,
            },
            callback: (r) => {
              clearAssignToField();
            },
          });

          function clearAssignToField() {
            frm.call({
              method: "obour_ticketing.tasks.clear_field_assign_to",
              args: { docname: frm.doc.name },
              callback: (r2) => {
                escalateIfNeeded(
                  "Support Team",
                  "Supervisor",
                  "Escalating to Supervisors Group..."
                );
                escalateIfNeeded(
                  "Ticket Supervisors",
                  "Admin",
                  "Escalating to Administrators Group..."
                );
              },
            });
          }

          function escalateIfNeeded(roleCheck, roleAction, freezeMessage) {
            if (frappe.user.has_role(roleCheck)) {
              frm.call({
                method: `obour_ticketing.api.escalate_to_${roleAction.toLowerCase()}`,
                args: {
                  docname: frm.doc.name,
                  from_user: frappe.session.user_fullname,
                },
                freeze: true,
                freeze_message: __(freezeMessage),
                callback: (r3) => {
                  // frm.doc.assign_to_full_name = "ok";
                  frm.reload_doc();
                },
              });
            }
          }
          // frappe.call({
          //   // method: "frappe.desk.form.assign_to.remove",
          //   method: "obour_ticketing.tasks.get_assignees",
          //   args: {
          //     // doctype: frm.doctype,
          //     // name: frm.docname,
          //     // assign_to: frappe.session.user,
          //     docname: frm.doc.name,
          //   },
          //   callback: (r) => {
          //     frm.call({
          //       method: "obour_ticketing.tasks.clear_field_assign_to",
          //       args: { docname: frm.doc.name },
          //       callback: (r2) => {
          //         // frm.reload_doc();
          //         /*
          //     Now Esclate to Supers
          //     */
          //         if (frappe.user.has_role("Support Team"))
          //           frm.call({
          //             method: "obour_ticketing.api.esclate_to_supervisor",
          //             args: { docname: frm.doc.name },
          //             freeze: true,
          //             freeze_message: __("Esclating to Supervisors Group..."),

          //             callback: (r3) => {
          //               frm.reload_doc();
          //             },
          //           });

          //         if (frappe.user.has_role("Ticket Supervisors"))
          //           frm.call({
          //             method: "obour_ticketing.api.esclate_to_admin",
          //             args: { docname: frm.doc.name },
          //             freeze: true,
          //             freeze_message: __(
          //               "Esclating to Administrators Group..."
          //             ),

          //             callback: (r3) => {
          //               frm.reload_doc();
          //             },
          //           });
          //       },
          //     });
          //   },
          // });
        });
      }
    }
  },
  //   before_validate(frm) {
  //     if (!frm.is_new())
  //       frm.call({
  //         method: "obour_ticketing.tasks.get_assignees",
  //         args: { docname: frm.doc.name },
  //         callback: function (response) {
  //           if (response.message) {
  //             if (response.message[0] != frappe.session.user) {
  //               frappe.throw(
  //                 __("You can just view it since you are not assigned to it!")
  //               );
  //             }
  //           }
  //         },
  //       });
  //   },

  validate(frm) {
    // if (frm.doc.assign_to)
    //   if (frm.doc.assign_to != frappe.session.user) {
    //     frappe.throw(
    //       __("You can just view it since you are not assigned to it!")
    //     );
    //   }
    //   This to get the admin and supervisor out of issue when they change the group
    // if (frm.doc.assign_to) {
    //   if (frappe.session.user != frm.doc.assign_to) {
    //     frm.events.set_readonly(frm);
    //   }
    // }
    // if (!frm.is_new() && frm.doc.ticketing_group) {
    //   frm.call({
    //     method: "obour_ticketing.tasks.reload_page",
    //     args: { event: "reset_sla_omar" },
    //     callback(res) {
    //       console.log("ok from server side");
    //       // frappe.set_route("List", "Issue");
    //     },
    //   });
    // }
    // frappe.db
    //   .get_value("Issue", frm.doc.name, "ticketing_group")
    //   .then(function (response) {
    //     let ticketing_group = response.message.ticketing_group;
    //     if (ticketing_group != frm.doc.ticketing_group) {
    //       frm.call({
    //         // method: "obour_ticketing.tasks.reload_page",
    //         method: "obour_ticketing.override.CustomIssue.custom_reset_sla",
    //         // args: { event: "reset_sla_omar" },
    //         callback(res) {
    //           console.log("ok from server side");
    //           // frappe.set_route("List", "Issue");
    //         },
    //       });
    //     }
    //   });
  },
  set_readonly(frm) {
    $.each(frm.fields_dict, function (fieldname, field) {
      frm.set_df_property(fieldname, "read_only", 1);
      frm.refresh_fields();
      frm.reload_doc();
      //   }
    });
  },
  assign_to(frm) {
    if (!frm.is_new())
      frm.call({
        method: "obour_ticketing.tasks.get_assignees",
        args: { docname: frm.doc.name },
        callback: function (response) {
          if (frm.doc.assign_to) {
            frm.call({
              method: "frappe.desk.form.assign_to.add",
              args: {
                assign_to: [frm.doc.assign_to],
                doctype: "Issue",
                name: frm.doc.name,
              },
              callback(r) {},
            });
          } else {
            frm.doc.assign_to_full_name = "";
            frm.refresh_fields();
          }
        },
      });
  },

  // reset_service_level_agreement: function (frm) {
  //   let reset_sla = new frappe.ui.Dialog({
  //     title: __("Reset Service Level Agreement"),
  //     fields: [
  //       {
  //         fieldtype: "Data",
  //         fieldname: "reason",
  //         label: __("Reason"),
  //         reqd: 1,
  //       },
  //     ],
  //     primary_action_label: __("Reset"),
  //     primary_action: (values) => {
  //       reset_sla.disable_primary_action();
  //       reset_sla.hide();
  //       reset_sla.clear();

  //       frappe.show_alert({
  //         indicator: "green",
  //         message: __("Resetting Service Level Agreement."),
  //       });

  //       frm.call(
  //         "reset_service_level_agreement",
  //         {
  //           reason: values.reason,
  //           user: frappe.session.user_email,
  //         },
  //         () => {
  //           reset_sla.enable_primary_action();
  //           frm.refresh();
  //           frappe.msgprint(__("Service Level Agreement was reset."));
  //         }
  //       );
  //     },
  //   });

  //   reset_sla.show();
  // },

  get_assigned_users: async function (frm) {
    const user_assign = await frappe.db.get_value(
      "Issue",
      cur_frm.doc.name,
      "_assign"
    );
    const _assign = await user_assign.message._assign;
    return JSON.parse(_assign);
  },
  status: function (frm) {
    if (frm.doc.status == __("Resolved") || frm.doc.status == __("Closed")) {
      // frm.doc.resolution_details = ""
      // frm.refresh_field('resolution_details')
      frm.set_df_property("resolution_details", "reqd", true);
    } else {
      // frm.doc.resolution_details = __("The Solution Will be Here ...")
      // frm.refresh_field('resolution_details')
      frm.set_df_property("resolution_details", "reqd", false);
    }
  },
});

// override function in refresh hook 'Issue doc'
function set_time_to_resolve_and_response(frm) {
  frm.dashboard.clear_headline();

  var time_to_respond = get_status(frm.doc.response_by_variance);
  if (!frm.doc.first_responded_on && frm.doc.agreement_status === "Ongoing") {
    time_to_respond = get_time_left(
      frm.doc.response_by,
      frm.doc.agreement_status
    );
  }

  var time_to_resolve = get_status(frm.doc.resolution_by_variance);
  if (!frm.doc.resolution_date && frm.doc.agreement_status === "Ongoing") {
    time_to_resolve = get_time_left(
      frm.doc.resolution_by,
      frm.doc.agreement_status
    );
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

  // if (time_to_respond.indicator == "green") {
  //   if (frm.doc.response_status != "Still") {
  //     frm.set_value("response_status", "Still");
  //     frm.save();
  //   }
  // } else if (time_to_respond.indicator == "red") {
  //   if (frm.doc.response_status != "Overdue") {
  //     frm.set_value("response_status", "Overdue");
  //     frm.save();
  //   }
  // }

  // if (time_to_resolve.indicator == "green") {
  //   if (frm.doc.resolution_status != "Still") {
  //     frm.set_value("resolution_status", "Still");
  //     frm.save();
  //   }
  // } else if (time_to_resolve.indicator == "red") {
  //   if (frm.doc.resolution_status != "Overdue") {
  //     frm.set_value("resolution_status", "Overdue");
  //     frm.save();
  //   }
  // }
}
