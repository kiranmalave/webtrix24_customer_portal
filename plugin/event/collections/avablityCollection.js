define([
  'underscore',
  'backbone',
  '../models/avablityModel'
], function(_, Backbone,avablityModel){

  var avablityCollection = Backbone.Collection.extend({
      scheduleID:null,
      model: avablityModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'schedulesMasterList';
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

  return avablityCollection;

});