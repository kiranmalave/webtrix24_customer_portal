define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var taskModel = Backbone.Model.extend({
    idAttribute: "task_id",
    idAttribute: "comment_id",
    idAttribute: "project_id",
    idAttribute: "history_id",
  });
  return taskModel;
});

