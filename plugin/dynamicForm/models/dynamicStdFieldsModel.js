define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var dynamicStdFieldsModel = Backbone.Model.extend({
      idAttribute: "menuID",
       defaults: {
          menuID:null,
      },
    });
    return dynamicStdFieldsModel;
  });