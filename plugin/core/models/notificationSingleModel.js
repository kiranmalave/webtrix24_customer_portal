define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var notificationSingleModel = Backbone.Model.extend({
    idAttribute: "notification_id",
     defaults: {
        notification_id:null,
        notification_type :null,
        user_type:'system_user',
        action_on:null,
        sys_user_id:'all',
        module_name : null,
        name:null,
        template_id:null,
        field_name:null,
        field_value:null,
        status:'active',
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        record_type:null,
        escalation_time:null,
        escalate_to:null,
        is_assignee_change:'no',
        assignee_id:null,
        esc_time_days: null,
			  esc_time_hrs: null,
			  esc_time_mins: null,
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
