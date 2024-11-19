define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var vendorSingleModel = Backbone.Model.extend({
    idAttribute: "vendor_id",
    defaults: {
      vendor_id: null,
      vendor_name: null,
      contact_no: null,
      email: null,
      address: null,
      service_type: null,
      profile: null,
      gst_no: null,
      pan: null,
      bank_name: null,
      country_code: null,
      account_no: null,
      ifsc: null,
      description: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'vendorMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return vendorSingleModel;
});
