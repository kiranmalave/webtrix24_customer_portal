define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var loginModel = Backbone.Model.extend({
    idAttribute: "memberID",
    defaults: {
      memberID: null,
      firstName: null,
      lastName: null,
      email: null,
      username: null,
      roleOfUser: null,
      password: null,
      gfcmToken:null,
    },
    urlRoot: function () {
      return APIPATH + 'login';
    },
    parse: function (response) {
      this.keyDetails = response.keyDetails;
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data[0];
    }
  });
  return loginModel;
});

