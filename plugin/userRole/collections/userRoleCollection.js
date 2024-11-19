define([
  'underscore',
  'backbone',
  '../models/userRoleModel'
], function(_, Backbone,userRoleModel){

  var userRoleCollection = Backbone.Collection.extend({
      roleID:null,
      model: userRoleModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'userRoleMasterList';
      },
      parse : function(response){
        this.pageinfo = response.paginginfo;
        this.totalRecords = response.totalRecords;
        this.endRecords = response.end;
        this.flag = response.flag;
        this.msg = response.msg;
        this.loadstate = response.loadstate;
        return response.data;
      }
  });

  return userRoleCollection;

});