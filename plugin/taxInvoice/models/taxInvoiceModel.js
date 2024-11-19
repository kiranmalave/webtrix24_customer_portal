define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var taxInvoiceModel = Backbone.Model.extend({
    defaults: {
    	invoiceID:null,
    	srno:null,
    }
  });
  return taxInvoiceModel;
});

