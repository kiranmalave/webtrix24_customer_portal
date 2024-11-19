define([
  'underscore',
  'backbone',
  '../models/customModel'
], function(_, Backbone,customModel){

  var customCollection = Backbone.Collection.extend({
      model: customModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'getDyData';
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

  return customCollection;

});