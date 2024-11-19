define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var customerFilterOptionModel = Backbone.Model.extend({
      idAttribute: "id",
      defaults: {
        textSearch: '',
        textval: null,
        fromDate: null,
        toDate: null,
        orderBy:null ,//'created_date'
        order:null ,//'ASC'
      }
    });
    return customerFilterOptionModel;
  });
  
  