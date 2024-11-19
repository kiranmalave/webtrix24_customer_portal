define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var deliveryChallanModel = Backbone.Model.extend({
    defaults: {
    	invoiceID:null,
    	srno:null,
    }
  });
  return deliveryChallanModel;
});

