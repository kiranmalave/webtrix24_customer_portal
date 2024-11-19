define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerSingleModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      customer_id: null,
      salutation: "mr",
      first_name: null,
      middle_name: null,
      last_name: null,
      mobile_no: null,
      birth_date: null,
      note: null,
      email: null,
      record_type: "individual",
      address: null,
      customer_image: null,
      billing_name: null,
      billing_address: null,
      mobile_no: null,
      branch_id: null,
      gst_no: null,
      adhar_number: null,
      website: null,
      countryCode:null,
      country: null,
      state: null,
      city:null,
      latitude: null,
      longitude: null,
      zipcode: null,
      assignee: null,
      assigneeName: null,
      office_land_line: null,
      stages: null,
      lead_source: null,
      gst_state: null,
      lead_priority: null,
      type: 'lead',
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'customerMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return customerSingleModel;
});
