define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var dashboardModel = Backbone.Model.extend({
    idAttribute: "dashboard_id"
  });
  return dashboardModel;
});


