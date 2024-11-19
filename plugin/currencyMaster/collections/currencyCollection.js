define([
  'underscore',
  'backbone',
  '../models/currencyModel'
], function (_, Backbone, currencyModel) {

  var currencyCollection = Backbone.Collection.extend({
    currency_id: null,
    model: currencyModel,
    initialize: function () {
    },
    url: function () {
      return APIPATH + 'currencyMasterList';
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
  return currencyCollection;
});