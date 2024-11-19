define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ticketSingleModel = Backbone.Model.extend({
    idAttribute: "ticket_id",
    defaults: {
      ticket_id: null,
      subject: null,
      description: null,
      email: null,
      phone: null,
      customer_id: null,
      due_date: null,
      priority_id: null,
      ticket_type: null,
      ticket_category: null,
      status: "open",
    },
    urlRoot: function () {
      return APIPATH + 'ticket/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return ticketSingleModel;
});