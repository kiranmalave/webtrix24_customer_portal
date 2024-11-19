define([
  'underscore',
  'backbone',
  '../models/linkedFormModel'
], function(_, Backbone,linkedFormModel){

  var linkedFormCollection = Backbone.Collection.extend({
    menuID:null,
      model: linkedFormModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'linkedFormData';
      },
      parse : function(response){
        return response.data;
      }
  });

  return linkedFormCollection;

});