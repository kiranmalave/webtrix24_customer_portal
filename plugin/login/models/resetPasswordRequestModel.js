define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var resetPasswordRequestModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
      email: null,
      username: null,
      password: null
    },
    urlRoot: function () {
      return APIPATH + 'resetPasswordRequest';
    },
    parse: function (response) {
      this.keyDetails = response.keyDetails;
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data[0];
    }
  });
  return resetPasswordRequestModel;
});
