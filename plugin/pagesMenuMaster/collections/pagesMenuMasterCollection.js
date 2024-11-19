define([
  'underscore',
  'backbone',
  '../models/pagesMenuMasterModel'
], function(_, Backbone,pagesMenuMasterModel){

  var pagesMenuMasterCollection = Backbone.Collection.extend({
      menuID:null,
      model: pagesMenuMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'pagesMenuMasterList';
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

  return pagesMenuMasterCollection;

});