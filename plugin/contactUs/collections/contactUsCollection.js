define([
  'underscore',
  'backbone',
  '../models/contactUsModel'
], function (_, Backbone, contactUsModel) {

  var contactUsCollection = Backbone.Collection.extend({
    contactUsID: null,
    model: contactUsModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'contactUsList';
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

  return contactUsCollection;

});