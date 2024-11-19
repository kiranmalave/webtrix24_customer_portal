define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var linkedFormModel = Backbone.Model.extend({
    idAttribute: "menuID",
     defaults: {
        menuID:null,
    },
  });
  return linkedFormModel;
});