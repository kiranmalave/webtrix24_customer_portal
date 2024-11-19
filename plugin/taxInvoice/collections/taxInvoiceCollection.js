define([
  'underscore',
  'backbone',
  '../models/taxInvoiceModel'
], function(_, Backbone, taxInvoiceModel){

  var taxInvoiceCollection = Backbone.Collection.extend({
      invoiceID:null,
      model: taxInvoiceModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'taxInvoiceList';
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

  return taxInvoiceCollection;

});