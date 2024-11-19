define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleuserRoleModel = Backbone.Model.extend({
    idAttribute: "roleID",
     defaults: {
        roleID:null,
        roleName:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'userRoleMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return singleuserRoleModel;
});
