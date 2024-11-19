define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formAnsMasterModel = Backbone.Model.extend({
    idAttribute: "qaID"
  });
  return formAnsMasterModel;
});

