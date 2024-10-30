# Copyright (c) 2024, Patrick and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import add_to_date, getdate

def execute(filters=None):
    return get_columns(), get_data(filters)

def get_data(filters):
    conditions = []
    
    # invoices_with_dn = frappe.get_all("Delivery Note",
    #     filters={
    #         "docstatus": 1
    #     },
    #     fields=["items.against_sales_invoice"],
    #     as_list=1
    # )

    if filters.get('customer'):
        conditions.append(f"customer = '{filters.get('customer')}'")
    
    if filters.get('delivery_period') == 'Today':
        start_date = getdate()
        end_date = getdate()
        conditions.append(f"DATE(custom_expected_delivery_time) BETWEEN '{start_date}' AND '{end_date}'")

    elif filters.get('delivery_period') == 'This Morning':
        start_date = f"{getdate()} 00:00:00"
        end_date = f"{getdate()} 11:59:59"
        conditions.append(f"DATE(custom_expected_delivery_time) BETWEEN '{start_date}' AND '{end_date}'")
    
    elif filters.get("delivery_period") == "Tomorrow":
        today = getdate()
        tomorrow_start = add_to_date(today, days=1).strftime('%Y-%m-%d') + " 00:00:00"
        tomorrow_end = add_to_date(today, days=1).strftime('%Y-%m-%d') + " 23:59:59"
        conditions.append(f"DATE(custom_expected_delivery_time) BETWEEN '{tomorrow_start}' AND '{tomorrow_end}'")

    elif filters.get("delivery_period") == "This Week":
        start_date = getdate().strftime('%Y-%m-%d') + " 00:00:00"
        end_date = add_to_date(getdate(), days=7).strftime('%Y-%m-%d') + " 23:59:59"
        conditions.append(f"DATE(custom_expected_delivery_time) BETWEEN '{start_date}' AND '{end_date}'")
    
    elif filters.get("delivery_period") == "This Month":
        start_date = getdate().strftime('%Y-%m-') + "01 00:00:00"
        end_date = getdate().strftime('%Y-%m-') + "31 23:59:59"
        conditions.append(f"DATE(custom_expected_delivery_time) BETWEEN '{start_date}' AND '{end_date}'")

    if filters.get('custom_expected_delivery_time'):
        conditions.append(f"DATE(custom_expected_delivery_time) = '{filters.get('custom_expected_delivery_time')}'")
    
    conditions.append("`tabSales Invoice`.name NOT IN (SELECT DISTINCT against_sales_invoice FROM `tabDelivery Note Item` WHERE docstatus = 1 AND against_sales_invoice IS NOT NULL)")
    conditions.append("`tabSales Invoice`.update_stock = 0")
    conditions.append("`tabSales Invoice`.docstatus = 1")

    conditions_str = " AND ".join(conditions) if conditions else "1=1"

    data = frappe.db.sql(f"""
        SELECT
            `tabSales Invoice`.name,
            customer,
            custom_expected_delivery_time,
            GROUP_CONCAT(CONCAT(item_code, '(', ROUND(qty, 2), ' ', uom, ') ') SEPARATOR ',') AS items
        FROM
            `tabSales Invoice`
        JOIN
            `tabSales Invoice Item` ON `tabSales Invoice`.name = `tabSales Invoice Item`.parent
        WHERE
            {conditions_str}
        GROUP BY
            `tabSales Invoice`.name
        """)
    
    return data

def get_columns():
    return [
        "Invoice No:Link/Sales Invoice:200",
        "Customer:Data:120",
        "Delivery Date:Datetime:200",
        "Items To Be Delivered:Link/Sales Invoice Item:500"
    ]