define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleAccGroupModel = Backbone.Model.extend({
    idAttribute: "accGroupID",
     defaults: {
        accGroupID:null,
        accGroupName:null,
        subGroupYesNo:null,
        mainGroupID:null,
        scheduleNo:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'accGroupMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return singleAccGroupModel;
});
