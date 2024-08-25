# import frappe

# def execute():
#     if not frappe.db.exists("Singles", "Payment Entry Settings"):
#         frappe.get_doc({
#             "doctype": "Singles",
#             "doctype": "Payment Entry Settings",
#             "field_name": "submit_payment_entry_from_dialog",
#             "value": 1
#         }).insert()