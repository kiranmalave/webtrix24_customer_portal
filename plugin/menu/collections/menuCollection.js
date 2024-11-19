define([
  'underscore',
  'backbone',
  '../models/menuModel'
], function(_, Backbone,menuModel){

  var menuCollection = Backbone.Collection.extend({
      menuID:null,
      model: menuModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'menuMasterList';
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

  return menuCollection;

});