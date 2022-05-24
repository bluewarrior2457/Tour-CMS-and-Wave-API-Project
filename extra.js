const bro = {
	request: 'GET /c/booking/show.xml?booking_id=3',
	error: 'OK',
	booking: {
		booking_id: '3',
		channel_id: '15810',
		account_id: '14811',
		channel_name: 'test',
		made_date_time: '2022-01-30 05:36:14',
		made_username: '',
		made_type: 'W',
		made_name: '',
		start_date: '2022-03-01',
		end_date: '2022-05-10',
		booking_name: 'test tour',
		booking_name_custom: '',
		status: '0',
		status_text: 'Quotation',
		voucher_url: 'https://voucher.tourcms.com/print.php?id=nV%2FflWDUkUCuDXS%2Bz%2BHCVUzjJ3W34UMJKPb7qSZ2yiQ%3D',
		barcode_data: 'TOURCMS|14811|3',
		expiry_date: '2022-02-13',
		cancel_reason: '0',
		cancel_text: 'Not cancelled',
		final_check: '0',
		lead_customer_id: '27821308',
		lead_customer_name: 'trial 2 John Paull',
		lead_customer_email: 'test@gmail.com',
		lead_customer_tel_home: '222222222',
		lead_customer_tel_mobile: '',
		lead_customer_contact_note: '',
		lead_customer_agent_ref: '',
		lead_customer_travelling: '1',
		customer_count: '2',
		sale_currency: 'EUR',
		sales_revenue: '200.00',
		sales_revenue_display: '&#8364;200.00',
		deposit: '0.00',
		deposit_display: '&#8364;0.00',
		agent_credentials: '',
		agent_ref: '',
		agent_ref_components: '',
		booking_has_net_price: '0',
		payment_status: '0',
		payment_status_text: 'No payment made',
		balance_owed_by: 'C',
		balance: '200.00',
		balance_display: '&#8364;200.00',
		balance_due: '2022-01-18',
		customer_special_request: 'sdfdsfhdsfh',
		customers_agecat_breakdown: '1 Adult, 1 Child',
		important_note: '',
		workflow_note: '',
		customers: { customer: [ [ Object ], [ Object ] ] },
		payments: { payment: [] },
		custom_fields: { field: [] }
	}
};

let postData = {
	slot_id: slotId,
	guest_name: lead_customer_name,
	guest_email: lead_customer_email,
	guest_country_id: countryId
	// tickets: {
	// 	'245': req.body.items[0].quantities[0].value, child
	// 	'246': req.body.items[0].quantities[0].valueC, adult
	// }
};
