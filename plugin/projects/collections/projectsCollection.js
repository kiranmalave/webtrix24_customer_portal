define([
  'underscore',
  'backbone',
  '../models/projectsModel'
], function (_, Backbone, projectsModel) {

  var projectsCollection = Backbone.Collection.extend({
    clients_id: null,
    model: projectsModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'projectsList';
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

  return projectsCollection;

});