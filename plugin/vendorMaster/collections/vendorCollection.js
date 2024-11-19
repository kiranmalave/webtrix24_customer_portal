define([
  'underscore',
  'backbone',
  '../models/vendorModel'
], function (_, Backbone, vendorModel) {

  var vendorCollection = Backbone.Collection.extend({
    vendor_id: null,
    model: vendorModel,
    initialize: function () {
    },
    url: function () {
      return APIPATH + 'vendorMasterList';
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
  return vendorCollection;
});