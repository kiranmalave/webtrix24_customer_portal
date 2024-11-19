define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var declinedReasonModel = Backbone.Model.extend({
    idAttribute: "celebrate_id",
     defaults: {
        celebrate_id:null,
        reason:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'celebrationDeclined/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return declinedReasonModel;
});
