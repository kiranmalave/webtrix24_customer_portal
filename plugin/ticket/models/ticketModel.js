define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ticketModel = Backbone.Model.extend({
    idAttribute: "ticket_id"
  });
  return ticketModel;
});

