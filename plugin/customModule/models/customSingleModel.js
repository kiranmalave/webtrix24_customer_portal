define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var customSingleModel = Backbone.Model.extend({
    idAttribute: "id",
     defaults: {
    },
  	urlRoot:function(){
      return APIPATH+'saveDyData/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return customSingleModel;
});
