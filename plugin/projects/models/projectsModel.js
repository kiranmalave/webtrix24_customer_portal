define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var projectsModel = Backbone.Model.extend({
    idAttribute: "project_id"
  });
  return projectsModel;
});

