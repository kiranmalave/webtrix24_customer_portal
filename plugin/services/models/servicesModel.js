define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var servicesModel = Backbone.Model.extend({
    idAttribute: "service_id"
  });
  return servicesModel;
});

