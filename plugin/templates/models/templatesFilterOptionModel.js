define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var templatesFilterOptionModel = Backbone.Model.extend({
        idAttribute: "temp_id",
        defaults:{
            status:'active',
            textSearch: null,
            textval: null,
            orderBy:'t.created_date' ,
            order:'DESC' ,
        }
    });
    return templatesFilterOptionModel;
  });
  
  