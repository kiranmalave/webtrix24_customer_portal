define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var menuPagesModel = Backbone.Model.extend({
    idAttribute: "menuPageID"
  });
  return menuPagesModel;
});

