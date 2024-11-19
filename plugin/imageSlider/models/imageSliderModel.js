define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var imageSliderModel = Backbone.Model.extend({
      idAttribute: "slider_id"
    });
    return imageSliderModel;
  });
  
  