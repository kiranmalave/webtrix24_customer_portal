define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var sectionModel = Backbone.Model.extend({
      idAttribute: "section_id",
      defaults: {
        section_id:null,
        section_name:null,
    },      
    });
    return sectionModel;
  });
  
  