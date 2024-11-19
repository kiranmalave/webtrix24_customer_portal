define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var occasionModel = Backbone.Model.extend({
    idAttribute: "occasionID"
  });
  return occasionModel;
});

