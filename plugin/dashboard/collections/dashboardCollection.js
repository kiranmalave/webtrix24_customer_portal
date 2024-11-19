define([
  'underscore',
  'backbone',
  '../models/dashboardModel'
], function(_, Backbone,dashboardModel){

  var dashboardCollection = Backbone.Collection.extend({
    customer_id:null,
      model: dashboardModel,
      loadstate: true,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'dashboardList';
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

  return dashboardCollection;

});