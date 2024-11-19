define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var companyFilterOptionModel = Backbone.Model.extend({
        idAttribute: "infoID",
         defaults:{
          status:'active',
          textSearch: '',
          textval: null,
          orderBy:'t.created_date' ,
          order:'DESC' ,
      }
    });
    return companyFilterOptionModel;
  });
  
  