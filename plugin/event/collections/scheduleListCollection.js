define([
    'underscore',
    'backbone',
    '../models/scheduleModel'
  ], function(_, Backbone,scheduleListModel){
  
    var avablityCollection = Backbone.Collection.extend({
        scheduleID:null,
        model: scheduleListModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'schedulesListMaster';
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