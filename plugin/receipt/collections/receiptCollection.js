define([
  'underscore',
  'backbone',
  '../models/receiptModel'
], function(_, Backbone,customerModel){

  var receiptCollection = Backbone.Collection.extend({
    customer_id:null,
      model: customerModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'receiptMasterList';
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

  return receiptCollection;

});