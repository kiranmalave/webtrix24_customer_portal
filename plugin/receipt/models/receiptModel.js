define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var customerModel = Backbone.Model.extend({
    idAttribute: "receipt_id"
  });
  return customerModel;
});

