define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var campaignsSingleModel = Backbone.Model.extend({
    idAttribute: "campaign_id",
     defaults: {
        campaign_id:null,
        campaign_name: null,
        campaign_type: null,
        campaign_details: null,
        target_audience: null,
        start_date: null,
        execution_period: null,
        end_on: null,
        specific_period_data: null,
        target_table: null,
        target_table_conditions: null,
        created_date:null,
        created_by:null,
        modified_date:null,
        modified_by:null,
        status:null,
    },
  	urlRoot:function(){
      return APIPATH+'campaignsMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return campaignsSingleModel;
});
