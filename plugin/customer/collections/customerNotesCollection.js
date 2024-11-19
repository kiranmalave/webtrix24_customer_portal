define([
  'underscore',
  'backbone',
  '../models/customerNoteModel'
], function (_, Backbone, customerNoteModel) {

  var customerNotesCollection = Backbone.Collection.extend({
    notes_id: null,
    model: customerNoteModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'customerMasterList/Notes';
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