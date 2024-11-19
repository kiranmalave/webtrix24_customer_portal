define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var notificationModel = Backbone.Model.extend({
    idAttribute: "notification_id",
  });
  return notificationModel;
});
