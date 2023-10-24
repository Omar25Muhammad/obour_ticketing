frappe.listview_settings["Issue"] = {
  colwidths: { subject: 6 },
  add_fields: ["priority"],
  onload: function (listview) {},
  get_indicator: function (doc) {
    if (doc.status === "Open") {
      if (!doc.priority) doc.priority = "Medium";
      const color = {
        Low: "yellow",
        Medium: "orange",
        High: "red",
      };
      return [__(doc.status), color[doc.priority] || "red", `status,=,Open`];
    } else if (doc.status === "Closed") {
      return [__(doc.status), "green", "status,=," + doc.status];
    } else {
      return [__(doc.status), "gray", "status,=," + doc.status];
    }
  },
};
