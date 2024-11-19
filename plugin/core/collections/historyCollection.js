define([
  'underscore',
  'backbone',
  '../../task/models/taskModel'
], function (_, Backbone, taskModel) {

  var historyCollection = Backbone.Collection.extend({
    history_id: null,
    model: taskModel,
    initialize: function () {
    },
    url: function () {
      return APIPATH + 'history';
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

  return historyCollection;

});