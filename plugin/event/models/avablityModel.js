define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var avablityModel = Backbone.Model.extend({
    idAttribute: "scheduleID"
  });
  return avablityModel;
});

