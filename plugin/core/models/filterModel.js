define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var filterModel = Backbone.Model.extend({
    idAttribute: "filter_id",
  });
  return filterModel;
});
