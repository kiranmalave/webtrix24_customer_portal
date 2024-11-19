define([
  'underscore',
  'backbone',
  '../../task/models/taskModel'
], function (_, Backbone, taskModel) {

  var commentCollection = Backbone.Collection.extend({
    comment_id: null,
    model: taskModel,
    initialize: function () {
    },
    url: function () {
      return APIPATH + 'commentsListProject';
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

  return commentCollection;

});