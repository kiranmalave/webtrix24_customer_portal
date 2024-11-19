define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var userRoleFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "roleID",
  	 defaults:{
        textSearch:'roleName',
        textval: null,
        status:'active',
        orderBy:'t.created_date',
        order:'DESC' ,
    }
  });
  return userRoleFilterOptionModel;
});

