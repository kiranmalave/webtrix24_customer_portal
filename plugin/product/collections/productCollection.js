define([
  'underscore',
  'backbone',
  '../models/productModel'
], function (_, Backbone, productModel) {

  var productCollection = Backbone.Collection.extend({
    product_id: null,
    model: productModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'productMasterList';
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

  return productCollection;

});