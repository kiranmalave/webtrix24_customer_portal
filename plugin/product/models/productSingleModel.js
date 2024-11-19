define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var productSingleModel = Backbone.Model.extend({
    idAttribute: "product_id",
    defaults: {
      product_id: null,
      product_description: null,
      quantity:0,
      gst:0.00,
      discount:0.00,
      sku:null,
      price:0.00,
      actual_cost:0.00,
      discount_type:'per',
      profit:0.00,
      margin:0.00,
      margin_in_per:0.00,
      compare_price:0.00,
      barcode:null, 
      product_type:null,
      is_amc: "no",
      with_gst:"no",
      shipping:"no",
      track_quantity:"no",
      free_servicing:null,
      amc_duration:null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'productMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return productSingleModel;
});
