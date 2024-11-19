define([
  'underscore',
  'backbone',
  '../models/notificationModel'
], function(_, Backbone,notificationModel){

  var notificationCollection = Backbone.Collection.extend({
      notification_id:null,
      model: notificationModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'notificationMasterList';
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

  return notificationCollection;

});