define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var selectedMenuIDModel = Backbone.Model.extend({
    idAttribute: "menuID",
    defaults: {
        menuID:null,
    }
  });
  return selectedMenuIDModel;
});
