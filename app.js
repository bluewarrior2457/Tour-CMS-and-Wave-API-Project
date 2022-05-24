const axios = require("axios");
const express = require("express");
var TourCMSApi = require("tourcms");
const app = express();
const port = process.env.PORT || 3000;
const url = `https://wave.live/mark_api/v1`;
const cors = require("cors");
const date = require("date-and-time");
// ___________________________________________________________________________________________________________________________

app.use(express.json());
app.use(cors());

// ___________________________________________________________________________________________________________________________

app.get("/trial", (req, res) => {
  res.send("API is working");
});

app.get("/bro/:apiKey/:marketplaceId/:markApiKey", (req, res) => {
  res.send({ params: req.params, query: req.query });
});

app.get("/:apiKey/:marketplaceId/:markApiKey", (req, res) => {
  let { channel_id, booking_id, event } = req.query;
  let { apiKey, marketplaceId, markApiKey } = req.params;
  let channelId = parseInt(channel_id);
  let bookingId = parseInt(booking_id);

  let TourCMS = new TourCMSApi({
    channelId: channelId,
    apiKey: apiKey,
    marketplaceId: parseInt(marketplaceId),
  });

  TourCMS.showBooking({
    bookingId: bookingId,
    callback: function (response) {
      let tourName = response.booking.booking_name;
      // let tourName = 'Museum visit';

      let {
        start_date,
        lead_customer_name,
        lead_customer_email,
        customer_count,
        lead_customer_agent_ref,
        customers_agecat_breakdown,
      } = response.booking;

      if (
        event === "new_confirmed_web" ||
        event === "new_confirmed_staff" ||
        event === "new_quotation_web"
      ) {
        axios({
          method: "get",
          url: `${url}/products`,
          headers: {
            Authorization: markApiKey,
          },
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
              res.send("This tour is not a product");
            } else if (tour.time_based) {
              // if the product is time based this happens
              console.log(start_date);
              axios({
                method: "get",
                url: `${url}/products/${tour.id}/availability/?date=${start_date}`,
                headers: {
                  Authorization: markApiKey,
                },
              })
                .then((response) => {
                  slotId = response.data[0].slots[0].id;
                  let tickets = {};
                  countryCode = tour.location.country.code;

                  for (
                    let i = 0;
                    i < response.data[0].slots[0].ticket_categories.length;
                    i++
                  ) {
                    if (
                      customers_agecat_breakdown.includes(
                        response.data[0].slots[0].ticket_categories[i].name
                      )
                    ) {
                      // '22 Adult, 21 Child'
                      let ticketId =
                        response.data[0].slots[0].ticket_categories[
                          i
                        ].id.toString();
                      if (
                        customers_agecat_breakdown.indexOf(
                          response.data[0].slots[0].ticket_categories[i].name
                        ) < 5
                      ) {
                        let index = customers_agecat_breakdown.indexOf(
                          response.data[0].slots[0].ticket_categories[i].name
                        );
                        let quantity = parseInt(
                          customers_agecat_breakdown.slice(0, index)
                        );
                        tickets[ticketId] = quantity;
                      } else {
                        let index = customers_agecat_breakdown.indexOf(
                          response.data[0].slots[0].ticket_categories[i].name
                        );
                        let quantity = parseInt(
                          customers_agecat_breakdown.slice(index - 3, index)
                        );
                        tickets[ticketId] = quantity;
                      }
                    }
                  }

                  axios({
                    method: "get",
                    url: `${url}/countries`,
                    headers: {
                      Authorization: markApiKey,
                    },
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
                        api_booking_ref: lead_customer_agent_ref,
                        tickets,
                      };

                      console.log(postData);

                      axios({
                        method: "post",
                        url: `${url}/reservations`,
                        headers: {
                          Authorization: markApiKey,
                        },
                        data: postData,
                      })
                        .then((responseReservationPost) => {
                          axios({
                            method: "post",
                            url: `${url}/bookings?reservation_id=${responseReservationPost.data.id}`,
                            headers: {
                              Authorization: markApiKey,
                            },
                            data: postData,
                          })
                            .then((responseBookingPost) => {
                              res.send(responseBookingPost.data);
                              console.log("Booking Success");
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
                method: "get",
                url: `${url}/products/${tour.id}`,
                headers: {
                  Authorization: markApiKey,
                },
              })
                .then((response) => {
                  data = response.data;
                  optionId = data.options[0].id;
                  let tickets = {};
                  countryCode = data.location.country.code;

                  for (
                    let i = 0;
                    i < data.options[0].ticket_categories.length;
                    i++
                  ) {
                    if (
                      customers_agecat_breakdown.includes(
                        data.options[0].ticket_categories[i].name
                      )
                    ) {
                      // '22 Adult, 21 Child'
                      let ticketId =
                        data.options[0].ticket_categories[i].id.toString();
                      if (
                        customers_agecat_breakdown.indexOf(
                          data.options[0].ticket_categories[i].name
                        ) < 5
                      ) {
                        let index = customers_agecat_breakdown.indexOf(
                          data.options[0].ticket_categories[i].name
                        );
                        let quantity = parseInt(
                          customers_agecat_breakdown.slice(0, index)
                        );
                        tickets[ticketId] = quantity;
                      } else {
                        let index = customers_agecat_breakdown.indexOf(
                          data.options[0].ticket_categories[i].name
                        );
                        let quantity = parseInt(
                          customers_agecat_breakdown.slice(index - 3, index)
                        );
                        tickets[ticketId] = quantity;
                      }
                    }
                  }

                  axios({
                    method: "get",
                    url: `${url}/countries`,
                    headers: {
                      Authorization: markApiKey,
                    },
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
                        api_booking_ref: lead_customer_agent_ref,
                        tickets,
                      };

                      console.log(postData);

                      axios({
                        method: "post",
                        url: `${url}/reservations`,
                        headers: {
                          Authorization: markApiKey,
                        },
                        data: postData,
                      })
                        .then((responseReservationPost) => {
                          console.log(responseReservationPost.data);
                          axios({
                            method: "post",
                            url: `${url}/bookings?reservation_id=${responseReservationPost.data.id}`,
                            headers: {
                              Authorization: markApiKey,
                            },
                            data: postData,
                          })
                            .then((responseBookingPost) => {
                              res.send(responseBookingPost.data);
                              console.log("Booking Success");
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
      } else {
        console.log("Event not correct");
      }
    },
  });
});

// ___________________________________________________________________________________________________________________________

app.listen(port, () => {
  console.log(`Example app listening at ${port}`);
});
