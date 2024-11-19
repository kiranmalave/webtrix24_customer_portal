define([
  'underscore',
  'backbone',
  '../models/adminModel'
], function(_, Backbone, adminModel){

  var adminCollection = Backbone.Collection.extend({
      adminID:null,
      model: adminModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'admins';
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

  return adminCollection;

});