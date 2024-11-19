define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var campaignsFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "campaignsID",
  	 defaults:{
        // textSearch:'name',
        // textval: null,
        // status:'Active',
        // orderBy:'created_date',
        // order:'DESC',
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:'created_date' ,
        order:'DESC' ,
    }
  });
  return campaignsFilterOptionModel;
});

