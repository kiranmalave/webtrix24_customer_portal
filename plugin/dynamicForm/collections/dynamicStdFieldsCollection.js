
define([
    'underscore',
    'backbone',
    '../models/dynamicStdFieldsModel'
  ], function(_, Backbone,dynamicStdFieldsModel){
  
    var dynamicStdFieldsCollection = Backbone.Collection.extend({
      menuID:null,
        model: dynamicStdFieldsModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'getDefinations';
        },
        parse : function(response){
          return response.data;
        }
    });
  
    return dynamicStdFieldsCollection;
  
  });