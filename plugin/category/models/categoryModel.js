define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var categoryModel = Backbone.Model.extend({
    idAttribute: "category_id"
  });
  return categoryModel;
});

