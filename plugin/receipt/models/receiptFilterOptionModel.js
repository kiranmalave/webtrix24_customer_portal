define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var receiptFilterOptionModel = Backbone.Model.extend({
    idAttribute: "receipt_id",
    defaults: {
      textSearch: '',
      textval: null,
      donationFromDate: null,
      donationToDate: null,
      createdFromDate: null,
      createdToDate: null,
      // payment_id: null,
      // donation_id: null,
      // customer_id: null,
      status: null,
      orderBy:'t.created_date' ,
      order:'DESC' ,
    }
  });
  return receiptFilterOptionModel;
});

