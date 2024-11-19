define([
  'underscore',
  'backbone',
  '../models/deliveryChallanModel'
], function(_, Backbone, singleTaxItem){

  var invoiceItems = Backbone.Collection.extend({
      invoiceID:null,
      customer_id:null,
      model: singleTaxItem,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'deliveryItemList';
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

  return invoiceItems;

});