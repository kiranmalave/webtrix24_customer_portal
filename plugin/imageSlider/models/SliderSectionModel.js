define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var SliderSectionModel = Backbone.Model.extend({
      idAttribute: "item_id"
    });
    return SliderSectionModel;
  });
  
  