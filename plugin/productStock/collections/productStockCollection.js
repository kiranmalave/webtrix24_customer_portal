define([
  'underscore',
  'backbone',
  '../models/productStockModel'
], function(_, Backbone, productStockModel){

  var productStockCollection = Backbone.Collection.extend({
      stockTableID:null,
      model: productStockModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'stockMasterList';
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

  return productStockCollection;

});