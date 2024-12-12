define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerSetupModel = Backbone.Model.extend({
    idAttribute: "memberID",
    defaults: {
      comapnyName: null,
      gst: null,
      website: null,
      company_size: null,
      source: null,
      companyLogo: null,
      vcode:null,
    },
    urlRoot: function () {
      return APIPATH + 'companySetup';
    },
    parse: function (response) {
      this.keyDetails = response.keyDetails;
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data[0];
    }
  });
  return customerSetupModel;
});

