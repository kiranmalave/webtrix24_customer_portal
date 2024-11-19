define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var otpModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
      adminID: null,
      otp: null,
      password: null,
      confirmPassword: null,
    },
    urlRoot: function () {
      return APIPATH + 'validateOtp';
    },
    parse: function (response) {
      this.keyDetails = response.keyDetails;
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data[0];
    }
  });
  return otpModel;
});
