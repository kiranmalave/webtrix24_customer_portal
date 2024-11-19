define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ticketFilterOptionModel = Backbone.Model.extend({
    idAttribute: "ticket_id",
    defaults: {
      textSearch: 'ticket_id',
      textval: null,
      category: null,
      expense_by: null,
      fromDate: null,
      toDate: null,
      status: null,
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return ticketFilterOptionModel;
});