define([
  'underscore',
  'backbone',
  '../models/eventscheduleModel'
], function(_, Backbone,eventscheduleModel){

  var eventScheduleCollection = Backbone.Collection.extend({
      scheduleID:null,
      model: eventscheduleModel,
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

  return eventScheduleCollection;

});