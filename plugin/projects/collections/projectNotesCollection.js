define([
  'underscore',
  'backbone',
  '../models/projectNoteModel'
], function (_, Backbone, projectNoteModel) {

  var customerNotesCollection = Backbone.Collection.extend({
    notes_id: null,
    model: projectNoteModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'projectMasterList/Notes';
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

  return customerNotesCollection;

});