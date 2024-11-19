define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var eventModel = Backbone.Model.extend({
    idAttribute: "event_id"
  });
  return eventModel;
});

