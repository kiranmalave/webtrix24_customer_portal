define([
  'underscore',
  'backbone',
  '../models/accountModel'
], function (_, Backbone, accountModel) {

  var accountCollection = Backbone.Collection.extend({
    account_id: null,
    model: accountModel,
    initialize: function () {
    },
    url: function () {
      return APIPATH + 'accountMasterList';
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
  return accountCollection;
});