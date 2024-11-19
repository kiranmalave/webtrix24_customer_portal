define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var filterSingleModel = Backbone.Model.extend({
    idAttribute: "filter_id",
     defaults: {
      filter_id:null,
      is_default:'no',
      user_id:null,
      menu_id:null,
      filter_name:null,
      conditions:null,
      created_by:null,
      created_date:null,
      modified_by:null,
      modified_date:null,
      status:'active'
    },  
  	urlRoot:function(){
      return APIPATH+'filterMaster/'
    },
    parse : function(response) {
      return response.data[0];
    }
  });
  return filterSingleModel;
});
