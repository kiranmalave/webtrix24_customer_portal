define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var projectsSingleModel = Backbone.Model.extend({
    idAttribute: "project_id",
    defaults: {
      project_id: null,
      title: null,
      project_priority: null,
      project_type: null,
      description: null,
      expected_revenue: null,
      expected_expences: null,
      start_date: null,
      end_date: null,
      customer_id: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      project_status: 'not_notstarted',
      project_stages: null,
      project_status_date: null,
      taskCount: '0',
    },
    urlRoot: function () {
      return APIPATH + 'projects/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return projectsSingleModel;
});
