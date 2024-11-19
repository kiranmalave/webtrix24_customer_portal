define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var avablitySingleModel = Backbone.Model.extend({
    idAttribute: "scheduleID",
    defaults:{
      schedule_id: null,
      schedule_day: null,
      start_time:null,
      end_time:null,
      leader_id:null,
      description:null,
      created_by:null,
      modified_by:null,
      created_date:null,
      modified_date:null,
    },
    urlRoot: function () {
      return APIPATH + 'schedulesMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return avablitySingleModel;
});
