define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var courseTriggerModel = Backbone.Model.extend({
    idAttribute: "schema_id",
     defaults: {
        schema_id:null,
        notification_type :null,
        trigger_type:null,
        action:null,
        inteval_span:null,
        interval_type:null,
        stop_type:null,
        total_complete_interval:null,
        end_date:null,
        send_on:null,
        date_condition:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },  
  	urlRoot:function(){
      return APIPATH+'courseTrigger/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return courseTriggerModel;
});
