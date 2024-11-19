define([
  'underscore',
  'backbone',
  '../models/appointmentModel'
], function(_, Backbone,appointmentModel){

  var appointmentCollection = Backbone.Collection.extend({
      appointmentID:null,
      model: appointmentModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'appointmentList';
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

  return appointmentCollection;

});