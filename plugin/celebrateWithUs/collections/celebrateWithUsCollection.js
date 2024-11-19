define([
  'underscore',
  'backbone',
  '../models/celebrateWithUsModel'
], function(_, Backbone,celebrateWithUsModel){

  var celebrateWithUsCollection = Backbone.Collection.extend({
      celWithUsID:null,
      model: celebrateWithUsModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'celebrateWithUsList';
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

  return celebrateWithUsCollection;

});