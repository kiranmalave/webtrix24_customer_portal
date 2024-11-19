define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var loginTemplateModel = Backbone.Model.extend({
      idAttribute: "slide_id"
    });
    return loginTemplateModel;
  });