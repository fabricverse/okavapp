// Copyright (c) 2024, Patrick and contributors
// For license information, please see license.txt

frappe.query_reports["Sales Invoices Pending Delivery"] = {
	"filters": [
		{
			"fieldname":"customer",
			"label":"Customer",
			"fieldtype":"Link",
			"options":"Customer",
			"reqd":0
		},
		{
			"fieldname":"custom_expected_delivery_time",
			"label":"From Date",
			"fieldtype":"Date",
			"reqd":0,
			"default": frappe.datetime.now_date()
		},
		{
			"fieldname":"delivery_period",
			"label":"Delivery Period",
			"fieldtype":"Select",
			"options":"\nToday\nThis Morning\nTomorrow\nThis Week\nThis Month",
			"reqd":0,
			"default":""
		}
	]
};
