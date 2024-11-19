define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var incomeModel = Backbone.Model.extend({
    idAttribute: "dashboard_id",
    defaults: {
      dashboard_id : null,
      type : 'invoice',
      name: 'Income',
      chart_type : 'line',
      view_type : 'graph',
      interval : 'last_7_days',
      period_type : 'days'
    },
    urlRoot: function () {
      return APIPATH + 'DashboardData/stagesWiseLeads';
    },
    parse: function (response) {
      console.log('response',response);
      return response.data;
    }
  });
  return incomeModel;
});

