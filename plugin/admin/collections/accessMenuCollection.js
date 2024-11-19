define([
  'underscore',
  'backbone',
  '../models/menuAccess'
], function(_, Backbone, menuAccess){

  var accessMenuCollection = Backbone.Collection.extend({
      roleID:null,
      roleList:null,
      model: menuAccess,
      initialize : function(){
      },
      url : function() {
        return APIPATH+'accessMenuList/'+this.roleID;
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

  return accessMenuCollection;

});