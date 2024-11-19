define([
  'underscore',
  'backbone',
  '../models/prefixModel'
], function(_, Backbone,prefixModel){

  var prefixCollection = Backbone.Collection.extend({
      donorID:null,
      model: prefixModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'prefixList';
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

  return prefixCollection;

});