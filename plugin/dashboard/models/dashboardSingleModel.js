define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var dashboardModel = Backbone.Model.extend({
    idAttribute: "dashboard_id",
    defaults: {
      dashboard_id : null,
      name : null,
      user_id : null,
      body : null,
      details : null,
      created_by: null,
      modified_by: null,
      create_date: null,
      modified_date: null,
      status:'inactive'
    },
    urlRoot: function () {
      return APIPATH + 'dashboard/';
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return dashboardModel;
});

