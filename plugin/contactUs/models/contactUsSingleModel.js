define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var faqSingleModel = Backbone.Model.extend({
      idAttribute: "contactUsID",
       defaults: {
        fullName:null,
        email:null,
        contactNo:null,
        website:null,
        details:null,
        contactUsID:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:"active",
      },
        urlRoot:function(){
        return APIPATH+'contactUs/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return faqSingleModel;
  });