frappe.ui.form.on('Sales Invoice', {
    refresh: function(frm) {
        if (frm.doc.docstatus == 1 && frm.doc.outstanding_amount != 0) {
            frm.add_custom_button("Make Payment", () => {
                frm.call({
                    method: "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry",
                    args: {
                        dt: frm.doc.doctype,
                        dn: frm.doc.name
                    },
                    callback: function(r) {
                        var doc = frappe.model.sync(r.message)[0]; // Ensure we get the first document
                        frm.doc.payment_schedule = null;

                        let d = new frappe.ui.Dialog({
                            title: "Enter Required Fields and Submit!",
                            fields: [
                                {
                                    label: 'Mode of Payment',
                                    fieldname: 'mode_of_payment',
                                    fieldtype: 'Link',
                                    options: 'Mode of Payment',
                                    reqd: 1
                                },
                                {
                                    label: 'Amount',
                                    fieldname: 'paid_amount',
                                    fieldtype: 'Currency',
                                    reqd: 1,
                                    default: frm.doc.outstanding_amount
                                },
                                {
                        
                                    label: 'Cheque/Reference No.',
                                    fieldname: 'reference_no',
                                    fieldtype: 'Data',
                                    reqd: 1
                                }
                            ],
                            size: 'small',
                            primary_action_label: "Save",
                            primary_action: function(values) {
                                frappe.db.get_single_value("Payment Entry Settings", "submit_payment_entry_from_dialog")
                                    .then(submit_from_dialog => {
                                        doc.mode_of_payment = values.mode_of_payment;
                                        doc.paid_amount = values.paid_amount;
                                        doc.reference_no = values.reference_no;
                                        doc.reference_date = frappe.datetime.now_datetime();

                                        if (submit_from_dialog) {
                                            frappe.call({
                                                method: "frappe.client.save",
                                                args: {
                                                    doc: doc
                                                },
                                                callback: function(save_response) {
                                                    if (!save_response.exc) {
                                                        frappe.call({
                                                            method: "frappe.client.submit",
                                                            args: {
                                                                doc: save_response.message
                                                            },
                                                            callback: function(submit_response) {
                                                                if (!submit_response.exc) {
                                                                    frappe.msgprint("Payment Entry submitted successfully.");
                                                                } else {
                                                                    frappe.msgprint("Error submitting Payment Entry: " + submit_response.exc);
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        frappe.msgprint("Error saving Payment Entry: " + save_response.exc);
                                                    }
                                                }
                                            });
                                        } else {
                                            d.hide();
                                            frappe.set_route("Form", doc.doctype, doc.name);
                                        }
                                    });
                            }
                        });
                        // d.fields_dict.mode_of_payment.df.onchange = function() {
                        //     const mop_value = this.get_value();
                        //     if(mop_value === 'Cash') {
                        //         d.fields_dict.reference_no.df.hidden = 1;
                        //     } else {
                        //         d.fields_dict.reference_no.df.hidden = 0;
                        //     }
                        //     d.refresh();
                        // }
                        d.show();
                    },
                });
            });
        }
    }
});
