define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var blogsMasterModel = Backbone.Model.extend({
    idAttribute: "blogID"
  });
  return blogsMasterModel;
});

