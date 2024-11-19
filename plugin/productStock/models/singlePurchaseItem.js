define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singlePurchaseItem = Backbone.Model.extend({
    idAttribute: "sr_no",
     defaults: {
        sr_no:null,
        product_id:null,
        product_qty:null,
    },
  });
  return singlePurchaseItem;
});
