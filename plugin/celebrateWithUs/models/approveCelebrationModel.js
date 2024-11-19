define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var approveCelebrationModel = Backbone.Model.extend({
      idAttribute: "celebrate_id",
       defaults: {
        celebrate_id:null,
          confirmation_status:null,
          confirmation_date:null,
          app_event_date:null,
          app_event_time:null,
          event_address:null,
          cci_name:null,
          cci_contact_no:null,
          ankur_contact_no:null,
          No_of_children:null,
          status:'active',
      },
        urlRoot:function(){
        return APIPATH+'celebrationApproved/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return approveCelebrationModel;
  });
  