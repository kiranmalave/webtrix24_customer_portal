define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var registrationSingleModel = Backbone.Model.extend({
      idAttribute: "registration_id",
       defaults: {
          registration_id:null,
          firstname:null,
          status:'active',
      },
        urlRoot:function(){
        return APIPATH+'registration/'
      },
      parse : function(response) {
          return response.data[0];
      }
    });
    return registrationSingleModel;
  });