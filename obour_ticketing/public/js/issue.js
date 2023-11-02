// frappe.ui.form.on("Issue", {
//   setup(frm) {
//     frappe.realtime.on("reset_sla_omar", (data) => {
//       console.log("omar was here");
//       frm.refresh_fields();
//       frappe.set_route("List", "Issue");
//       // location.reload();
//     });

//     frappe.realtime.on("reload_doc", (data) => {
//       frm.reload_doc();
//       // location.reload();
//     });
//   },
//   onload: function (frm) {
//     $(".form-links").hide();
//     frm.remove_custom_button("Task", "Create");
//     frm.remove_custom_button("Close");
//     $(".form-assignments").hide();
//     // $(".form-attachments").hide();
//     $(".form-shared").hide();
//     $(".form-reviews").hide();
//     // $(".form-tags").hide();
//     // $(".form-sidebar-stats").hide();
//     // $(".list-unstyled.sidebar-menu.text-muted").hide();

//     frm.set_query("assign_to", function () {
//       return {
//         query: "obour_ticketing.queries.what_user_should_see",
//         filters: {
//           //   role: "Support Team",
//           ticketing_group: frm.doc.ticketing_group,
//           user: frappe.session.user,
//         },
//       };
//     });
//     // if (Boolean(frappe.user.has_role("Support Team")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_users",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });
//     // else if (Boolean(frappe.user.has_role("Ticket Administrators")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_admins",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });
//     // else if (Boolean(frappe.user.has_role("Ticket Supervisors")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_supers",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });
//   },
//   // refresh: async function (frm) {
//   refresh: async function (frm) {
//     // if (!frm.doc.resolution_details) {
//     //   frm.set_df_property("section_break_19", "hidden", 1);
//     // } else {
//     //   frm.set_df_property("section_break_19", "hidden", 0);
//     // }
//     if (!frm.is_new()) {
//       frappe.db
//         .get_value("Issue", frm.doc.name, "assign_to")
//         .then(function (response) {
//           let assign_to = response.message.assign_to;
//           if (
//             assign_to != null &&
//             frm.doc.status != "Un Assigned" &&
//             frm.doc.status != "Open"
//           ) {
//             // frm.set_df_property("assign_to", "reqd", 1);
//           }
//         });

//       if (
//         frm.doc.assign_to &&
//         frm.doc.assign_to == frappe.session.user &&
//         frm.doc.status != "Resolved" &&
//         frm.doc.status != "Closed"
//       ) {
//         frm
//           .add_custom_button(__("Hold Ticket"), () => {
//             // frm.doc.status = "On Hold";
//             frm.set_value("status", "On Hold");
//             frm.refresh_fields();
//             // frm.reload_doc();
//             frm.save();
//           })
//           .css({
//             color: "white",
//             "background-color": "#d41f3d",
//             "font-weight": "600",
//           });

//         if (frm.doc.assign_to)
//           frm
//             .add_custom_button(__("Mark As Resolve"), () => {
//               // frm.doc.status = "On Hold";
//               frm.set_value("status", "Resolved");
//               frm.set_df_property("section_break_19", "hidden", 0);
//               frm.refresh_fields();
//               // frm.reload_doc();
//               frm.save();
//             })
//             .css({
//               color: "white",
//               "background-color": "limegreen",
//               "font-weight": "600",
//             });
//       }

//       frm
//         .add_custom_button(__("Send Comment to User"), () => {
//           let d = new frappe.ui.Dialog({
//             title: "Comment to User",
//             fields: [
//               {
//                 label: "Comment",
//                 fieldname: "comment",
//                 fieldtype: "Text Editor",
//               },
//             ],
//             size: "large", // small, large, extra-large
//             primary_action_label: "Comment",
//             primary_action(values) {
//               console.log(values.comment);
//               frm.call({
//                 method: "obour_ticketing.api.comment_portal",
//                 args: {
//                   docname: frm.doc.name,
//                   comment: values.comment,
//                   comment_by: frappe.session.user_fullname,
//                 },
//                 callback: (r) => {
//                   frm.reload_doc();
//                   frappe.show_alert(
//                     {
//                       message: __(
//                         "Your comment has been submitted successfully!"
//                       ),
//                       indicator: "green",
//                     },
//                     5
//                   );
//                 },
//               });
//               d.hide();
//             },
//           });

//           d.show();
//         })
//         .css({
//           color: "white",
//           "background-color": "#328fcdcf",
//           "font-weight": "600",
//         });
//     }
//     $(".form-links").hide();

//     // frappe.realtime.on("reload_page", (data) => {
//     //   frm.call({
//     //     method: "obour_ticketing.tasks.get_assignees",
//     //     args: { docname: frm.doc.name },
//     //     callback(r) {
//     //       frm.doc.assign_to = "";
//     //       frm.doc.status = "Open";
//     //       let reset_sla = new frappe.ui.Dialog({
//     //         title: __("Reset Service Level Agreement"),
//     //         fields: [
//     //           {
//     //             fieldtype: "Data",
//     //             fieldname: "reason",
//     //             label: __("Reason"),
//     //             reqd: 1,
//     //           },
//     //         ],
//     //         primary_action_label: __("Reset"),
//     //         primary_action: (values) => {
//     //           reset_sla.disable_primary_action();
//     //           reset_sla.hide();
//     //           reset_sla.clear();

//     //           frappe.show_alert({
//     //             indicator: "green",
//     //             message: __("Resetting Service Level Agreement."),
//     //           });

//     //           frm.call(
//     //             "reset_service_level_agreement",
//     //             {
//     //               reason: values.reason,
//     //               user: frappe.session.user_email,
//     //             },
//     //             () => {
//     //               reset_sla.enable_primary_action();
//     //               frm.refresh();
//     //               frappe.msgprint(__("Service Level Agreement was reset."));
//     //               frappe.set_route("List", "Issue");
//     //             }
//     //           );
//     //         },
//     //       });

//     //       // reset_sla.show();
//     //       // frm.refresh_fields();
//     //     },
//     //   });
//     //   console.log(data);
//     // });

//     if (
//       frappe.user.has_role("Support Team") &&
//       !frm.is_new() &&
//       frappe.session.user != "Administrator"
//     )
//       frm.set_df_property("ticketing_group", "read_only", 1);
//     if (frm.doc.assign_to) {
//       if (frappe.session.user != frm.doc.assign_to && frappe.session.user != 'Administrator') {
//         cur_frm.call({
//           method: "obour_ticketing.api.is_ticket_master",
//           args: {user: frappe.session.user, ticketing_group: frm.doc.ticketing_group, assign_to_user: frm.doc.assign_to},
//           callback: (r) => {
//             console.log(r.message)
//             if (!r.message)
//               frm.events.set_readonly(frm);
//           }
//       })
        
//       }
//     }
//     // remove create button
//     frm.remove_custom_button("Task", "Create");
//     frm.remove_custom_button("Close");
//     $(".form-assignments").hide();
//     // $(".form-attachments").hide();
//     $(".form-shared").hide();
//     $(".form-reviews").hide();
//     // $(".form-tags").hide();
//     // $(".form-sidebar-stats").hide();
//     // $(".list-unstyled.sidebar-menu.text-muted").hide();

//     frm.set_query("assign_to", function () {
//       return {
//         query: "obour_ticketing.queries.what_user_should_see",
//         filters: {
//           //   role: "Support Team",
//           ticketing_group: frm.doc.ticketing_group,
//           user: frappe.session.user,
//         },
//       };
//     });
//     // if (Boolean(frappe.user.has_role("Support Team")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_users",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });
//     // else if (Boolean(frappe.user.has_role("Ticket Administrators")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_admins",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });
//     // else if (Boolean(frappe.user.has_role("Ticket Supervisors")))
//     //   frm.set_query("assign_to", function () {
//     //     return {
//     //       query: "obour_ticketing.queries.filter_assign_to_supers",
//     //       filters: {
//     //         //   role: "Support Team",
//     //         ticketing_group: frm.doc.ticketing_group,
//     //       },
//     //     };
//     //   });

//     // --------------------------

//     // frm.add_custom_button("ok", () => {
//     //   frm.call({
//     //     method: "obour_ticketing.tasks.reload_page",
//     //     callback(res) {
//     //       console.log("ok");
//     //     },
//     //     error(err) {
//     //       console.log("Error");
//     //     },
//     //   });
//     // });

//     // --------------------------

//     let assigned_users = await frm.events.get_assigned_users(frm);
//     if (!frm.is_new()) {
//       if (
//         (assigned_users || []).includes(frappe.session.user) &&
//         (frappe.user.has_role("Support Team") ||
//           frappe.user.has_role("Ticket Supervisors")) &&
//         frm.doc.status != "Resolved" &&
//         frm.doc.status != "Closed"
//       ) {
//         frm.add_custom_button(__("Escalate..."), () => {
//           frappe.call({
//             method: "obour_ticketing.tasks.get_assignees",
//             args: {
//               docname: frm.doc.name,
//             },
//             callback: (r) => {
//               // clearAssignToField();
//               frm.call({
//                 method: "obour_ticketing.queries.current_user_escalate_to",
//                 args: {
//                   user: frappe.session.user,
//                   ticketing_group: frm.doc.ticketing_group,
//                 },
//                 callback: (res) => {
//                   if (res.message == "Escalate to Supers") {
//                     frm.call({
//                       method: "obour_ticketing.tasks.clear_field_assign_to",
//                       args: { docname: frm.doc.name },
//                       callback: (r2) => {
//                         escalateIfNeeded(
//                           "Support Team",
//                           "Supervisor",
//                           "Escalating to Supervisors Group..."
//                         );
//                       },
//                     });
//                   } else if (res.message == "Escalate to Admins") {
//                     frm.call({
//                       method: "obour_ticketing.tasks.clear_field_assign_to",
//                       args: { docname: frm.doc.name },
//                       callback: (r2) => {
//                         escalateIfNeeded(
//                           "Ticket Supervisors",
//                           "Admin",
//                           "Escalating to Administrators Group..."
//                         );
//                       },
//                     });
//                   }
//                 },
//               });
//             },
//           });

//           function clearAssignToField() {
//             frm.call({
//               method: "obour_ticketing.tasks.clear_field_assign_to",
//               args: { docname: frm.doc.name },
//               callback: (r2) => {
//                 escalateIfNeeded(
//                   "Support Team",
//                   "Supervisor",
//                   "Escalating to Supervisors Group..."
//                 );
//                 escalateIfNeeded(
//                   "Ticket Supervisors",
//                   "Admin",
//                   "Escalating to Administrators Group..."
//                 );
//               },
//             });
//           }

//           function escalateIfNeeded(roleCheck, roleAction, freezeMessage) {
//             if (frappe.user.has_role(roleCheck)) {
//               frm.call({
//                 method: `obour_ticketing.api.escalate_to_${roleAction.toLowerCase()}`,
//                 args: {
//                   docname: frm.doc.name,
//                   from_user: frappe.session.user_fullname,
//                 },
//                 freeze: true,
//                 freeze_message: __(freezeMessage),
//                 callback: (r3) => {
//                   // frm.doc.assign_to_full_name = "ok";
//                   frm.reload_doc();
//                 },
//               });
//             }
//           }
//         });
//       }
//     }
//   },

//   validate(frm) {
//     // if (frm.doc.assign_to)
//     //   if (frm.doc.assign_to != frappe.session.user) {
//     //     frappe.throw(
//     //       __("You can just view it since you are not assigned to it!")
//     //     );
//     //   }
//     //   This to get the admin and supervisor out of issue when they change the group
//     if (frm.doc.assign_to) {
//       if (frappe.session.user != frm.doc.assign_to) {
//         frm.events.set_readonly(frm);
//       }
//     } else {
//       frm.doc.status = "Open";
//       frm.refresh_fields();
//     }
//     // if (!frm.is_new() && frm.doc.ticketing_group) {
//     //   frm.call({
//     //     method: "obour_ticketing.tasks.reload_page",
//     //     args: { event: "reset_sla_omar" },
//     //     callback(res) {
//     //       console.log("ok from server side");
//     //       // frappe.set_route("List", "Issue");
//     //     },
//     //   });
//     // }
//     // frappe.db
//     //   .get_value("Issue", frm.doc.name, "ticketing_group")
//     //   .then(function (response) {
//     //     let ticketing_group = response.message.ticketing_group;
//     //     if (ticketing_group != frm.doc.ticketing_group) {
//     //     }
//     //   });

//     frappe.db
//       .get_value("Issue", frm.doc.name, "assign_to")
//       .then(function (response) {
//         let assign_to = response.message.assign_to;
//         // if (assign_to != null && assign_to != frm.doc.assign_to) {
//         if (assign_to != frm.doc.assign_to) {
//           frm.events.assign_to_function(frm);
//           // frm.set_df_property("assign_to", "reqd", 1);
//         }
//       });
//   },

//   set_readonly(frm) {
//     // $.each(frm.fields_dict, function (fieldname, field) {
//     frm.set_df_property("subject", "read_only", 1);
//     frm.set_df_property("assign_to", "read_only", 1);
//     frm.set_df_property("ticketing_group", "read_only", 1);
//     frm.set_df_property("issue_type", "read_only", 1);
//     frm.set_df_property("customer", "read_only", 1);
//     frm.set_df_property("priority", "read_only", 1);
//     frm.set_df_property("attachments", "read_only", 1);
//     frm.set_df_property("description", "read_only", 1);
//     frm.set_df_property("service_level_agreement", "read_only", 1);
//     frm.set_df_property("resolution_details", "read_only", 1);
//     hide_field("reset_service_level_agreement");
//     frm.refresh_fields();
//     // frm.reload_doc();
//     // frm.call({
//     //   method: "obour_ticketing.tasks.reload_page",
//     //   args: { event: "reload_doc" },
//     //   callback(res) {
//     //     console.log("ok");
//     //     // frappe.set_route("List", "Issue");
//     //   },
//     // });
//     //   }
//     // });
//   },
//   assign_to_function(frm) {
//     if (!frm.is_new())
//       if (frm.doc.assign_to) {
//         frm.call({
//           method: "obour_ticketing.tasks.get_assignees",
//           args: { docname: frm.doc.name },
//           callback: function (response) {
//             // if (frm.doc.assign_to) {
//             frm.call({
//               method: "frappe.desk.form.assign_to.add",
//               args: {
//                 assign_to: [frm.doc.assign_to],
//                 doctype: "Issue",
//                 name: frm.doc.name,
//               },
//               callback(r) {
//                 frm.set_value("status", "In Progress");
//                 frm.refresh_fields();
//                 // frm.reload_doc();
//                 location.reload();
//               },
//             });
//           },
//         });
//       } else {
//         frm.call({
//           method: "obour_ticketing.tasks.get_assignees",
//           args: { docname: frm.doc.name },
//           callback: function (response) {},
//         });
//         frm.doc.assign_to_full_name = "";
//         frm.refresh_fields();
//         location.reload();
//       }
//   },

//   // reset_service_level_agreement: function (frm) {
//   //   let reset_sla = new frappe.ui.Dialog({
//   //     title: __("Reset Service Level Agreement"),
//   //     fields: [
//   //       {
//   //         fieldtype: "Data",
//   //         fieldname: "reason",
//   //         label: __("Reason"),
//   //         reqd: 1,
//   //       },
//   //     ],
//   //     primary_action_label: __("Reset"),
//   //     primary_action: (values) => {
//   //       reset_sla.disable_primary_action();
//   //       reset_sla.hide();
//   //       reset_sla.clear();

//   //       frappe.show_alert({
//   //         indicator: "green",
//   //         message: __("Resetting Service Level Agreement."),
//   //       });

//   //       frm.call(
//   //         "reset_service_level_agreement",
//   //         {
//   //           reason: values.reason,
//   //           user: frappe.session.user_email,
//   //         },
//   //         () => {
//   //           reset_sla.enable_primary_action();
//   //           frm.refresh();
//   //           frappe.msgprint(__("Service Level Agreement was reset."));
//   //         }
//   //       );
//   //     },
//   //   });

//   //   reset_sla.show();
//   // },

//   get_assigned_users: async function (frm) {
//     const user_assign = await frappe.db.get_value(
//       "Issue",
//       cur_frm.doc.name,
//       "_assign"
//     );
//     const _assign = await user_assign.message._assign;
//     return JSON.parse(_assign);
//   },
//   status: function (frm) {
//     if (frm.doc.status == __("Resolved") || frm.doc.status == __("Closed")) {
//       // frm.doc.resolution_details = ""
//       // frm.refresh_field('resolution_details')
//       frm.set_df_property("resolution_details", "reqd", true);
//     } else {
//       // frm.doc.resolution_details = __("The Solution Will be Here ...")
//       // frm.refresh_field('resolution_details')
//       frm.set_df_property("resolution_details", "reqd", false);
//     }
//   },
// });

// // override function in refresh hook 'Issue doc'
// function set_time_to_resolve_and_response(frm) {
//   frm.dashboard.clear_headline();

//   var time_to_respond = get_status(frm.doc.response_by_variance);
//   if (!frm.doc.first_responded_on && frm.doc.agreement_status === "Ongoing") {
//     time_to_respond = get_time_left(
//       frm.doc.response_by,
//       frm.doc.agreement_status
//     );
//   }

//   var time_to_resolve = get_status(frm.doc.resolution_by_variance);
//   if (!frm.doc.resolution_date && frm.doc.agreement_status === "Ongoing") {
//     time_to_resolve = get_time_left(
//       frm.doc.resolution_by,
//       frm.doc.agreement_status
//     );
//   }

//   frm.dashboard.set_headline_alert(
//     `<div class="row">
// 			<div class="col-xs-12 col-sm-6">
// 				<span class="indicator whitespace-nowrap ${time_to_respond.indicator}">
//                     <span>Time to Respond: 
//                         ${time_to_respond.diff_display}
//                     </span>
//                 </span> 
// 			</div>
// 			<div class="col-xs-12 col-sm-6">
// 				<span class="indicator whitespace-nowrap ${time_to_resolve.indicator}">
//                     <span>Time to Resolve: ${time_to_resolve.diff_display}
//                     </span>
//                 </span>
// 		    </div>
// 		</div>`
//   );

//   // if (time_to_respond.indicator == "green") {
//   //   if (frm.doc.response_status != "Still") {
//   //     frm.set_value("response_status", "Still");
//   //     frm.save();
//   //   }
//   // } else if (time_to_respond.indicator == "red") {
//   //   if (frm.doc.response_status != "Overdue") {
//   //     frm.set_value("response_status", "Overdue");
//   //     frm.save();
//   //   }
//   // }

//   // if (time_to_resolve.indicator == "green") {
//   //   if (frm.doc.resolution_status != "Still") {
//   //     frm.set_value("resolution_status", "Still");
//   //     frm.save();
//   //   }
//   // } else if (time_to_resolve.indicator == "red") {
//   //   if (frm.doc.resolution_status != "Overdue") {
//   //     frm.set_value("resolution_status", "Overdue");
//   //     frm.save();
//   //   }
//   // }
// }


// Last Update

frappe.ui.form.on("Issue", {
  setup(frm) {
    frappe.realtime.on("reset_sla_omar", (data) => {
      console.log("omar was here");
      frm.refresh_fields();
      frappe.set_route("List", "Issue");
      // location.reload();
    });

    frappe.realtime.on("reload_doc", (data) => {
      frm.reload_doc();
      // location.reload();
    });
  },
  onload: function (frm) {
    $(".form-links").hide();
    frm.remove_custom_button("Task", "Create");
    frm.remove_custom_button("Close");
    $(".form-assignments").hide();
    // $(".form-attachments").hide();
    $(".form-shared").hide();
    $(".form-reviews").hide();
    // $(".form-tags").hide();
    // $(".form-sidebar-stats").hide();
    // $(".list-unstyled.sidebar-menu.text-muted").hide();

    frm.set_query("assign_to", function () {
      return {
        query: "obour_ticketing.queries.what_user_should_see",
        filters: {
          //   role: "Support Team",
          ticketing_group: frm.doc.ticketing_group,
          user: frappe.session.user,
          raised_by: frm.doc.raised_by,
        },
      };
    });
    // if (Boolean(frappe.user.has_role("Support Team")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_users",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });
    // else if (Boolean(frappe.user.has_role("Ticket Administrators")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_admins",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });
    // else if (Boolean(frappe.user.has_role("Ticket Supervisors")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_supers",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });
  },
  // refresh: async function (frm) {
  refresh: async function (frm) {
    // if (!frm.doc.resolution_details) {
    //   frm.set_df_property("section_break_19", "hidden", 1);
    // } else {
    //   frm.set_df_property("section_break_19", "hidden", 0);
    // }
    if (!frm.is_new()) {
      frappe.db
        .get_value("Issue", frm.doc.name, "assign_to")
        .then(function (response) {
          let assign_to = response.message.assign_to;
          if (
            assign_to != null &&
            frm.doc.status != "Un Assigned" &&
            frm.doc.status != "Open"
          ) {
            // frm.set_df_property("assign_to", "reqd", 1);
          }
        });

      if (
        frm.doc.assign_to &&
        frm.doc.assign_to == frappe.session.user &&
        frm.doc.status != "Resolved" &&
        frm.doc.status != "Closed"
      ) {
        frm
          .add_custom_button(__("Hold Ticket"), () => {
            // frm.doc.status = "On Hold";
            frm.set_value("status", "On Hold");
            frm.refresh_fields();
            // frm.reload_doc();
            frm.save();
          })
          .css({
            color: "white",
            "background-color": "#d41f3d",
            "font-weight": "600",
          });

        if (frm.doc.assign_to)
          frm
            .add_custom_button(__("Mark As Resolve"), () => {
              // frm.doc.status = "On Hold";
              frm.set_value("status", "Resolved");
              frm.set_df_property("section_break_19", "hidden", 0);
              frm.refresh_fields();
              // frm.reload_doc();
              frm.save();
            })
            .css({
              color: "white",
              "background-color": "limegreen",
              "font-weight": "600",
            });
      }

      frm
        .add_custom_button(__("Send Comment to User"), () => {
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
                      message: __(
                        "Your comment has been submitted successfully!"
                      ),
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
        })
        .css({
          color: "white",
          "background-color": "#328fcdcf",
          "font-weight": "600",
        });
    }
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
    if (frm.doc.assign_to) {
      if (
        frappe.session.user != frm.doc.assign_to &&
        frappe.session.user != "Administrator"
      ) {
        cur_frm.call({
          method: "obour_ticketing.api.is_ticket_master",
          args: {
            user: frappe.session.user,
            ticketing_group: frm.doc.ticketing_group,
            assign_to_user: frm.doc.assign_to,
          },
          callback: (r) => {
            console.log(r.message);
            if (!r.message) frm.events.set_readonly(frm);
          },
        });
      }
    }

    if (frm.doc.raised_by == frappe.session.user) {
      frm.remove_custom_button("Send Comment to User");
      // frm.events.set_readonly(frm);
    }

    if (frm.doc.status == 'Resolved' || frm.doc.status == 'Closed') {
      // frm.remove_custom_button("Send Comment to User");
      // frm.events.set_readonly(frm);
    }
    // remove create button
    frm.remove_custom_button("Task", "Create");
    frm.remove_custom_button("Close");
    $(".form-assignments").hide();
    // $(".form-attachments").hide();
    $(".form-shared").hide();
    $(".form-reviews").hide();
    // $(".form-tags").hide();
    // $(".form-sidebar-stats").hide();
    // $(".list-unstyled.sidebar-menu.text-muted").hide();

    frm.set_query("assign_to", function () {
      return {
        query: "obour_ticketing.queries.what_user_should_see",
        filters: {
          //   role: "Support Team",
          ticketing_group: frm.doc.ticketing_group,
          user: frappe.session.user,
          raised_by: frm.doc.raised_by,
        },
      };
    });
    // if (Boolean(frappe.user.has_role("Support Team")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_users",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });
    // else if (Boolean(frappe.user.has_role("Ticket Administrators")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_admins",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });
    // else if (Boolean(frappe.user.has_role("Ticket Supervisors")))
    //   frm.set_query("assign_to", function () {
    //     return {
    //       query: "obour_ticketing.queries.filter_assign_to_supers",
    //       filters: {
    //         //   role: "Support Team",
    //         ticketing_group: frm.doc.ticketing_group,
    //       },
    //     };
    //   });

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
        (frappe.user.has_role("Support Team") ||
          frappe.user.has_role("Ticket Supervisors")) &&
        frm.doc.status != "Resolved" &&
        frm.doc.status != "Closed"
      ) {
        frm.add_custom_button(__("Escalate..."), () => {
          frappe.call({
            method: "obour_ticketing.tasks.get_assignees",
            args: {
              docname: frm.doc.name,
            },
            callback: (r) => {
              // clearAssignToField();
              frm.call({
                method: "obour_ticketing.queries.current_user_escalate_to",
                args: {
                  user: frappe.session.user,
                  ticketing_group: frm.doc.ticketing_group,
                },
                callback: (res) => {
                  if (res.message == "Escalate to Supers") {
                    frm.call({
                      method: "obour_ticketing.tasks.clear_field_assign_to",
                      args: { docname: frm.doc.name },
                      callback: (r2) => {
                        escalateIfNeeded(
                          "Support Team",
                          "Supervisor",
                          "Escalating to Supervisors Group..."
                        );
                      },
                    });
                  } else if (res.message == "Escalate to Admins") {
                    frm.call({
                      method: "obour_ticketing.tasks.clear_field_assign_to",
                      args: { docname: frm.doc.name },
                      callback: (r2) => {
                        escalateIfNeeded(
                          "Ticket Supervisors",
                          "Admin",
                          "Escalating to Administrators Group..."
                        );
                      },
                    });
                  }
                },
              });
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
        });
      }
    }
  },

  validate(frm) {
    // if (frm.doc.assign_to)
    //   if (frm.doc.assign_to != frappe.session.user) {
    //     frappe.throw(
    //       __("You can just view it since you are not assigned to it!")
    //     );
    //   }

    // Set readonly for internal user raising an issue
    if (frm.doc.raised_by == frappe.session.user) {
      frm.remove_custom_button("Send Comment to User");
      // frm.events.set_readonly(frm);
    }

    // if (frm.doc.status == 'Resolved' || frm.doc.status == 'Closed') {
    //   // frm.remove_custom_button("Send Comment to User");
    //   frm.events.set_readonly(frm);
    // }

    //   This to get the admin and supervisor out of issue when they change the group
    if (frm.doc.assign_to) {
      if (
        frappe.session.user != frm.doc.assign_to &&
        frappe.session.user != "Administrator"
      ) {
        cur_frm.call({
          method: "obour_ticketing.api.is_ticket_master",
          args: {
            user: frappe.session.user,
            ticketing_group: frm.doc.ticketing_group,
            assign_to_user: frm.doc.assign_to,
          },
          callback: (r) => {
            console.log(r.message);
            if (!r.message) frm.events.set_readonly(frm);
          },
        });
      }
    } else {
      if (!frm.is_new()) {
        frm.doc.status = "Open";
        frm.refresh_fields();
      } else {
        frm.doc.status = "Un Assigned";
        frm.refresh_fields();
      }
    }
    // if (frm.doc.assign_to) {
    //   if (frappe.session.user != frm.doc.assign_to) {
    //     frm.events.set_readonly(frm);
    //   }
    // }
    // else {
    //   frm.doc.status = "Open";
    //   frm.refresh_fields();
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
    //     }
    //   });

    frappe.db
      .get_value("Issue", frm.doc.name, "assign_to")
      .then(function (response) {
        let assign_to = response.message.assign_to;
        // if (assign_to != null && assign_to != frm.doc.assign_to) {
        if (assign_to != frm.doc.assign_to) {
          frm.events.assign_to_function(frm);
          // frm.set_df_property("assign_to", "reqd", 1);
        }
      });
  },

  set_readonly(frm) {
    // $.each(frm.fields_dict, function (fieldname, field) {
    frm.set_df_property("subject", "read_only", 1);
    frm.set_df_property("assign_to", "read_only", 1);
    frm.set_df_property("ticketing_group", "read_only", 1);
    frm.set_df_property("issue_type", "read_only", 1);
    frm.set_df_property("customer", "read_only", 1);
    frm.set_df_property("priority", "read_only", 1);
    frm.set_df_property("attachments", "read_only", 1);
    frm.set_df_property("description", "read_only", 1);
    frm.set_df_property("service_level_agreement", "read_only", 1);
    frm.set_df_property("resolution_details", "read_only", 1);
    hide_field("reset_service_level_agreement");
    frm.refresh_fields();
    // frm.reload_doc();
    // frm.call({
    //   method: "obour_ticketing.tasks.reload_page",
    //   args: { event: "reload_doc" },
    //   callback(res) {
    //     console.log("ok");
    //     // frappe.set_route("List", "Issue");
    //   },
    // });
    //   }
    // });
  },
  assign_to_function(frm) {
    if (!frm.is_new())
      if (frm.doc.assign_to) {
        frm.call({
          method: "obour_ticketing.tasks.get_assignees",
          args: { docname: frm.doc.name },
          callback: function (response) {
            // if (frm.doc.assign_to) {
            frm.call({
              method: "frappe.desk.form.assign_to.add",
              args: {
                assign_to: [frm.doc.assign_to],
                doctype: "Issue",
                name: frm.doc.name,
              },
              callback(r) {
                frm.set_value("status", "In Progress");
                frm.refresh_fields();
                // frm.reload_doc();
                location.reload();
              },
            });
          },
        });
      } else {
        frm.call({
          method: "obour_ticketing.tasks.get_assignees",
          args: { docname: frm.doc.name },
          callback: function (response) {},
        });
        frm.doc.assign_to_full_name = "";
        frm.refresh_fields();
        location.reload();
      }
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
