define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var customModel = Backbone.Model.extend({
    idAttribute: "id"
  });
  return customModel;
});
