define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var dashboardModel = Backbone.Model.extend({
    defaults: {
      totalCandidates: 1000,
      totalMales: 400,
      totalFemale: 600,
      todayRegister: 10,
    },
    urlRoot: function () {
      return APIPATH + 'dashboardDetails';
    },
    parse: function (response) {
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data;
    }
  });
  return dashboardModel;
});

