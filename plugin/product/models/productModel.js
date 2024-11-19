define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var productModel = Backbone.Model.extend({
    idAttribute: "product_id"
  });
  return productModel;
});

