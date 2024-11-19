define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var registrationFilterModel = Backbone.Model.extend({
      idAttribute: "registration_id",
      defaults: {
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:'t.created_date' ,
        order:'DESC' ,
      }
    });
    return registrationFilterModel;
  });
  
  