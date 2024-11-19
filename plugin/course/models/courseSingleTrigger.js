define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var triggerModel = Backbone.Model.extend({
    idAttribute: "schema_id",
  });
  return triggerModel;
});
