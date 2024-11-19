define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var templatesModel = Backbone.Model.extend({
      idAttribute: "temp_id"
    });
    return templatesModel;
  });
  
  