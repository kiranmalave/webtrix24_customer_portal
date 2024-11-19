define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var prefixModel = Backbone.Model.extend({
    idAttribute: "prefixID"
  });
  return prefixModel;
});

