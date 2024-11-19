define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var productStockModel = Backbone.Model.extend({
    defaults: {
    	purchase_id:null,
    	srno:null,
    }
  });
  return productStockModel;
});

