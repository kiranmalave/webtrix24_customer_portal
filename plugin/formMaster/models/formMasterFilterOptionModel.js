define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "formID",
  	 defaults:{
        textSearch:'status',
        textval: null,
        status:'active,inactive',
        orderBy:'created_date',
        order:'DESC' ,
    }
  });
  return formMasterFilterOptionModel;
});

