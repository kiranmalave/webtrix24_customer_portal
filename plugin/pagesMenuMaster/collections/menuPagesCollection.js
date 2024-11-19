define([
  'underscore',
  'backbone',
  '../models/menuPagesModel'
], function(_, Backbone,menuPagesModel){

  var menuPagesCollection = Backbone.Collection.extend({
      menuID:null,
      model: menuPagesModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'menuPagesList';
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

  return menuPagesCollection;

});