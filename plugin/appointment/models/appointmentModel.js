define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var appointmentModel = Backbone.Model.extend({
    idAttribute: "appointmentID"
  });
  return appointmentModel;
});

