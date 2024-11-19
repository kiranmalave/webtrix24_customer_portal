define([
  'underscore',
  'backbone',
  '../models/eventModel'
], function(_, Backbone,eventModel){

  var eventCollection = Backbone.Collection.extend({
      faqID:null,
      model: eventModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'eventList';
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

  return eventCollection;

});