define([
  'underscore',
  'backbone',
  '../models/taskModel'
], function (_, Backbone, taskModel) {

  var taskCollection = Backbone.Collection.extend({
    task_id: null,
    model: taskModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'taskMasterList';
    },
    parse: function (response) {
      this.pageinfo = response.paginginfo;
      this.totalRecords = response.totalRecords;
      this.endRecords = response.end;
      this.flag = response.flag;
      this.msg = response.msg;
      this.loadstate = response.loadstate;
      return response.data;
    }
  });

  return taskCollection;

});