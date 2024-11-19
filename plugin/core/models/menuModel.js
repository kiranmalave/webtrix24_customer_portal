define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var menuModel = Backbone.Model.extend({
    idAttribute: "menuID"
  });
  return menuModel;
});

