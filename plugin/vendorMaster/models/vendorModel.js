define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var vendorModel = Backbone.Model.extend({
    idAttribute: "vendor_id"
  });
  return vendorModel;
});

