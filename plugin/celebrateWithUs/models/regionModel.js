define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var regionModel = Backbone.Model.extend({
    idAttribute: "regionID"
  });
  return regionModel;
});

