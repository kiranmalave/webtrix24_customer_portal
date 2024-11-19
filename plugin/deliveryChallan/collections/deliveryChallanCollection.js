define([
  'underscore',
  'backbone',
  '../models/deliveryChallanModel'
], function(_, Backbone, deliveryChallanModel){

  var deliveryChallanCollection = Backbone.Collection.extend({
      invoiceID:null,
      model: deliveryChallanModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'deliveryChallanList';
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

  return deliveryChallanCollection;

});