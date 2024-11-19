define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var celebrateWithUsSingleModel = Backbone.Model.extend({
    idAttribute: "celebrate_id",
     defaults: {
        celebrate_id:null,
        prefix:null,
        req_by_name:null,
        poc:null,
        poc_name:null,
        point_of_contact_name_nther:null,
        address:null,
        contact_no:null,
        whtasapp_no:null,
        email_id:null,
        area:null,
        other_area:null,
        occasion:null,
        other_occasion:null,
        expDate_of_event:null,
        confirmation_status:"Pending",
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'celebrateWithUs/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return celebrateWithUsSingleModel;
});
