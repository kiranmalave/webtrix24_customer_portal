define([
  'underscore',
  'backbone',
  '../models/productStockModel'
], function(_, Backbone, productStockModel){

  var purchaseItems = Backbone.Collection.extend({
      purchase_id:null,
      
      model: productStockModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'purchaseItemList';
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

  return purchaseItems;

});