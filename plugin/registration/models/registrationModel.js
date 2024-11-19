define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var registrationModel = Backbone.Model.extend({
      idAttribute: "registration_id"
    });
    return registrationModel;
  });
  
  