define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var appointmentDate = Backbone.Model.extend({
    idAttribute: "appointmentID",
    defaults: {
      events: null,
    },
    urlRoot: function () {
      return APIPATH + 'appointmentDateList/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return appointmentDate;
});
