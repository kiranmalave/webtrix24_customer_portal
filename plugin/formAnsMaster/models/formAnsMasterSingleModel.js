define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formAnsMasterSingleModel = Backbone.Model.extend({
    idAttribute: "qaID",
     defaults: {
        qaID:null,
        status:'active',
    },
  });
  return formAnsMasterSingleModel;
});
