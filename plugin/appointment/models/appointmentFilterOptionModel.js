define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var appointmentFilterOptionModel = Backbone.Model.extend({
    idAttribute: "appointmentID",
    defaults: {
      textSearch: 'start_date',
      textval: null,
      status: 'active',
      orderBy: 'created_date',
      order: 'DESC',
    }
  });
  return appointmentFilterOptionModel;
});

