define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var emailMasterModel = Backbone.Model.extend({
    idAttribute: "tempID"
  });
  return emailMasterModel;
});

