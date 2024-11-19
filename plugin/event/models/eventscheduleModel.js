define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var eventscheduleModel = Backbone.Model.extend({
    idAttribute: "scheduleID"
  });
  return eventscheduleModel;
});

