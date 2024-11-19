define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var customerModel = Backbone.Model.extend({
    idAttribute: "push_service_id"
  });
  return customerModel;
});

