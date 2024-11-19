define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleProductStockModel = Backbone.Model.extend({
    idAttribute: "purchase_id",
    defaults: {
      purchase_id: null,
      purchase_date:  null,
      purchase_number: null,
      challan_number: null,
      challan_date: null,
      remark: null,
      store_id: null,
      vender_id: null,
      narrList: null,
      isEdit: 'yes',
    },
    urlRoot: function () {
      return APIPATH + 'stockMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleProductStockModel;
});
