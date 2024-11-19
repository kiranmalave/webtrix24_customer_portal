define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var avablitySingleModel = Backbone.Model.extend({
    idAttribute: "schedule_id",
    defaults: {
      schedule_id: null,
      schedule_name: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
    },
    urlRoot: function () {
      return APIPATH + 'schedules/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return avablitySingleModel;
});
