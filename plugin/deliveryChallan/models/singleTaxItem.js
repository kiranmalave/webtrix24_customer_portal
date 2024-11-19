define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleTaxItem = Backbone.Model.extend({
    idAttribute: "srno",
     defaults: {
        srno:null,
        invoiceID:null,
        customer_id:null,
        invoiceDate:null,
        sgst:null,
        cgst:null,
        igst:null,
        description:null,
        quantity:0,
        unit:0,
        rate:0.00,
        amount:0.00,
        invoiceLineChrgID:null,
    },
  });
  return singleTaxItem;
});
