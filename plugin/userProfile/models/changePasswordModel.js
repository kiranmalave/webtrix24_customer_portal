define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var changePasswordModel = Backbone.Model.extend({
      idAttribute: "adminID",
      defaults: {
        adminID: null,
        current_password: null,
        new_password: null,
        confirm_password: null,
        isUpdatePassword: null,
      },
      urlRoot:function(){
        return APIPATH+'changePassword/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return changePasswordModel;
  });
  