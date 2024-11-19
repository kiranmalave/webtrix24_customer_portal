define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var notificationSingleModel = Backbone.Model.extend({
      idAttribute: "notification_id",
       defaults: {
          notification_id:null,
          notification_type :null,
          user_type:null,
          action_on:null,
          module_name : null,
          name:null,
          template_id:null,
          field_name:null,
          field_value:null,
          status:null,
          created_by:null,
          modified_by:null,
          created_date:null,
          modified_date:null,
          record_type:null,
          
      },  
        urlRoot:function(){
        return APIPATH+'notificationMaster/'
      },
      parse : function(response) {
          return response.data[0];
        }
    });
    return notificationSingleModel;
  });
  