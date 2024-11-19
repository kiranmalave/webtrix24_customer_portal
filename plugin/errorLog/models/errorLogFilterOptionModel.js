define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
    var errorLogFilterModels = Backbone.Model.extend({
      idAttribute: "errorID",
      defaults: {
        textSearch: '',
        textval: null,
        orderBy:'errorTime' ,
        order:'DESC' ,
        status: 'active',
      }
    });
    return errorLogFilterModels;
  });