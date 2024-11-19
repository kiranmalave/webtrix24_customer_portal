define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pushServiceSingleModel = Backbone.Model.extend({
    idAttribute: "push_service_id",
    defaults: {
      push_service_id: null,
      pushService_number: null,
      customer_id: null,
      name: null,
      contact_number: null,
      email_id: null,
      payment_method: null,
      type_of_donation: null,
      date_of_donation: null,
      address: null,
      pushService_in_name_of: null,
      pan_number: null,
      aadhar_number: null,
      donation_amount : null,
      date_of_donation : null,
      status: 'pending',
    },
    urlRoot: function () {
      return APIPATH + 'pushServiceMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return pushServiceSingleModel;
});
