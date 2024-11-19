define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var verificationModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
        
      
    },
    urlRoot: function () {
      return APIPATH + 'verifyUser';
    },
    parse: function (response) {
      this.keyDetails = response.keyDetails;
      this.flag = response.flag;
      this.msg = response.msg;
      return response.data[0];
    }
  });
  return verificationModel;
});
