define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var adminModel = Backbone.Model.extend({
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
        address:null,
        dateOfBirth:null,
        time_zone: "UTC+05:30",
        whatsappCountryCodeNumber: null,
        google_location: null,
        latitude: null,
        longitude: null,
        created_date:null,
        country_code:null,
        lastLogin:null,
        status:'active',
        is_approver:'no'
	},
	urlRoot:function(){
      return APIPATH+'addadmin/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return adminModel;
});

