const axios = require('axios');
const express = require('express');
var TourCMSApi = require('tourcms');
const app = express();
const port = process.env.PORT || 3000;
const url = `https://wave3app-staging.herokuapp.com/mark_api/v1`;
const cors = require('cors');
const date = require('date-and-time');
// ___________________________________________________________________________________________________________________________

app.use(express.json());
app.use(cors());

// ___________________________________________________________________________________________________________________________

// /?apiKey=&marketplaceId=&markApiKey=

app.get('/', (req, res) => {
	let { channel_id, apiKey, marketplaceId, markApiKey, booking_id } = req.query;
	let channelId = parseInt(channel_id);
	let bookingId = parseInt(booking_id);

	let TourCMS = new TourCMSApi({
		channelId: channelId,
		apiKey: apiKey,
		marketplaceId: parseInt(marketplaceId)
	});

	TourCMS.showBooking({
		bookingId: bookingId,
		callback: function(response) {
			let tourName = response.booking.booking_name;

			let { start_date, lead_customer_name, lead_customer_email, customer_count } = response.booking;

			axios({
				method: 'get',
				url: `${url}/products`,
				headers: {
					Authorization: markApiKey
				}
			})
				.then((response) => {
					let data = response.data;
					let tour = null;

					for (let i = 0; i < data.length; i++) {
						if (data[i].name === tourName) {
							tour = data[i];
						}
					}

					if (tour === null || undefined) {
						res.send('This tour is not a product');
					} else if (tour.time_based) {
						// if the product is time based this happens

						axios({
							method: 'get',
							url: `${url}/products/${tour.id}/availability/?date=${start_date}`,
							headers: {
								Authorization: markApiKey
							}
						})
							.then((response) => {
								slotId = response.data[0].slots[0].id;
								let ticketId = null;
								countryCode = tour.location.country.code;

								for (let i = 0; i < response.data[0].slots[0].ticket_categories.length; i++) {
									if (response.data[0].slots[0].ticket_categories[i].name === 'Adult') {
										ticketId = response.data[0].slots[0].ticket_categories[i].id.toString();
									}
								}

								console.log(ticketId);

								axios({
									method: 'get',
									url: `${url}/countries`,
									headers: {
										Authorization: markApiKey
									}
								})
									.then((response) => {
										let countires = response.data;
										let countryId = null;

										for (let i = 0; i < countires.length; i++) {
											if (countires[i].code === countryCode) {
												countryId = countires[i].id;
											}
										}

										let postData = {
											slot_id: slotId,
											guest_name: lead_customer_name,
											guest_email: lead_customer_email,
											guest_country_id: countryId,
											tickets: {}
										};
										postData.tickets[ticketId] = parseInt(customer_count);
										console.log(postData);

										axios({
											method: 'post',
											url: `${url}/reservations`,
											headers: {
												Authorization: markApiKey
											},
											data: postData
										})
											.then((responseReservationPost) => {
												console.log(responseReservationPost.data);
												axios({
													method: 'post',
													url: `${url}/bookings?reservation_id=${responseReservationPost.data
														.id}`,
													headers: {
														Authorization: markApiKey
													},
													data: postData
												})
													.then((responseBookingPost) => {
														res.send(responseBookingPost.data);
														console.log('Booking Success');
													})
													.catch((error) => {
														console.log(error);
													});
											})
											.catch((error) => {
												console.log(error);
											});
									})
									.catch((error) => {
										console.log(error);
									});
							})
							.catch((error) => {
								console.log(error);
							});
					} else {
						// if the product is not time based this happens

						axios({
							method: 'get',
							url: `${url}/products/${tour.id}`,
							headers: {
								Authorization: markApiKey
							}
						})
							.then((response) => {
								data = response.data;
								optionId = data.options[0].id;
								let ticketId = null;
								countryCode = data.location.country.code;

								for (let i = 0; i < data.options[0].ticket_categories.length; i++) {
									if (data.options[0].ticket_categories[i].name === 'Adult') {
										ticketId = data.options[0].ticket_categories[i].id.toString();
									}
								}

								axios({
									method: 'get',
									url: `${url}/countries`,
									headers: {
										Authorization: markApiKey
									}
								})
									.then((response) => {
										let countires = response.data;
										let countryId = null;

										for (let i = 0; i < countires.length; i++) {
											if (countires[i].code === countryCode) {
												countryId = countires[i].id;
											}
										}

										let postData = {
											option_id: optionId,
											guest_name: lead_customer_name,
											guest_email: lead_customer_email,
											guest_country_id: countryId,
											tickets: {}
										};
										postData.tickets[ticketId] = parseInt(customer_count);
										console.log(postData);

										axios({
											method: 'post',
											url: `${url}/reservations`,
											headers: {
												Authorization: markApiKey
											},
											data: postData
										})
											.then((responseReservationPost) => {
												console.log(responseReservationPost.data);
												axios({
													method: 'post',
													url: `${url}/bookings?reservation_id=${responseReservationPost.data
														.id}`,
													headers: {
														Authorization: markApiKey
													},
													data: postData
												})
													.then((responseBookingPost) => {
														res.send(responseBookingPost.data);
														console.log('Booking Success');
													})
													.catch((error) => {
														console.log(error);
													});
											})
											.catch((error) => {
												console.log(error);
											});
									})
									.catch((error) => {
										console.log(error);
									});
							})
							.catch((error) => {
								console.log(error);
							});
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});
});

// ___________________________________________________________________________________________________________________________

app.listen(port, () => {
	console.log(`Example app listening at ${port}`);
});
