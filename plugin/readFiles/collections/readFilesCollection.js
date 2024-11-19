define([
  'underscore',
  'backbone',
  '../models/readFilesModel'
], function(_, Backbone,readFilesModel){

  var readFilesCollection = Backbone.Collection.extend({
      menuID:null,
      model: readFilesModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'readSeverFiles';
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

  return readFilesCollection;

});