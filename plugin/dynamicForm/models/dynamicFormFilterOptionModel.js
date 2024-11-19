define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var userRoleFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "fieldID",
  	 defaults:{
        // textSearch:'fieldLabel',
        // textval: null,
        // status:'subactivescribe',
        // orderBy:'fieldLabel',
        // order:'DESC',
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:null ,
        order:null ,
    }
  });
  return userRoleFilterOptionModel;
});

