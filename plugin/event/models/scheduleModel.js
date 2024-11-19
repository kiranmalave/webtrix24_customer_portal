define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var scheduleModel = Backbone.Model.extend({
    idAttribute: "schedule_id"
  });
  return scheduleModel;
});