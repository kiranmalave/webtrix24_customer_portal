define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var selectedMenueModel = Backbone.Model.extend({
    idAttribute: "sectionID",
    defaults: {
        sectionID:null,
    }
  });
  return selectedMenueModel;
});
