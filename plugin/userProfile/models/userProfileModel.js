define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var infoSettingsModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
        adminID:null,
        name:null,
        userName:null,
        email:null,
        password:"",
        roleID:null,
        address:null,
        contactNo:null,
        whatsappNo:null,
        myTarget:null,
        dateOfBirth:null,
        created_date:null,
        lastLogin:null,
        status:'active',
        is_approver:'no',
        photo:null,
        eyeIcon:"fa fa-eye-slash",
        inputType:"password",
        menuId:null,
	},
	urlRoot:function(){
      return APIPATH+'addadmin/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return infoSettingsModel;
});
