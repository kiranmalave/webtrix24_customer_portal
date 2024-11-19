define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var emailMasterSingleModel = Backbone.Model.extend({
    idAttribute: "tempID",
     defaults: {
        tempID:null,
        tempUniqueID:null,
        tempName:null,
        readName: null,
        emailContent:null,
        smsContent:null,
        subjectOfEmail:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'emailMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return emailMasterSingleModel;
});
