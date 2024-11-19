define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var celebrateWithUsModel = Backbone.Model.extend({
    idAttribute: "celebrate_id"
  });
  return celebrateWithUsModel;
});

