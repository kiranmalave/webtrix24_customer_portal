define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var customerModel = Backbone.Model.extend({
    idAttribute: "customer_id"
  });
  return customerModel;
});

