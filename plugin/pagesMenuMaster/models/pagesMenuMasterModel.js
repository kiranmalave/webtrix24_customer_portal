define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMenuMasterModel = Backbone.Model.extend({
    idAttribute: "menuID"
  });
  return pagesMenuMasterModel;
});

